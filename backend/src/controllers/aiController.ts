import type { Response } from 'express';
import { getPortfolioDetail } from '../services/portfolioService.js';
import { stockService } from '../services/stockService.js';
import { aiInsightsService } from '../services/ai/aiInsightsService.js';
import type { AuthenticatedRequest } from '../types/index.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type {
  MarketSnapshotInput,
  PortfolioSnapshotInput,
  StockSnapshotInput
} from '../services/ai/promptBuilders.js';

type SymbolParams = {
  symbol: string;
};

type PortfolioParams = {
  id: string;
};

function getUserId(req: AuthenticatedRequest): string {
  if (!req.user?.id) {
    throw new AppError(401, 'Unauthorized');
  }

  return req.user.id;
}

async function buildStockSnapshot(symbol: string): Promise<StockSnapshotInput> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const [quote, searchResults, news] = await Promise.all([
    stockService.getQuote(normalizedSymbol),
    stockService.searchStocks(normalizedSymbol, { limit: 10 }),
    stockService.getNews(normalizedSymbol, { limit: 6 })
  ]);

  const canonical = searchResults.find((item) => item.symbol.toUpperCase() === normalizedSymbol);

  return {
    symbol: quote.symbol,
    companyName: canonical?.description,
    exchange: canonical?.exchange,
    price: quote.price,
    dayChangePercent: quote.changePercent,
    recentNewsHeadlines: news.map((item) => item.headline).slice(0, 6)
  };
}

async function buildPortfolioSnapshot(userId: string, portfolioId: string): Promise<PortfolioSnapshotInput> {
  const detail = await getPortfolioDetail(userId, portfolioId);

  if (detail.holdings.length === 0) {
    throw new AppError(422, 'Portfolio has no holdings to analyze');
  }

  return {
    baseCurrency: detail.baseCurrency,
    holdings: detail.holdings.map((holding) => ({
      symbol: holding.symbol,
      quantity: holding.quantity,
      averagePrice: holding.averagePrice,
      currentPrice: holding.currentPrice ?? holding.averagePrice,
      country: holding.country,
      currency: detail.baseCurrency
    }))
  };
}

async function buildMarketSnapshot(): Promise<MarketSnapshotInput> {
  const indexUniverse: Array<{ symbol: string; name: string }> = [
    { symbol: 'SPY', name: 'S&P 500 (SPY)' },
    { symbol: 'QQQ', name: 'Nasdaq 100 (QQQ)' },
    { symbol: 'DIA', name: 'Dow Jones (DIA)' },
    { symbol: 'IWM', name: 'Russell 2000 (IWM)' }
  ];

  const quoteResults = await Promise.allSettled(indexUniverse.map((index) => stockService.getQuote(index.symbol)));

  const indices = quoteResults
    .map((result, idx) => ({ result, index: indexUniverse[idx] }))
    .filter((entry) => entry.result.status === 'fulfilled')
    .map((entry) => ({
      name: entry.index.name,
      price: (entry.result as PromiseFulfilledResult<{ price: number; changePercent: number }>).value.price,
      dayChangePercent: (entry.result as PromiseFulfilledResult<{ price: number; changePercent: number }>).value
        .changePercent
    }));

  if (indices.length === 0) {
    throw new AppError(502, 'Unable to build market sentiment snapshot from upstream providers');
  }

  const averageChange = indices.reduce((acc, item) => acc + item.dayChangePercent, 0) / indices.length;
  const advancing = indices.filter((item) => item.dayChangePercent > 0).length;

  const macroSignals = [
    `Average major index day change: ${averageChange.toFixed(2)}%`,
    `${advancing}/${indices.length} tracked indices are advancing today`
  ];

  const [volatilityResult, newsResult] = await Promise.allSettled([
    stockService.getQuote('^VIX'),
    stockService.getNews('SPY', { limit: 8 })
  ]);

  return {
    region: 'US',
    asOf: new Date().toISOString(),
    indices,
    volatilityIndex:
      volatilityResult.status === 'fulfilled'
        ? {
            name: 'VIX',
            value: volatilityResult.value.price,
            dayChangePercent: volatilityResult.value.changePercent
          }
        : undefined,
    macroSignals,
    newsHeadlines:
      newsResult.status === 'fulfilled' ? newsResult.value.map((item) => item.headline).slice(0, 8) : undefined
  };
}

export const getStockAnalysisController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const params = (req as AuthenticatedRequest & { validatedParams: SymbolParams }).validatedParams;
  const userId = getUserId(req);
  const snapshot = await buildStockSnapshot(params.symbol);
  const insight = await aiInsightsService.getStockAnalysis(userId, snapshot);

  res.status(200).json({
    symbol: snapshot.symbol,
    insightId: insight.insightId,
    generatedAt: insight.generatedAt,
    cache: {
      hit: insight.cacheHit,
      source: insight.source
    },
    analysis: insight.output
  });
});

export const getPortfolioAnalysisController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const params = (req as AuthenticatedRequest & { validatedParams: PortfolioParams }).validatedParams;
  const userId = getUserId(req);
  const snapshot = await buildPortfolioSnapshot(userId, params.id);
  const insight = await aiInsightsService.getPortfolioAnalysis(userId, params.id, snapshot);

  res.status(200).json({
    portfolioId: params.id,
    insightId: insight.insightId,
    generatedAt: insight.generatedAt,
    cache: {
      hit: insight.cacheHit,
      source: insight.source
    },
    analysis: insight.output
  });
});

export const getMarketSentimentController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req);
  const snapshot = await buildMarketSnapshot();
  const insight = await aiInsightsService.getMarketSentiment(userId, snapshot.region || 'GLOBAL', snapshot);

  res.status(200).json({
    scope: snapshot.region || 'GLOBAL',
    insightId: insight.insightId,
    generatedAt: insight.generatedAt,
    cache: {
      hit: insight.cacheHit,
      source: insight.source
    },
    sentiment: insight.output
  });
});

import type { Request, Response } from 'express';
import { stockService } from '../services/stockService.js';
import type { StockProvider } from '../services/stockTypes.js';
import { asyncHandler } from '../utils/asyncHandler.js';

type SymbolParams = {
  symbol: string;
};

type SearchQuery = {
  q: string;
  limit: number;
  exchange?: string;
};

type QuoteQuery = {
  provider?: StockProvider;
};

type ChartQuery = {
  resolution: '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M';
  from?: string;
  to?: string;
  limit: number;
};

type NewsQuery = {
  from?: string;
  to?: string;
  limit: number;
};

export const getMarketsController = asyncHandler(async (_req: Request, res: Response) => {
  const markets = await stockService.getMarkets();
  res.status(200).json({ markets });
});

export const searchStocksController = asyncHandler(async (req: Request, res: Response) => {
  const query = (req as Request & { validatedQuery: SearchQuery }).validatedQuery;
  const results = await stockService.searchStocks(query.q, {
    limit: query.limit,
    exchange: query.exchange
  });

  res.status(200).json({ results, total: results.length });
});

export const getStockQuoteController = asyncHandler(async (req: Request, res: Response) => {
  const params = (req as Request & { validatedParams: SymbolParams }).validatedParams;
  const query = (req as Request & { validatedQuery: QuoteQuery }).validatedQuery;
  const quote = await stockService.getQuote(params.symbol, query.provider);
  res.status(200).json({ quote });
});

export const getStockChartController = asyncHandler(async (req: Request, res: Response) => {
  const params = (req as Request & { validatedParams: SymbolParams }).validatedParams;
  const query = (req as Request & { validatedQuery: ChartQuery }).validatedQuery;
  const points = await stockService.getChart(params.symbol, {
    resolution: query.resolution,
    from: query.from,
    to: query.to,
    limit: query.limit
  });

  res.status(200).json({
    symbol: params.symbol,
    points,
    total: points.length
  });
});

export const getStockNewsController = asyncHandler(async (req: Request, res: Response) => {
  const params = (req as Request & { validatedParams: SymbolParams }).validatedParams;
  const query = (req as Request & { validatedQuery: NewsQuery }).validatedQuery;
  const news = await stockService.getNews(params.symbol, {
    from: query.from,
    to: query.to,
    limit: query.limit
  });

  res.status(200).json({
    symbol: params.symbol,
    news,
    total: news.length
  });
});

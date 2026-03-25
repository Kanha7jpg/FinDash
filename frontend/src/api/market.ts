import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type {
  CountrySectionData,
  MarketInfo,
  MarketOverviewCard,
  StockChartPoint,
  StockNewsItem,
  StockQuote,
  StockSearchResult
} from '@/types';

export async function getMarkets(): Promise<MarketInfo[]> {
  const { data } = await apiClient.get<{ markets: MarketInfo[] }>(API_ENDPOINTS.market.markets);
  return data.markets;
}

export async function searchStocks(query: string, limit = 10, exchange?: string): Promise<StockSearchResult[]> {
  const { data } = await apiClient.get<{ results: StockSearchResult[] }>(API_ENDPOINTS.market.search, {
    params: {
      q: query,
      limit,
      exchange
    }
  });
  return data.results;
}

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const { data } = await apiClient.get<{ quote: StockQuote }>(API_ENDPOINTS.market.quote(symbol));
  return data.quote;
}

export async function getStockChart(symbol: string, resolution = 'D', limit = 60): Promise<StockChartPoint[]> {
  const { data } = await apiClient.get<{ points: StockChartPoint[] }>(API_ENDPOINTS.market.chart(symbol), {
    params: {
      resolution,
      limit
    }
  });

  return data.points;
}

export async function getStockNews(symbol: string, limit = 5): Promise<StockNewsItem[]> {
  const { data } = await apiClient.get<{ news: StockNewsItem[] }>(API_ENDPOINTS.market.news(symbol), {
    params: {
      limit
    }
  });

  return data.news;
}

export async function getMarketOverviewCards(symbols: string[]): Promise<MarketOverviewCard[]> {
  const quotes = await Promise.all(symbols.map((symbol) => getStockQuote(symbol)));

  return quotes.map((quote) => ({
    symbol: quote.symbol,
    name: quote.symbol,
    value: quote.price,
    change: quote.change,
    changePercent: quote.changePercent
  }));
}

export async function getCountrySectionData(country: string, symbols: string[]): Promise<CountrySectionData> {
  const quotes = await Promise.all(symbols.map((symbol) => getStockQuote(symbol)));

  return {
    country,
    stocks: quotes.map((quote) => ({
      symbol: quote.symbol,
      name: quote.symbol,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent
    }))
  };
}

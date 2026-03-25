export type StockProvider = 'iex' | 'finnhub' | 'alphaVantage';

export type NormalizedStockQuote = {
  provider: StockProvider;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  timestamp: string;
};

export type StockDataClient = {
  readonly provider: StockProvider;
  getQuote(symbol: string): Promise<NormalizedStockQuote>;
};

export type MarketInfo = {
  code: string;
  name: string;
  currency: string;
  timezone: string;
};

export type StockSearchResult = {
  symbol: string;
  description: string;
  type?: string;
  exchange?: string;
};

export type StockChartPoint = {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export type StockNewsItem = {
  id: string;
  source: string;
  headline: string;
  summary: string;
  url: string;
  publishedAt: string;
  image?: string;
};

export type User = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
};

export type AuthTokens = {
  accessToken: string;
};

export type AuthResponse = {
  user: User;
  tokens: AuthTokens;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export type ApiError = {
  message: string;
  details?: Record<string, string[] | undefined>;
};

export type RetriableRequestConfig = {
  _retry?: boolean;
  headers?: Record<string, string>;
};

export type MarketInfo = {
  code: string;
  name: string;
  currency: string;
  timezone: string;
};

export type StockQuote = {
  provider: 'iex' | 'finnhub' | 'alphaVantage';
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  timestamp: string;
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

export type MarketOverviewCard = {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
};

export type StockCardData = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
};

export type CountrySectionData = {
  country: string;
  stocks: StockCardData[];
};

export type WatchlistStockItem = {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  country: string;
  notes: string | null;
  addedAt: string;
};

export type Watchlist = {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  items: WatchlistStockItem[];
};

export type CreateWatchlistPayload = {
  name: string;
  description?: string;
};

export type AddWatchlistStockPayload = {
  symbol: string;
  name?: string;
  exchange?: string;
  country?: string;
  notes?: string;
};

export type UpdateWatchlistStockPayload = {
  notes?: string;
};

export type PortfolioSummary = {
  id: string;
  name: string;
  description: string | null;
  baseCurrency: string;
  createdAt: string;
  updatedAt: string;
  holdingsCount: number;
  transactionsCount: number;
};

export type PortfolioHolding = {
  symbol: string;
  name: string;
  exchange: string;
  country: string;
  quantity: number;
  averagePrice: number;
  costBasis: number;
  currentPrice: number | null;
  marketValue: number | null;
  unrealizedPnl: number | null;
  unrealizedPnlPercent: number | null;
};

export type PortfolioTransaction = {
  id: string;
  symbol: string;
  stockName: string;
  type: 'BUY' | 'SELL' | string;
  quantity: number;
  price: number;
  fee: number;
  currency: string;
  executedAt: string;
  createdAt: string;
};

export type PortfolioDetail = {
  id: string;
  name: string;
  description: string | null;
  baseCurrency: string;
  createdAt: string;
  updatedAt: string;
  totals: {
    totalCostBasis: number;
    totalMarketValue: number | null;
    totalUnrealizedPnl: number | null;
  };
  holdings: PortfolioHolding[];
  transactions: PortfolioTransaction[];
};

export type CreatePortfolioPayload = {
  name: string;
  description?: string;
  baseCurrency?: string;
};

export type CreatePortfolioTransactionPayload = {
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  fee?: number;
  currency?: string;
  executedAt: string;
};

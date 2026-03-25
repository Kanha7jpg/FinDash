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

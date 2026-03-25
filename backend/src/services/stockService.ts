import { env } from '../config/environment.js';
import { AppError } from '../utils/appError.js';
import { AlphaVantageClient } from './alphaVantageClient.js';
import { FinnhubClient } from './finnhubClient.js';
import { IexClient } from './iexClient.js';
import type {
  MarketInfo,
  NormalizedStockQuote,
  StockChartPoint,
  StockDataClient,
  StockNewsItem,
  StockProvider,
  StockSearchResult
} from './stockTypes.js';

export type {
  MarketInfo,
  NormalizedStockQuote,
  StockChartPoint,
  StockDataClient,
  StockNewsItem,
  StockProvider,
  StockSearchResult
} from './stockTypes.js';

type ChartResolution = '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M';

type CacheStore = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
};

type StockServiceOptions = {
  clients?: StockDataClient[];
  cache?: CacheStore;
  cacheTTLSeconds?: number;
};

type SearchOptions = {
  limit: number;
  exchange?: string;
};

type ChartOptions = {
  resolution: ChartResolution;
  from?: string;
  to?: string;
  limit: number;
};

type NewsOptions = {
  from?: string;
  to?: string;
  limit: number;
};

class MemoryCacheStore implements CacheStore {
  private readonly store = new Map<string, { value: string; expiresAt: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() >= item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }
}

class RedisRestCacheStore implements CacheStore {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string
  ) {}

  async get(key: string): Promise<string | null> {
    const response = await fetch(`${this.baseUrl}/get/${encodeURIComponent(key)}`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    });

    if (!response.ok) {
      throw new AppError(503, 'Redis cache get failed', { status: response.status });
    }

    const payload = (await response.json()) as { result?: string | null };
    return payload.result ?? null;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/setex/${encodeURIComponent(key)}/${ttlSeconds}/${encodeURIComponent(value)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      }
    );

    if (!response.ok) {
      throw new AppError(503, 'Redis cache set failed', { status: response.status });
    }
  }
}

class ResilientCacheStore implements CacheStore {
  constructor(
    private readonly fallback: CacheStore,
    private readonly primary?: CacheStore
  ) {}

  async get(key: string): Promise<string | null> {
    if (this.primary) {
      try {
        const value = await this.primary.get(key);

        if (value !== null) {
          return value;
        }
      } catch {
        return this.fallback.get(key);
      }
    }

    return this.fallback.get(key);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (this.primary) {
      try {
        await this.primary.set(key, value, ttlSeconds);
        return;
      } catch {
        await this.fallback.set(key, value, ttlSeconds);
        return;
      }
    }

    await this.fallback.set(key, value, ttlSeconds);
  }
}

function createDefaultCache(): CacheStore {
  const memoryCache = new MemoryCacheStore();

  if (env.REDIS_REST_URL && env.REDIS_REST_TOKEN) {
    const redisCache = new RedisRestCacheStore(env.REDIS_REST_URL, env.REDIS_REST_TOKEN);
    return new ResilientCacheStore(memoryCache, redisCache);
  }

  return memoryCache;
}

export class StockService {
  private readonly clients: StockDataClient[];
  private readonly cache: CacheStore;
  private readonly cacheTTLSeconds: number;
  private readonly finnhubClient: FinnhubClient;
  private readonly iexClient: IexClient;
  private readonly alphaVantageClient: AlphaVantageClient;

  constructor(options: StockServiceOptions = {}) {
    this.finnhubClient = new FinnhubClient();
    this.iexClient = new IexClient();
    this.alphaVantageClient = new AlphaVantageClient();
    this.clients = options.clients ?? [this.finnhubClient, this.iexClient, this.alphaVantageClient];
    this.cache = options.cache ?? createDefaultCache();
    this.cacheTTLSeconds = options.cacheTTLSeconds ?? env.STOCK_CACHE_TTL_SECONDS;
  }

  async getMarkets(): Promise<MarketInfo[]> {
    const cacheKey = 'stock:markets';
    const cached = await this.getFromCache<MarketInfo[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const fallbackMarkets: MarketInfo[] = [
      { code: 'US', name: 'United States', currency: 'USD', timezone: 'America/New_York' },
      { code: 'L', name: 'London Stock Exchange', currency: 'GBP', timezone: 'Europe/London' },
      { code: 'TO', name: 'Toronto Stock Exchange', currency: 'CAD', timezone: 'America/Toronto' },
      { code: 'HK', name: 'Hong Kong Exchanges', currency: 'HKD', timezone: 'Asia/Hong_Kong' }
    ];

    try {
      const markets = await this.finnhubClient.getMarkets();

      if (markets.length > 0) {
        await this.setInCache(cacheKey, markets);
        return markets;
      }
    } catch {
      // Keep fallback markets when provider call fails.
    }

    await this.setInCache(cacheKey, fallbackMarkets);
    return fallbackMarkets;
  }

  async searchStocks(query: string, options: SearchOptions): Promise<StockSearchResult[]> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      throw new AppError(400, 'Search query is required');
    }

    const cacheKey = `stock:search:${normalizedQuery.toLowerCase()}:${options.limit}:${options.exchange || 'all'}`;
    const cached = await this.getFromCache<StockSearchResult[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const resultSets = await Promise.allSettled([
      this.finnhubClient.searchStocks(normalizedQuery, options.limit),
      this.alphaVantageClient.searchStocks(normalizedQuery, options.limit)
    ]);

    const combined = new Map<string, StockSearchResult>();

    for (const resultSet of resultSets) {
      if (resultSet.status !== 'fulfilled') {
        continue;
      }

      for (const item of resultSet.value) {
        const key = item.symbol.toUpperCase();

        if (!combined.has(key)) {
          combined.set(key, item);
        }
      }
    }

    let results = Array.from(combined.values());

    if (options.exchange) {
      const exchangeFilter = options.exchange.toLowerCase();
      results = results.filter((item) => item.exchange?.toLowerCase().includes(exchangeFilter));
    }

    results = results.slice(0, options.limit);
    await this.setInCache(cacheKey, results);
    return results;
  }

  async getQuote(symbol: string, preferredProvider?: StockProvider): Promise<NormalizedStockQuote> {
    const normalizedSymbol = symbol.trim().toUpperCase();

    if (!normalizedSymbol) {
      throw new AppError(400, 'Symbol is required');
    }

    const cacheKey = `stock:quote:${normalizedSymbol}:${preferredProvider || 'auto'}`;
    const cachedQuote = await this.getFromCache<NormalizedStockQuote>(cacheKey);

    if (cachedQuote) {
      return cachedQuote;
    }

    const orderedClients = this.getOrderedClients(preferredProvider);
    const failures: Array<{ provider: StockProvider; message: string }> = [];

    for (const client of orderedClients) {
      try {
        const quote = await client.getQuote(normalizedSymbol);
        await this.setInCache(cacheKey, quote);
        return quote;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown provider failure';
        failures.push({ provider: client.provider, message });
      }
    }

    throw new AppError(502, `Failed to fetch stock quote for ${normalizedSymbol}`, failures);
  }

  async getChart(symbol: string, options: ChartOptions): Promise<StockChartPoint[]> {
    const normalizedSymbol = symbol.trim().toUpperCase();

    if (!normalizedSymbol) {
      throw new AppError(400, 'Symbol is required');
    }

    const fromDate = options.from ? new Date(options.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = options.to ? new Date(options.to) : new Date();

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      throw new AppError(422, 'Invalid date range');
    }

    const cacheKey =
      `stock:chart:${normalizedSymbol}:${options.resolution}:` +
      `${fromDate.toISOString()}:${toDate.toISOString()}:${options.limit}`;
    const cached = await this.getFromCache<StockChartPoint[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const fromUnix = Math.floor(fromDate.getTime() / 1000);
    const toUnix = Math.floor(toDate.getTime() / 1000);

    try {
      const chart = await this.finnhubClient.getCandles(normalizedSymbol, options.resolution, fromUnix, toUnix);
      const limited = chart.slice(-options.limit);
      await this.setInCache(cacheKey, limited);
      return limited;
    } catch {
      const fallbackChart = await this.alphaVantageClient.getDailyChart(normalizedSymbol, options.limit);
      await this.setInCache(cacheKey, fallbackChart);
      return fallbackChart;
    }
  }

  async getNews(symbol: string, options: NewsOptions): Promise<StockNewsItem[]> {
    const normalizedSymbol = symbol.trim().toUpperCase();

    if (!normalizedSymbol) {
      throw new AppError(400, 'Symbol is required');
    }

    const toDate = options.to ? new Date(options.to) : new Date();
    const fromDate = options.from
      ? new Date(options.from)
      : new Date(toDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      throw new AppError(422, 'Invalid date range');
    }

    const from = fromDate.toISOString().slice(0, 10);
    const to = toDate.toISOString().slice(0, 10);
    const cacheKey = `stock:news:${normalizedSymbol}:${from}:${to}:${options.limit}`;
    const cached = await this.getFromCache<StockNewsItem[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const news = await this.finnhubClient.getCompanyNews(normalizedSymbol, from, to, options.limit);
    await this.setInCache(cacheKey, news);
    return news;
  }

  private getOrderedClients(preferredProvider?: StockProvider): StockDataClient[] {
    if (!preferredProvider) {
      return this.clients;
    }

    const preferred = this.clients.filter((client) => client.provider === preferredProvider);
    const remaining = this.clients.filter((client) => client.provider !== preferredProvider);

    return [...preferred, ...remaining];
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    const rawValue = await this.cache.get(key);

    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      return null;
    }
  }

  private async setInCache<T>(key: string, value: T): Promise<void> {
    await this.cache.set(key, JSON.stringify(value), this.cacheTTLSeconds);
  }
}

export const stockService = new StockService();

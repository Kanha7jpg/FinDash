import { env } from '../config/environment.js';
import { AppError } from '../utils/appError.js';
import type {
  MarketInfo,
  NormalizedStockQuote,
  StockChartPoint,
  StockDataClient,
  StockNewsItem,
  StockSearchResult
} from './stockTypes.js';

type FinnhubQuoteResponse = {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
};

type FinnhubSearchResponse = {
  count?: number;
  result?: Array<{
    description?: string;
    displaySymbol?: string;
    symbol?: string;
    type?: string;
  }>;
};

type FinnhubCandlesResponse = {
  c?: number[];
  h?: number[];
  l?: number[];
  o?: number[];
  t?: number[];
  v?: number[];
  s?: string;
};

type FinnhubNewsResponse = Array<{
  id?: number;
  source?: string;
  headline?: string;
  summary?: string;
  url?: string;
  datetime?: number;
  image?: string;
}>;

type FinnhubExchangeResponse = Array<{
  code?: string;
  mic?: string;
  name?: string;
  currency?: string;
  timezone?: string;
}>;

const REQUEST_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return true;
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return true;
  }

  return false;
}

function toFiniteNumber(value: unknown, field: string): number {
  const parsed = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    throw new AppError(502, `Finnhub returned invalid ${field}`);
  }

  return parsed;
}

export class FinnhubClient implements StockDataClient {
  public readonly provider = 'finnhub' as const;

  constructor(private readonly apiKey: string | undefined = env.FINNHUB_API_KEY) {}

  async getQuote(symbol: string): Promise<NormalizedStockQuote> {
    if (!this.apiKey) {
      throw new AppError(500, 'Finnhub API key is not configured');
    }

    const normalizedSymbol = symbol.trim().toUpperCase();
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(normalizedSymbol)}&token=${encodeURIComponent(this.apiKey)}`;
    const quote = await this.requestWithRetry<FinnhubQuoteResponse>(url);

    return {
      provider: this.provider,
      symbol: normalizedSymbol,
      price: toFiniteNumber(quote.c, 'c'),
      change: toFiniteNumber(quote.d, 'd'),
      changePercent: toFiniteNumber(quote.dp, 'dp'),
      previousClose: toFiniteNumber(quote.pc, 'pc'),
      timestamp: new Date(toFiniteNumber(quote.t, 't') * 1000).toISOString()
    };
  }

  async getMarkets(): Promise<MarketInfo[]> {
    if (!this.apiKey) {
      throw new AppError(500, 'Finnhub API key is not configured');
    }

    const url = `https://finnhub.io/api/v1/stock/exchange?token=${encodeURIComponent(this.apiKey)}`;
    const payload = await this.requestWithRetry<FinnhubExchangeResponse>(url);

    return payload
      .map((market) => ({
        code: (market.code || market.mic || '').trim(),
        name: (market.name || '').trim(),
        currency: (market.currency || 'USD').trim(),
        timezone: (market.timezone || 'UTC').trim()
      }))
      .filter((market) => market.code && market.name);
  }

  async searchStocks(query: string, limit: number): Promise<StockSearchResult[]> {
    if (!this.apiKey) {
      throw new AppError(500, 'Finnhub API key is not configured');
    }

    const url = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${encodeURIComponent(this.apiKey)}`;
    const payload = await this.requestWithRetry<FinnhubSearchResponse>(url);
    const results = payload.result ?? [];

    return results
      .map((item) => ({
        symbol: (item.symbol || item.displaySymbol || '').trim().toUpperCase(),
        description: (item.description || '').trim(),
        type: item.type,
        exchange: undefined
      }))
      .filter((item) => item.symbol && item.description)
      .slice(0, limit);
  }

  async getCandles(
    symbol: string,
    resolution: '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M',
    fromUnix: number,
    toUnix: number
  ): Promise<StockChartPoint[]> {
    if (!this.apiKey) {
      throw new AppError(500, 'Finnhub API key is not configured');
    }

    const url =
      `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}` +
      `&resolution=${encodeURIComponent(resolution)}` +
      `&from=${fromUnix}&to=${toUnix}&token=${encodeURIComponent(this.apiKey)}`;
    const payload = await this.requestWithRetry<FinnhubCandlesResponse>(url);

    if (payload.s !== 'ok') {
      throw new AppError(502, 'Finnhub returned no chart data');
    }

    const opens = payload.o ?? [];
    const highs = payload.h ?? [];
    const lows = payload.l ?? [];
    const closes = payload.c ?? [];
    const timestamps = payload.t ?? [];
    const volumes = payload.v ?? [];
    const length = Math.min(opens.length, highs.length, lows.length, closes.length, timestamps.length);

    const points: StockChartPoint[] = [];

    for (let index = 0; index < length; index += 1) {
      points.push({
        timestamp: new Date(timestamps[index] * 1000).toISOString(),
        open: toFiniteNumber(opens[index], 'o'),
        high: toFiniteNumber(highs[index], 'h'),
        low: toFiniteNumber(lows[index], 'l'),
        close: toFiniteNumber(closes[index], 'c'),
        volume: Number.isFinite(volumes[index]) ? volumes[index] : undefined
      });
    }

    return points;
  }

  async getCompanyNews(symbol: string, from: string, to: string, limit: number): Promise<StockNewsItem[]> {
    if (!this.apiKey) {
      throw new AppError(500, 'Finnhub API key is not configured');
    }

    const url =
      `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(symbol)}` +
      `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}` +
      `&token=${encodeURIComponent(this.apiKey)}`;
    const payload = await this.requestWithRetry<FinnhubNewsResponse>(url);

    return payload
      .map((item) => ({
        id: String(item.id || `${symbol}-${item.datetime || 0}`),
        source: (item.source || 'Unknown').trim(),
        headline: (item.headline || '').trim(),
        summary: (item.summary || '').trim(),
        url: (item.url || '').trim(),
        publishedAt: new Date(toFiniteNumber(item.datetime, 'datetime') * 1000).toISOString(),
        image: item.image?.trim() || undefined
      }))
      .filter((item) => item.headline && item.url)
      .slice(0, limit);
  }

  private async requestWithRetry<T>(url: string): Promise<T> {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const shouldRetry = response.status === 429 || response.status >= 500;

          if (shouldRetry && attempt < MAX_RETRIES) {
            await sleep(300 * (attempt + 1));
            continue;
          }

          throw new AppError(502, 'Finnhub request failed', { status: response.status });
        }

        return (await response.json()) as T;
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }

        if (attempt < MAX_RETRIES && isRetryableError(error)) {
          await sleep(300 * (attempt + 1));
          continue;
        }

        throw new AppError(502, 'Finnhub request failed', error);
      }
    }

    throw new AppError(502, 'Finnhub request failed after retries');
  }
}

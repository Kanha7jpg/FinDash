import { env } from '../config/environment.js';
import { AppError } from '../utils/appError.js';
import type { NormalizedStockQuote, StockChartPoint, StockDataClient, StockSearchResult } from './stockTypes.js';

type AlphaVantageGlobalQuote = {
  '01. symbol'?: string;
  '02. open'?: string;
  '03. high'?: string;
  '04. low'?: string;
  '05. price'?: string;
  '06. volume'?: string;
  '07. latest trading day'?: string;
  '08. previous close'?: string;
  '09. change'?: string;
  '10. change percent'?: string;
};

type AlphaVantageQuoteResponse = {
  'Global Quote'?: AlphaVantageGlobalQuote;
  Information?: string;
  Note?: string;
  'Error Message'?: string;
};

type AlphaVantageSymbolSearchResponse = {
  bestMatches?: Array<{
    '1. symbol'?: string;
    '2. name'?: string;
    '3. type'?: string;
    '4. region'?: string;
    '8. currency'?: string;
  }>;
};

type AlphaVantageDailySeriesResponse = {
  'Time Series (Daily)'?: Record<
    string,
    {
      '1. open'?: string;
      '2. high'?: string;
      '3. low'?: string;
      '4. close'?: string;
      '6. volume'?: string;
    }
  >;
  Information?: string;
  Note?: string;
  'Error Message'?: string;
};

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
    throw new AppError(502, `Alpha Vantage returned invalid ${field}`);
  }

  return parsed;
}

function parsePercent(rawValue: string | undefined): number {
  if (!rawValue) {
    throw new AppError(502, 'Alpha Vantage response missing change percent');
  }

  const cleaned = rawValue.replace('%', '').trim();
  return toFiniteNumber(cleaned, '10. change percent');
}

export class AlphaVantageClient implements StockDataClient {
  public readonly provider = 'alphaVantage' as const;

  constructor(private readonly apiKey: string | undefined = env.ALPHA_VANTAGE_API_KEY) {}

  async getQuote(symbol: string): Promise<NormalizedStockQuote> {
    if (!this.apiKey) {
      throw new AppError(500, 'Alpha Vantage API key is not configured');
    }

    const normalizedSymbol = symbol.trim().toUpperCase();
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(normalizedSymbol)}&apikey=${encodeURIComponent(this.apiKey)}`;
    const payload = await this.requestWithRetry<AlphaVantageQuoteResponse>(url);

    if (payload['Error Message']) {
      throw new AppError(502, 'Alpha Vantage request failed', payload['Error Message']);
    }

    if (payload.Note || payload.Information) {
      throw new AppError(429, 'Alpha Vantage rate limit reached', payload.Note || payload.Information);
    }

    const quote = payload['Global Quote'];

    if (!quote) {
      throw new AppError(502, 'Alpha Vantage response missing Global Quote');
    }

    return {
      provider: this.provider,
      symbol: quote['01. symbol'] || normalizedSymbol,
      price: toFiniteNumber(quote['05. price'], '05. price'),
      change: toFiniteNumber(quote['09. change'], '09. change'),
      changePercent: parsePercent(quote['10. change percent']),
      previousClose: toFiniteNumber(quote['08. previous close'], '08. previous close'),
      timestamp: quote['07. latest trading day']
        ? new Date(`${quote['07. latest trading day']}T00:00:00.000Z`).toISOString()
        : new Date().toISOString()
    };
  }

  async searchStocks(query: string, limit: number): Promise<StockSearchResult[]> {
    if (!this.apiKey) {
      throw new AppError(500, 'Alpha Vantage API key is not configured');
    }

    const url =
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH` +
      `&keywords=${encodeURIComponent(query)}&apikey=${encodeURIComponent(this.apiKey)}`;
    const payload = await this.requestWithRetry<AlphaVantageSymbolSearchResponse>(url);
    const matches = payload.bestMatches ?? [];

    return matches
      .map((item) => ({
        symbol: (item['1. symbol'] || '').trim().toUpperCase(),
        description: (item['2. name'] || '').trim(),
        type: item['3. type']?.trim(),
        exchange: item['4. region']?.trim()
      }))
      .filter((item) => item.symbol && item.description)
      .slice(0, limit);
  }

  async getDailyChart(symbol: string, limit: number): Promise<StockChartPoint[]> {
    if (!this.apiKey) {
      throw new AppError(500, 'Alpha Vantage API key is not configured');
    }

    const normalizedSymbol = symbol.trim().toUpperCase();
    const url =
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED` +
      `&symbol=${encodeURIComponent(normalizedSymbol)}&outputsize=compact&apikey=${encodeURIComponent(this.apiKey)}`;
    const payload = await this.requestWithRetry<AlphaVantageDailySeriesResponse>(url);

    if (payload['Error Message']) {
      throw new AppError(502, 'Alpha Vantage chart request failed', payload['Error Message']);
    }

    if (payload.Note || payload.Information) {
      throw new AppError(429, 'Alpha Vantage rate limit reached', payload.Note || payload.Information);
    }

    const series = payload['Time Series (Daily)'];

    if (!series) {
      throw new AppError(502, 'Alpha Vantage response missing Time Series (Daily)');
    }

    return Object.entries(series)
      .map(([date, values]) => ({
        timestamp: new Date(`${date}T00:00:00.000Z`).toISOString(),
        open: toFiniteNumber(values['1. open'], '1. open'),
        high: toFiniteNumber(values['2. high'], '2. high'),
        low: toFiniteNumber(values['3. low'], '3. low'),
        close: toFiniteNumber(values['4. close'], '4. close'),
        volume: Number(values['6. volume'])
      }))
      .sort((left, right) => left.timestamp.localeCompare(right.timestamp))
      .slice(-limit);
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

          throw new AppError(502, 'Alpha Vantage request failed', { status: response.status });
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

        throw new AppError(502, 'Alpha Vantage request failed', error);
      }
    }

    throw new AppError(502, 'Alpha Vantage request failed after retries');
  }
}

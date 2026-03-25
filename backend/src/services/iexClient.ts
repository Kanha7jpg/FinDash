import { env } from '../config/environment.js';
import { AppError } from '../utils/appError.js';
import type { NormalizedStockQuote, StockDataClient } from './stockTypes.js';

type IexQuoteResponse = {
  symbol: string;
  latestPrice: number;
  change: number;
  changePercent: number;
  previousClose: number;
  latestUpdate: number;
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
    throw new AppError(502, `IEX Cloud returned invalid ${field}`);
  }

  return parsed;
}

export class IexClient implements StockDataClient {
  public readonly provider = 'iex' as const;

  constructor(private readonly apiKey: string | undefined = env.IEX_CLOUD_API_KEY) {}

  async getQuote(symbol: string): Promise<NormalizedStockQuote> {
    if (!this.apiKey) {
      throw new AppError(500, 'IEX Cloud API key is not configured');
    }

    const normalizedSymbol = symbol.trim().toUpperCase();
    const url = `https://cloud.iexapis.com/stable/stock/${encodeURIComponent(normalizedSymbol)}/quote?token=${encodeURIComponent(this.apiKey)}`;
    const quote = await this.requestWithRetry<IexQuoteResponse>(url);

    return {
      provider: this.provider,
      symbol: quote.symbol || normalizedSymbol,
      price: toFiniteNumber(quote.latestPrice, 'latestPrice'),
      change: toFiniteNumber(quote.change, 'change'),
      changePercent: toFiniteNumber(quote.changePercent, 'changePercent') * 100,
      previousClose: toFiniteNumber(quote.previousClose, 'previousClose'),
      timestamp: new Date(toFiniteNumber(quote.latestUpdate, 'latestUpdate')).toISOString()
    };
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

          throw new AppError(502, 'IEX Cloud request failed', { status: response.status });
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

        throw new AppError(502, 'IEX Cloud request failed', error);
      }
    }

    throw new AppError(502, 'IEX Cloud request failed after retries');
  }
}

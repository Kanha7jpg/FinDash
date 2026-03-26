import { PrismaClient } from '@prisma/client';
import { env } from '../../config/environment.js';
import { AppError } from '../../utils/appError.js';
import { aiService } from './aiService.js';
import type {
  MarketSnapshotInput,
  PortfolioSnapshotInput,
  StockSnapshotInput
} from './promptBuilders.js';
import type {
  MarketSentimentResponse,
  PortfolioAnalysisResponse,
  StockAnalysisResponse
} from './responseParsers.js';

type CacheStore = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
};

type InsightKind = 'STOCK_ANALYSIS' | 'PORTFOLIO_ANALYSIS' | 'MARKET_SENTIMENT';

type PersistedInsight<TOutput> = {
  id: string;
  output: TOutput;
  createdAt: string;
};

type InsightResult<TOutput> = {
  insightId: string;
  generatedAt: string;
  cacheHit: boolean;
  source: 'memory' | 'redis' | 'database' | 'fresh';
  output: TOutput;
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
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
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

class LayeredCacheStore {
  private readonly memory = new MemoryCacheStore();
  private readonly redis?: RedisRestCacheStore;

  constructor() {
    if (env.REDIS_REST_URL && env.REDIS_REST_TOKEN) {
      this.redis = new RedisRestCacheStore(env.REDIS_REST_URL, env.REDIS_REST_TOKEN);
    }
  }

  async get(key: string): Promise<{ value: string | null; source?: 'memory' | 'redis' }> {
    const memoryValue = await this.memory.get(key);

    if (memoryValue !== null) {
      return { value: memoryValue, source: 'memory' };
    }

    if (!this.redis) {
      return { value: null };
    }

    try {
      const redisValue = await this.redis.get(key);

      if (redisValue !== null) {
        return { value: redisValue, source: 'redis' };
      }
    } catch {
      // Redis is optional, so memory+DB remain authoritative on failures.
    }

    return { value: null };
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.memory.set(key, value, ttlSeconds);

    if (!this.redis) {
      return;
    }

    try {
      await this.redis.set(key, value, ttlSeconds);
    } catch {
      // Ignore Redis failures because DB persistence still ensures durability.
    }
  }
}

const prisma = new PrismaClient();

function toInputJson(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value));
}

function parseCachedInsight<TOutput>(raw: string): PersistedInsight<TOutput> | null {
  try {
    return JSON.parse(raw) as PersistedInsight<TOutput>;
  } catch {
    return null;
  }
}

export class AiInsightsService {
  private readonly cache = new LayeredCacheStore();
  private readonly ttlSeconds: number;

  constructor() {
    this.ttlSeconds = env.AI_INSIGHT_CACHE_TTL_SECONDS;
  }

  async getStockAnalysis(userId: string, input: StockSnapshotInput): Promise<InsightResult<StockAnalysisResponse>> {
    const subject = input.symbol.trim().toUpperCase();
    return this.resolveInsight(userId, 'STOCK_ANALYSIS', subject, input, () => aiService.analyzeStock(input));
  }

  async getPortfolioAnalysis(
    userId: string,
    portfolioId: string,
    input: PortfolioSnapshotInput
  ): Promise<InsightResult<PortfolioAnalysisResponse>> {
    return this.resolveInsight(userId, 'PORTFOLIO_ANALYSIS', portfolioId, input, () => aiService.analyzePortfolio(input));
  }

  async getMarketSentiment(
    userId: string,
    marketScope: string,
    input: MarketSnapshotInput
  ): Promise<InsightResult<MarketSentimentResponse>> {
    return this.resolveInsight(userId, 'MARKET_SENTIMENT', marketScope, input, () => aiService.analyzeMarketSentiment(input));
  }

  private async resolveInsight<TOutput>(
    userId: string,
    kind: InsightKind,
    subjectKey: string,
    input: unknown,
    generate: () => Promise<TOutput>
  ): Promise<InsightResult<TOutput>> {
    const normalizedSubject = subjectKey.trim().toUpperCase();
    const cacheKey = `ai:insight:${userId}:${kind}:${normalizedSubject}`;

    const cached = await this.cache.get(cacheKey);

    if (cached.value) {
      const parsed = parseCachedInsight<TOutput>(cached.value);

      if (parsed) {
        return {
          insightId: parsed.id,
          generatedAt: parsed.createdAt,
          cacheHit: true,
          source: cached.source ?? 'memory',
          output: parsed.output
        };
      }
    }

    const now = new Date();
    const existing = await prisma.aiInsight.findFirst({
      where: {
        userId,
        kind,
        subjectKey: normalizedSubject,
        expiresAt: {
          gt: now
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (existing) {
      const payload: PersistedInsight<TOutput> = {
        id: existing.id,
        output: existing.output as TOutput,
        createdAt: existing.createdAt.toISOString()
      };

      await this.cache.set(cacheKey, JSON.stringify(payload), this.ttlSeconds);

      return {
        insightId: payload.id,
        generatedAt: payload.createdAt,
        cacheHit: true,
        source: 'database',
        output: payload.output
      };
    }

    const output = await generate();
    const expiresAt = new Date(Date.now() + this.ttlSeconds * 1000);

    const created = await prisma.aiInsight.create({
      data: {
        userId,
        kind,
        subjectKey: normalizedSubject,
        input: toInputJson(input) as never,
        output: toInputJson(output) as never,
        expiresAt
      }
    });

    const persisted: PersistedInsight<TOutput> = {
      id: created.id,
      output,
      createdAt: created.createdAt.toISOString()
    };

    await this.cache.set(cacheKey, JSON.stringify(persisted), this.ttlSeconds);

    return {
      insightId: persisted.id,
      generatedAt: persisted.createdAt,
      cacheHit: false,
      source: 'fresh',
      output
    };
  }
}

export const aiInsightsService = new AiInsightsService();

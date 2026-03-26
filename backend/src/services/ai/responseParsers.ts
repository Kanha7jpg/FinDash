import { z } from 'zod';
import { AppError } from '../../utils/appError.js';

const stockAnalysisSchema = z.object({
  summary: z.string().min(1),
  trend: z.enum(['bullish', 'bearish', 'neutral']),
  confidence: z.number().min(0).max(1),
  keyDrivers: z.array(z.string().min(1)).min(1),
  risks: z.array(z.string().min(1)).min(1),
  valuationView: z.object({
    signal: z.enum(['undervalued', 'fairly_valued', 'overvalued', 'unknown']),
    rationale: z.string().min(1)
  }),
  actionBias: z.object({
    signal: z.enum(['buy', 'hold', 'reduce', 'avoid']),
    rationale: z.string().min(1)
  }),
  priceLevels: z.object({
    support: z.array(z.number()),
    resistance: z.array(z.number())
  }),
  nextCheckpoints: z.array(z.string().min(1)).min(1)
});

const portfolioAnalysisSchema = z.object({
  summary: z.string().min(1),
  diversificationScore: z.number().min(0).max(100),
  riskLevel: z.enum(['low', 'medium', 'high']),
  concentrationWarnings: z.array(z.string().min(1)),
  strengths: z.array(z.string().min(1)).min(1),
  weaknesses: z.array(z.string().min(1)).min(1),
  rebalancingIdeas: z.array(
    z.object({
      action: z.string().min(1),
      rationale: z.string().min(1),
      priority: z.enum(['high', 'medium', 'low'])
    })
  ),
  scenarioOutlook: z.object({
    baseCase: z.string().min(1),
    bullCase: z.string().min(1),
    bearCase: z.string().min(1)
  }),
  nextActions: z.array(z.string().min(1)).min(1)
});

const marketSentimentSchema = z.object({
  summary: z.string().min(1),
  sentiment: z.enum(['risk_on', 'risk_off', 'mixed']),
  confidence: z.number().min(0).max(1),
  regime: z.enum(['expansion', 'slowdown', 'contraction', 'transition', 'unknown']),
  drivers: z.array(z.string().min(1)).min(1),
  watchSignals: z.array(z.string().min(1)).min(1),
  tacticalPositioning: z.object({
    equities: z.enum(['overweight', 'neutral', 'underweight']),
    fixedIncome: z.enum(['overweight', 'neutral', 'underweight']),
    cash: z.enum(['overweight', 'neutral', 'underweight'])
  }),
  oneWeekOutlook: z.string().min(1),
  oneMonthOutlook: z.string().min(1)
});

export type StockAnalysisResponse = z.infer<typeof stockAnalysisSchema>;
export type PortfolioAnalysisResponse = z.infer<typeof portfolioAnalysisSchema>;
export type MarketSentimentResponse = z.infer<typeof marketSentimentSchema>;

function extractFirstJsonObject(payload: string): string {
  const trimmed = payload.trim();

  if (!trimmed) {
    throw new AppError(502, 'Empty AI response body');
  }

  const firstBrace = trimmed.indexOf('{');

  if (firstBrace === -1) {
    throw new AppError(502, 'AI response does not include a JSON object', {
      preview: trimmed.slice(0, 280)
    });
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = firstBrace; i < trimmed.length; i += 1) {
    const char = trimmed[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      depth += 1;
      continue;
    }

    if (char === '}') {
      depth -= 1;

      if (depth === 0) {
        return trimmed.slice(firstBrace, i + 1);
      }
    }
  }

  throw new AppError(502, 'AI response contains malformed JSON', {
    preview: trimmed.slice(0, 280)
  });
}

function parseWithSchema<T>(label: string, rawText: string, schema: z.ZodType<T>): T {
  const jsonText = extractFirstJsonObject(rawText);

  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    throw new AppError(502, `AI returned invalid JSON for ${label}`, {
      error: error instanceof Error ? error.message : String(error),
      preview: jsonText.slice(0, 320)
    });
  }

  const validated = schema.safeParse(parsed);

  if (!validated.success) {
    throw new AppError(502, `AI JSON schema validation failed for ${label}`, {
      issues: validated.error.issues
    });
  }

  return validated.data;
}

export function parseStockAnalysisResponse(rawText: string): StockAnalysisResponse {
  return parseWithSchema('stock analysis', rawText, stockAnalysisSchema);
}

export function parsePortfolioAnalysisResponse(rawText: string): PortfolioAnalysisResponse {
  return parseWithSchema('portfolio analysis', rawText, portfolioAnalysisSchema);
}

export function parseMarketSentimentResponse(rawText: string): MarketSentimentResponse {
  return parseWithSchema('market sentiment', rawText, marketSentimentSchema);
}

import { env } from '../../config/environment.js';
import { AppError } from '../../utils/appError.js';
import {
  buildMarketSentimentPrompt,
  buildPortfolioAnalysisPrompt,
  buildStockAnalysisPrompt,
  type MarketSnapshotInput,
  type PortfolioSnapshotInput,
  type PromptPayload,
  type StockSnapshotInput
} from './promptBuilders.js';
import {
  parseMarketSentimentResponse,
  parsePortfolioAnalysisResponse,
  parseStockAnalysisResponse,
  type MarketSentimentResponse,
  type PortfolioAnalysisResponse,
  type StockAnalysisResponse
} from './responseParsers.js';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

type ClaudeMessageResponse = {
  id: string;
  model: string;
  stop_reason: string | null;
  content: Array<
    | {
        type: 'text';
        text: string;
      }
    | {
        type: string;
      }
  >;
};

type ClaudeErrorResponse = {
  type?: string;
  error?: {
    type?: string;
    message?: string;
  };
};

function parseClaudeError(raw: string): ClaudeErrorResponse | null {
  try {
    return JSON.parse(raw) as ClaudeErrorResponse;
  } catch {
    return null;
  }
}

function toHttpError(message: string, details?: unknown): AppError {
  return new AppError(502, message, details);
}

export class AiService {
  private readonly apiKey?: string;
  private readonly model: string;
  private readonly timeoutMs: number;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor() {
    this.apiKey = env.ANTHROPIC_API_KEY;
    this.model = env.ANTHROPIC_MODEL;
    this.timeoutMs = env.AI_REQUEST_TIMEOUT_MS;
    this.maxTokens = env.AI_MAX_TOKENS;
    this.temperature = env.AI_TEMPERATURE;
  }

  async analyzeStock(input: StockSnapshotInput): Promise<StockAnalysisResponse> {
    const prompt = buildStockAnalysisPrompt(input);
    const text = await this.requestTextCompletion(prompt);
    return parseStockAnalysisResponse(text);
  }

  async analyzePortfolio(input: PortfolioSnapshotInput): Promise<PortfolioAnalysisResponse> {
    const prompt = buildPortfolioAnalysisPrompt(input);
    const text = await this.requestTextCompletion(prompt);
    return parsePortfolioAnalysisResponse(text);
  }

  async analyzeMarketSentiment(input: MarketSnapshotInput): Promise<MarketSentimentResponse> {
    const prompt = buildMarketSentimentPrompt(input);
    const text = await this.requestTextCompletion(prompt);
    return parseMarketSentimentResponse(text);
  }

  private async requestTextCompletion(prompt: PromptPayload): Promise<string> {
    if (!this.apiKey) {
      throw new AppError(503, 'AI provider is not configured: missing ANTHROPIC_API_KEY');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': ANTHROPIC_VERSION
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          system: prompt.systemPrompt,
          messages: [
            {
              role: 'user',
              content: prompt.userPrompt
            }
          ]
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const rawError = await response.text();
        const parsedError = parseClaudeError(rawError);
        const providerMessage = parsedError?.error?.message || rawError || 'Claude API request failed';

        throw toHttpError('Claude API request failed', {
          status: response.status,
          providerType: parsedError?.error?.type || parsedError?.type,
          providerMessage: providerMessage.slice(0, 600)
        });
      }

      const data = (await response.json()) as ClaudeMessageResponse;

      const textBlocks = data.content
        .filter((block) => block.type === 'text')
        .map((block) => (block as { type: 'text'; text: string }).text)
        .join('\n')
        .trim();

      if (!textBlocks) {
        throw toHttpError('Claude API returned an empty content response', {
          id: data.id,
          model: data.model,
          stopReason: data.stop_reason
        });
      }

      return textBlocks;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new AppError(504, 'Claude API request timed out', {
          timeoutMs: this.timeoutMs
        });
      }

      throw toHttpError('Claude API request failed due to transport error', {
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}

// Singleton service instance used by controllers and other domain services.
export const aiService = new AiService();

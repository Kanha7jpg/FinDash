export type StockSnapshotInput = {
  symbol: string;
  companyName?: string;
  exchange?: string;
  currency?: string;
  price: number;
  dayChangePercent?: number;
  week52High?: number;
  week52Low?: number;
  volume?: number;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  recentNewsHeadlines?: string[];
};

export type PortfolioHoldingInput = {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  sector?: string;
  country?: string;
  currency?: string;
};

export type PortfolioSnapshotInput = {
  baseCurrency: string;
  cash?: number;
  riskProfile?: 'conservative' | 'balanced' | 'aggressive';
  investmentHorizonMonths?: number;
  holdings: PortfolioHoldingInput[];
};

export type MarketSnapshotInput = {
  region?: string;
  asOf: string;
  indices: Array<{
    name: string;
    price: number;
    dayChangePercent: number;
  }>;
  volatilityIndex?: {
    name: string;
    value: number;
    dayChangePercent?: number;
  };
  macroSignals?: string[];
  newsHeadlines?: string[];
};

export type PromptPayload = {
  systemPrompt: string;
  userPrompt: string;
};

const CORE_OUTPUT_RULES = [
  'Return only JSON. Do not include markdown fences or explanatory prose.',
  'All numeric fields must be numbers, never strings.',
  'Be explicit about uncertainty in confidence scores and risk levels.',
  'Use concise but complete rationale text grounded in provided input only.'
].join(' ');

function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function buildStockAnalysisPrompt(input: StockSnapshotInput): PromptPayload {
  const schemaContract = {
    summary: 'string',
    trend: 'bullish | bearish | neutral',
    confidence: 'number between 0 and 1',
    keyDrivers: ['string'],
    risks: ['string'],
    valuationView: {
      signal: 'undervalued | fairly_valued | overvalued | unknown',
      rationale: 'string'
    },
    actionBias: {
      signal: 'buy | hold | reduce | avoid',
      rationale: 'string'
    },
    priceLevels: {
      support: ['number'],
      resistance: ['number']
    },
    nextCheckpoints: ['string']
  };

  return {
    systemPrompt: [
      'You are a senior equity research analyst.',
      'Analyze the stock snapshot and produce a practical, risk-aware view.',
      CORE_OUTPUT_RULES
    ].join(' '),
    userPrompt: [
      'TASK: Provide stock analysis using the exact JSON contract below.',
      `JSON_CONTRACT: ${prettyJson(schemaContract)}`,
      `INPUT: ${prettyJson(input)}`
    ].join('\n\n')
  };
}

export function buildPortfolioAnalysisPrompt(input: PortfolioSnapshotInput): PromptPayload {
  const schemaContract = {
    summary: 'string',
    diversificationScore: 'number between 0 and 100',
    riskLevel: 'low | medium | high',
    concentrationWarnings: ['string'],
    strengths: ['string'],
    weaknesses: ['string'],
    rebalancingIdeas: [
      {
        action: 'string',
        rationale: 'string',
        priority: 'high | medium | low'
      }
    ],
    scenarioOutlook: {
      baseCase: 'string',
      bullCase: 'string',
      bearCase: 'string'
    },
    nextActions: ['string']
  };

  return {
    systemPrompt: [
      'You are a portfolio strategist focused on allocation, risk, and implementation.',
      'Assess concentration, diversification, and practical rebalancing steps.',
      CORE_OUTPUT_RULES
    ].join(' '),
    userPrompt: [
      'TASK: Provide portfolio analysis using the exact JSON contract below.',
      `JSON_CONTRACT: ${prettyJson(schemaContract)}`,
      `INPUT: ${prettyJson(input)}`
    ].join('\n\n')
  };
}

export function buildMarketSentimentPrompt(input: MarketSnapshotInput): PromptPayload {
  const schemaContract = {
    summary: 'string',
    sentiment: 'risk_on | risk_off | mixed',
    confidence: 'number between 0 and 1',
    regime: 'expansion | slowdown | contraction | transition | unknown',
    drivers: ['string'],
    watchSignals: ['string'],
    tacticalPositioning: {
      equities: 'overweight | neutral | underweight',
      fixedIncome: 'overweight | neutral | underweight',
      cash: 'overweight | neutral | underweight'
    },
    oneWeekOutlook: 'string',
    oneMonthOutlook: 'string'
  };

  return {
    systemPrompt: [
      'You are a macro market strategist synthesizing cross-asset sentiment.',
      'Focus on market regime, risk appetite, and near-term tactical posture.',
      CORE_OUTPUT_RULES
    ].join(' '),
    userPrompt: [
      'TASK: Provide market sentiment analysis using the exact JSON contract below.',
      `JSON_CONTRACT: ${prettyJson(schemaContract)}`,
      `INPUT: ${prettyJson(input)}`
    ].join('\n\n')
  };
}

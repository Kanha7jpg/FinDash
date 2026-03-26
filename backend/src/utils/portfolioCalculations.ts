export type BuyCalculationInput = {
  currentQuantity: number;
  currentAveragePrice: number;
  buyQuantity: number;
  buyPrice: number;
  fee: number;
};

export type SellCalculationInput = {
  currentQuantity: number;
  currentAveragePrice: number;
  sellQuantity: number;
  sellPrice: number;
  fee: number;
};

export type HoldingCalculationResult = {
  quantity: number;
  averagePrice: number;
};

export type SellCalculationResult = HoldingCalculationResult & {
  realizedPnl: number;
};

export type UnrealizedPnlResult = {
  marketValue: number;
  costBasis: number;
  unrealizedPnl: number;
};

const QUANTITY_DECIMALS = 6;
const MONEY_DECIMALS = 4;

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function calculateBuyHolding(input: BuyCalculationInput): HoldingCalculationResult {
  const currentCost = input.currentQuantity * input.currentAveragePrice;
  const buyCost = input.buyQuantity * input.buyPrice;
  const nextQuantity = input.currentQuantity + input.buyQuantity;

  if (nextQuantity <= 0) {
    return { quantity: 0, averagePrice: 0 };
  }

  // Buy-side fees increase the position cost basis.
  const nextCost = currentCost + buyCost + input.fee;
  const nextAverage = nextCost / nextQuantity;

  return {
    quantity: round(nextQuantity, QUANTITY_DECIMALS),
    averagePrice: round(nextAverage, MONEY_DECIMALS)
  };
}

export function calculateSellHolding(input: SellCalculationInput): SellCalculationResult {
  const remainingQuantity = input.currentQuantity - input.sellQuantity;
  const costSold = input.sellQuantity * input.currentAveragePrice;
  // Sell-side fees reduce net proceeds and therefore realized P&L.
  const netProceeds = input.sellQuantity * input.sellPrice - input.fee;
  const realizedPnl = netProceeds - costSold;

  if (remainingQuantity <= 0) {
    return {
      quantity: 0,
      averagePrice: 0,
      realizedPnl: round(realizedPnl, MONEY_DECIMALS)
    };
  }

  return {
    quantity: round(remainingQuantity, QUANTITY_DECIMALS),
    averagePrice: round(input.currentAveragePrice, MONEY_DECIMALS),
    realizedPnl: round(realizedPnl, MONEY_DECIMALS)
  };
}

export function calculateUnrealizedPnl(quantity: number, averagePrice: number, currentPrice: number): UnrealizedPnlResult {
  const marketValue = quantity * currentPrice;
  const costBasis = quantity * averagePrice;
  const unrealizedPnl = marketValue - costBasis;

  return {
    marketValue: round(marketValue, MONEY_DECIMALS),
    costBasis: round(costBasis, MONEY_DECIMALS),
    unrealizedPnl: round(unrealizedPnl, MONEY_DECIMALS)
  };
}

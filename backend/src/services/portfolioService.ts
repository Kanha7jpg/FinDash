import { PrismaClient } from '@prisma/client';
import { stockService } from './stockService.js';
import { AppError } from '../utils/appError.js';
import {
  calculateBuyHolding,
  calculateSellHolding,
  calculateUnrealizedPnl
} from '../utils/portfolioCalculations.js';

const prisma = new PrismaClient();

type CreatePortfolioInput = {
  name: string;
  description?: string;
  baseCurrency?: string;
};

type CreateTransactionInput = {
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  fee?: number;
  currency?: string;
  executedAt: string;
};

type PortfolioSummary = {
  id: string;
  name: string;
  description: string | null;
  baseCurrency: string;
  createdAt: string;
  updatedAt: string;
  holdingsCount: number;
  transactionsCount: number;
};

type PortfolioHoldingView = {
  symbol: string;
  name: string;
  exchange: string;
  country: string;
  quantity: number;
  averagePrice: number;
  costBasis: number;
  currentPrice: number | null;
  marketValue: number | null;
  unrealizedPnl: number | null;
  unrealizedPnlPercent: number | null;
};

type PortfolioTransactionView = {
  id: string;
  symbol: string;
  stockName: string;
  type: string;
  quantity: number;
  price: number;
  fee: number;
  currency: string;
  executedAt: string;
  createdAt: string;
};

type PortfolioDetail = {
  id: string;
  name: string;
  description: string | null;
  baseCurrency: string;
  createdAt: string;
  updatedAt: string;
  totals: {
    totalCostBasis: number;
    totalMarketValue: number | null;
    totalUnrealizedPnl: number | null;
  };
  holdings: PortfolioHoldingView[];
  transactions: PortfolioTransactionView[];
};

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
}

function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

function toNumber(value: { toNumber(): number } | number | null | undefined): number {
  if (typeof value === 'number') {
    return value;
  }

  if (!value) {
    return 0;
  }

  return value.toNumber();
}

async function ensureOwnedPortfolio(userId: string, portfolioId: string): Promise<void> {
  const portfolio = await prisma.portfolio.findFirst({
    where: {
      id: portfolioId,
      userId
    },
    select: { id: true }
  });

  if (!portfolio) {
    throw new AppError(404, 'Portfolio not found');
  }
}

async function upsertStock(symbolInput: string): Promise<{ id: string; symbol: string; name: string; exchange: string; country: string }> {
  const symbol = normalizeSymbol(symbolInput);

  let name = symbol;
  let exchange = 'UNKNOWN';
  let country = 'US';

  try {
    const quote = await stockService.getQuote(symbol);
    name = quote.symbol;
  } catch {
    // If quote lookup fails, proceed with canonical symbol placeholder metadata.
  }

  const stock = await prisma.stock.upsert({
    where: { symbol },
    update: {},
    create: {
      symbol,
      name,
      exchange,
      country
    },
    select: {
      id: true,
      symbol: true,
      name: true,
      exchange: true,
      country: true
    }
  });

  return stock;
}

export async function getPortfolios(userId: string): Promise<PortfolioSummary[]> {
  const portfolios = (await prisma.portfolio.findMany({
    where: { userId },
    include: {
      _count: {
        select: {
          holdings: true,
          transactions: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })) as Array<{
    id: string;
    name: string;
    description: string | null;
    baseCurrency: string;
    createdAt: Date;
    updatedAt: Date;
    _count: {
      holdings: number;
      transactions: number;
    };
  }>;

  return portfolios.map((portfolio: (typeof portfolios)[number]) => ({
    id: portfolio.id,
    name: portfolio.name,
    description: portfolio.description,
    baseCurrency: portfolio.baseCurrency,
    createdAt: portfolio.createdAt.toISOString(),
    updatedAt: portfolio.updatedAt.toISOString(),
    holdingsCount: portfolio._count.holdings,
    transactionsCount: portfolio._count.transactions
  }));
}

export async function createPortfolio(userId: string, input: CreatePortfolioInput): Promise<PortfolioSummary> {
  const portfolio = await prisma.portfolio.create({
    data: {
      userId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      baseCurrency: (input.baseCurrency || 'USD').trim().toUpperCase()
    },
    include: {
      _count: {
        select: {
          holdings: true,
          transactions: true
        }
      }
    }
  });

  return {
    id: portfolio.id,
    name: portfolio.name,
    description: portfolio.description,
    baseCurrency: portfolio.baseCurrency,
    createdAt: portfolio.createdAt.toISOString(),
    updatedAt: portfolio.updatedAt.toISOString(),
    holdingsCount: portfolio._count.holdings,
    transactionsCount: portfolio._count.transactions
  };
}

export async function deletePortfolio(userId: string, portfolioId: string): Promise<void> {
  await ensureOwnedPortfolio(userId, portfolioId);

  await prisma.portfolio.delete({
    where: { id: portfolioId }
  });
}

export async function createPortfolioTransaction(
  userId: string,
  portfolioId: string,
  input: CreateTransactionInput
): Promise<PortfolioTransactionView> {
  await ensureOwnedPortfolio(userId, portfolioId);

  const quantity = input.quantity;
  const price = input.price;
  const fee = input.fee ?? 0;

  if (quantity <= 0) {
    throw new AppError(422, 'Quantity must be greater than zero');
  }

  if (price <= 0) {
    throw new AppError(422, 'Price must be greater than zero');
  }

  if (fee < 0) {
    throw new AppError(422, 'Fee cannot be negative');
  }

  const stock = await upsertStock(input.symbol);
  const executedAt = new Date(input.executedAt);

  if (Number.isNaN(executedAt.getTime())) {
    throw new AppError(422, 'Invalid executedAt timestamp');
  }

  const created = await prisma.$transaction(async (tx: any) => {
    const holding = await tx.portfolioHolding.findUnique({
      where: {
        portfolioId_stockId: {
          portfolioId,
          stockId: stock.id
        }
      }
    });

    if (input.type === 'BUY') {
      const result = calculateBuyHolding({
        currentQuantity: toNumber(holding?.quantity),
        currentAveragePrice: toNumber(holding?.averagePrice),
        buyQuantity: quantity,
        buyPrice: price,
        fee
      });

      if (holding) {
        await tx.portfolioHolding.update({
          where: { id: holding.id },
          data: {
            quantity: result.quantity,
            averagePrice: result.averagePrice,
            purchaseCurrency: (input.currency || 'USD').toUpperCase()
          }
        });
      } else {
        await tx.portfolioHolding.create({
          data: {
            portfolioId,
            stockId: stock.id,
            quantity: result.quantity,
            averagePrice: result.averagePrice,
            purchaseCurrency: (input.currency || 'USD').toUpperCase()
          }
        });
      }
    }

    if (input.type === 'SELL') {
      if (!holding || toNumber(holding.quantity) <= 0) {
        throw new AppError(422, 'Cannot sell a stock with no holdings');
      }

      const currentQty = toNumber(holding.quantity);

      if (quantity > currentQty) {
        throw new AppError(422, 'Sell quantity exceeds available holdings');
      }

      const result = calculateSellHolding({
        currentQuantity: currentQty,
        currentAveragePrice: toNumber(holding.averagePrice),
        sellQuantity: quantity,
        sellPrice: price,
        fee
      });

      if (result.quantity === 0) {
        await tx.portfolioHolding.delete({ where: { id: holding.id } });
      } else {
        await tx.portfolioHolding.update({
          where: { id: holding.id },
          data: {
            quantity: result.quantity,
            averagePrice: result.averagePrice
          }
        });
      }
    }

    const transaction = await tx.transaction.create({
      data: {
        portfolioId,
        stockId: stock.id,
        type: input.type,
        quantity,
        price,
        fee,
        currency: (input.currency || 'USD').toUpperCase(),
        executedAt
      },
      include: {
        stock: {
          select: {
            symbol: true,
            name: true
          }
        }
      }
    });

    return transaction;
  });

  return {
    id: created.id,
    symbol: created.stock.symbol,
    stockName: created.stock.name,
    type: created.type,
    quantity: toNumber(created.quantity),
    price: toNumber(created.price),
    fee: toNumber(created.fee),
    currency: created.currency,
    executedAt: created.executedAt.toISOString(),
    createdAt: created.createdAt.toISOString()
  };
}

export async function getPortfolioDetail(userId: string, portfolioId: string): Promise<PortfolioDetail> {
  await ensureOwnedPortfolio(userId, portfolioId);

  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
    include: {
      holdings: {
        include: {
          stock: {
            select: {
              symbol: true,
              name: true,
              exchange: true,
              country: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      },
      transactions: {
        include: {
          stock: {
            select: {
              symbol: true,
              name: true
            }
          }
        },
        orderBy: {
          executedAt: 'desc'
        },
        take: 200
      }
    }
  });

  if (!portfolio) {
    throw new AppError(404, 'Portfolio not found');
  }

  const holdingsWithQuote = await Promise.all(
    portfolio.holdings.map(async (holding: (typeof portfolio.holdings)[number]) => {
      const quantity = toNumber(holding.quantity);
      const averagePrice = toNumber(holding.averagePrice);
      const costBasis = roundMoney(quantity * averagePrice);

      try {
        const quote = await stockService.getQuote(holding.stock.symbol);
        const pnl = calculateUnrealizedPnl(quantity, averagePrice, quote.price);

        return {
          symbol: holding.stock.symbol,
          name: holding.stock.name,
          exchange: holding.stock.exchange,
          country: holding.stock.country,
          quantity,
          averagePrice,
          costBasis: pnl.costBasis,
          currentPrice: quote.price,
          marketValue: pnl.marketValue,
          unrealizedPnl: pnl.unrealizedPnl,
          unrealizedPnlPercent: pnl.costBasis > 0 ? roundMoney((pnl.unrealizedPnl / pnl.costBasis) * 100) : null
        } satisfies PortfolioHoldingView;
      } catch {
        return {
          symbol: holding.stock.symbol,
          name: holding.stock.name,
          exchange: holding.stock.exchange,
          country: holding.stock.country,
          quantity,
          averagePrice,
          costBasis,
          currentPrice: null,
          marketValue: null,
          unrealizedPnl: null,
          unrealizedPnlPercent: null
        } satisfies PortfolioHoldingView;
      }
    })
  );

  const totalCostBasis = roundMoney(holdingsWithQuote.reduce((acc, item) => acc + item.costBasis, 0));
  const totalMarketValueRaw = holdingsWithQuote.reduce((acc, item) => acc + (item.marketValue ?? 0), 0);
  const pricedCount = holdingsWithQuote.filter((item) => item.marketValue !== null).length;

  const totalMarketValue = pricedCount === holdingsWithQuote.length ? roundMoney(totalMarketValueRaw) : null;
  const totalUnrealizedPnl = totalMarketValue !== null ? roundMoney(totalMarketValue - totalCostBasis) : null;

  return {
    id: portfolio.id,
    name: portfolio.name,
    description: portfolio.description,
    baseCurrency: portfolio.baseCurrency,
    createdAt: portfolio.createdAt.toISOString(),
    updatedAt: portfolio.updatedAt.toISOString(),
    totals: {
      totalCostBasis,
      totalMarketValue,
      totalUnrealizedPnl
    },
    holdings: holdingsWithQuote,
    transactions: portfolio.transactions.map((transaction: (typeof portfolio.transactions)[number]) => ({
      id: transaction.id,
      symbol: transaction.stock.symbol,
      stockName: transaction.stock.name,
      type: transaction.type,
      quantity: toNumber(transaction.quantity),
      price: toNumber(transaction.price),
      fee: toNumber(transaction.fee),
      currency: transaction.currency,
      executedAt: transaction.executedAt.toISOString(),
      createdAt: transaction.createdAt.toISOString()
    }))
  };
}

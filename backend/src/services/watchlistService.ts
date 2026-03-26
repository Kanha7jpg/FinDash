import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/appError.js';

const prisma = new PrismaClient();

type CreateWatchlistInput = {
  name: string;
  description?: string;
};

type AddStockInput = {
  symbol: string;
  name?: string;
  exchange?: string;
  country?: string;
  notes?: string;
};

type UpdateStockNoteInput = {
  notes?: string;
};

export type WatchlistStockItem = {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  country: string;
  notes: string | null;
  addedAt: string;
};

export type Watchlist = {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  items: WatchlistStockItem[];
};

type WatchlistWithItems = {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    notes: string | null;
    addedAt: Date;
    stock: {
      symbol: string;
      name: string;
      exchange: string;
      country: string;
    };
  }>;
};

function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

function mapWatchlist(watchlist: WatchlistWithItems): Watchlist {
  return {
    id: watchlist.id,
    name: watchlist.name,
    description: watchlist.description,
    isDefault: watchlist.isDefault,
    createdAt: watchlist.createdAt.toISOString(),
    updatedAt: watchlist.updatedAt.toISOString(),
    items: watchlist.items.map((item) => ({
      id: item.id,
      symbol: item.stock.symbol,
      name: item.stock.name,
      exchange: item.stock.exchange,
      country: item.stock.country,
      notes: item.notes,
      addedAt: item.addedAt.toISOString()
    }))
  };
}

async function getOwnedWatchlist(userId: string, watchlistId: string): Promise<void> {
  // Enforce tenant isolation before any watchlist mutation.
  const existing = await prisma.watchlist.findFirst({
    where: {
      id: watchlistId,
      userId
    },
    select: { id: true }
  });

  if (!existing) {
    throw new AppError(404, 'Watchlist not found');
  }
}

async function fetchWatchlist(watchlistId: string): Promise<WatchlistWithItems> {
  const watchlist = await prisma.watchlist.findUnique({
    where: { id: watchlistId },
    include: {
      items: {
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
          addedAt: 'desc'
        }
      }
    }
  });

  if (!watchlist) {
    throw new AppError(404, 'Watchlist not found');
  }

  return watchlist;
}

export async function getWatchlists(userId: string): Promise<Watchlist[]> {
  const watchlists = await prisma.watchlist.findMany({
    where: { userId },
    include: {
      items: {
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
          addedAt: 'desc'
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return watchlists.map(mapWatchlist);
}

export async function createWatchlist(userId: string, input: CreateWatchlistInput): Promise<Watchlist> {
  const watchlist = await prisma.watchlist.create({
    data: {
      userId,
      name: input.name.trim(),
      description: input.description?.trim() || null
    },
    include: {
      items: {
        include: {
          stock: {
            select: {
              symbol: true,
              name: true,
              exchange: true,
              country: true
            }
          }
        }
      }
    }
  });

  return mapWatchlist(watchlist);
}

export async function deleteWatchlist(userId: string, watchlistId: string): Promise<void> {
  await getOwnedWatchlist(userId, watchlistId);

  await prisma.watchlist.delete({
    where: { id: watchlistId }
  });
}

export async function addStockToWatchlist(userId: string, watchlistId: string, input: AddStockInput): Promise<Watchlist> {
  await getOwnedWatchlist(userId, watchlistId);

  const symbol = normalizeSymbol(input.symbol);

  // Keep a canonical Stock row and attach it to this watchlist through WatchlistItem.
  const stock = await prisma.stock.upsert({
    where: { symbol },
    update: {
      name: input.name?.trim() || undefined,
      exchange: input.exchange?.trim() || undefined,
      country: input.country?.trim() || undefined
    },
    create: {
      symbol,
      name: input.name?.trim() || symbol,
      exchange: input.exchange?.trim() || 'UNKNOWN',
      country: input.country?.trim() || 'US'
    }
  });

  try {
    await prisma.watchlistItem.create({
      data: {
        watchlistId,
        stockId: stock.id,
        notes: input.notes?.trim() || null
      }
    });
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
      throw new AppError(409, 'Stock already exists in this watchlist');
    }
    throw error;
  }

  const watchlist = await fetchWatchlist(watchlistId);
  return mapWatchlist(watchlist);
}

export async function removeStockFromWatchlist(userId: string, watchlistId: string, symbol: string): Promise<Watchlist> {
  await getOwnedWatchlist(userId, watchlistId);

  const normalizedSymbol = normalizeSymbol(symbol);
  const stock = await prisma.stock.findUnique({ where: { symbol: normalizedSymbol }, select: { id: true } });

  if (!stock) {
    throw new AppError(404, 'Stock not found in watchlist');
  }

  const removed = await prisma.watchlistItem.deleteMany({
    where: {
      watchlistId,
      stockId: stock.id
    }
  });

  if (removed.count === 0) {
    throw new AppError(404, 'Stock not found in watchlist');
  }

  const watchlist = await fetchWatchlist(watchlistId);
  return mapWatchlist(watchlist);
}

export async function updateWatchlistStockNotes(
  userId: string,
  watchlistId: string,
  symbol: string,
  input: UpdateStockNoteInput
): Promise<Watchlist> {
  await getOwnedWatchlist(userId, watchlistId);

  const normalizedSymbol = normalizeSymbol(symbol);
  const stock = await prisma.stock.findUnique({ where: { symbol: normalizedSymbol }, select: { id: true } });

  if (!stock) {
    throw new AppError(404, 'Stock not found in watchlist');
  }

  const updated = await prisma.watchlistItem.updateMany({
    where: {
      watchlistId,
      stockId: stock.id
    },
    data: {
      notes: input.notes?.trim() || null
    }
  });

  if (updated.count === 0) {
    throw new AppError(404, 'Stock not found in watchlist');
  }

  const watchlist = await fetchWatchlist(watchlistId);
  return mapWatchlist(watchlist);
}

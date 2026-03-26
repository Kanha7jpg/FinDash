import type { Response } from 'express';
import {
  addStockToWatchlist,
  createWatchlist,
  deleteWatchlist,
  getWatchlists,
  removeStockFromWatchlist,
  updateWatchlistStockNotes
} from '../services/watchlistService.js';
import type { AuthenticatedRequest } from '../types/index.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

type WatchlistParams = {
  watchlistId: string;
};

type WatchlistStockParams = {
  watchlistId: string;
  symbol: string;
};

type CreateWatchlistBody = {
  name: string;
  description?: string;
};

type AddStockBody = {
  symbol: string;
  name?: string;
  exchange?: string;
  country?: string;
  notes?: string;
};

type UpdateNotesBody = {
  notes?: string;
};

function getUserId(req: AuthenticatedRequest): string {
  if (!req.user?.id) {
    throw new AppError(401, 'Unauthorized');
  }

  return req.user.id;
}

export const getWatchlistsController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const watchlists = await getWatchlists(getUserId(req));
  res.status(200).json({ watchlists });
});

export const createWatchlistController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as CreateWatchlistBody;
  const watchlist = await createWatchlist(getUserId(req), body);
  res.status(201).json({ watchlist });
});

export const deleteWatchlistController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const params = (req as AuthenticatedRequest & { validatedParams: WatchlistParams }).validatedParams;
  await deleteWatchlist(getUserId(req), params.watchlistId);
  res.status(200).json({ message: 'Watchlist deleted' });
});

export const addWatchlistStockController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const params = (req as AuthenticatedRequest & { validatedParams: WatchlistParams }).validatedParams;
  const body = req.body as AddStockBody;
  const watchlist = await addStockToWatchlist(getUserId(req), params.watchlistId, body);
  res.status(200).json({ watchlist });
});

export const removeWatchlistStockController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const params = (req as AuthenticatedRequest & { validatedParams: WatchlistStockParams }).validatedParams;
  const watchlist = await removeStockFromWatchlist(getUserId(req), params.watchlistId, params.symbol);
  res.status(200).json({ watchlist });
});

export const updateWatchlistStockNotesController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const params = (req as AuthenticatedRequest & { validatedParams: WatchlistStockParams }).validatedParams;
  const body = req.body as UpdateNotesBody;
  const watchlist = await updateWatchlistStockNotes(getUserId(req), params.watchlistId, params.symbol, body);
  res.status(200).json({ watchlist });
});

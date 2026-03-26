import { Router } from 'express';
import { z } from 'zod';
import {
  addWatchlistStockController,
  createWatchlistController,
  deleteWatchlistController,
  getWatchlistsController,
  removeWatchlistStockController,
  updateWatchlistStockNotesController
} from '../controllers/watchlistController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validation.js';

const watchlistParamsSchema = z.object({
  watchlistId: z.string().cuid()
});

const watchlistStockParamsSchema = z.object({
  watchlistId: z.string().cuid(),
  symbol: z
    .string()
    .trim()
    .min(1)
    .max(15)
    .regex(/^[A-Za-z0-9.-]+$/)
    .transform((value) => value.toUpperCase())
});

const createWatchlistSchema = z.object({
  name: z.string().trim().min(1).max(60),
  description: z.string().trim().max(280).optional()
});

const addStockSchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(1)
    .max(15)
    .regex(/^[A-Za-z0-9.-]+$/)
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(1).max(120).optional(),
  exchange: z.string().trim().min(1).max(30).optional(),
  country: z.string().trim().min(1).max(40).optional(),
  notes: z.string().trim().max(400).optional()
});

const updateStockNotesSchema = z.object({
  notes: z.string().trim().max(400).optional()
});

export const watchlistsRouter = Router();

watchlistsRouter.use(authMiddleware);

watchlistsRouter.get('/watchlists', getWatchlistsController);
watchlistsRouter.post('/watchlists', validateBody(createWatchlistSchema), createWatchlistController);
watchlistsRouter.delete('/watchlists/:watchlistId', validateParams(watchlistParamsSchema), deleteWatchlistController);
watchlistsRouter.post(
  '/watchlists/:watchlistId/stocks',
  validateParams(watchlistParamsSchema),
  validateBody(addStockSchema),
  addWatchlistStockController
);
watchlistsRouter.delete(
  '/watchlists/:watchlistId/stocks/:symbol',
  validateParams(watchlistStockParamsSchema),
  removeWatchlistStockController
);
watchlistsRouter.patch(
  '/watchlists/:watchlistId/stocks/:symbol',
  validateParams(watchlistStockParamsSchema),
  validateBody(updateStockNotesSchema),
  updateWatchlistStockNotesController
);

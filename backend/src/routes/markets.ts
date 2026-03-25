import { Router } from 'express';
import { z } from 'zod';
import {
  getMarketsController,
  getStockChartController,
  getStockNewsController,
  getStockQuoteController,
  searchStocksController
} from '../controllers/stockController.js';
import { validateParams, validateQuery } from '../middleware/validation.js';

const symbolParamsSchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(1)
    .max(15)
    .regex(/^[A-Za-z0-9.-]+$/)
    .transform((value) => value.toUpperCase())
});

const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  exchange: z.string().trim().min(1).max(20).optional()
});

const quoteQuerySchema = z.object({
  provider: z.enum(['iex', 'finnhub', 'alphaVantage']).optional()
});

const chartQuerySchema = z.object({
  resolution: z.enum(['1', '5', '15', '30', '60', 'D', 'W', 'M']).default('D'),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(5).max(365).default(60)
});

const newsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});

export const marketsRouter = Router();

marketsRouter.get('/markets', getMarketsController);
marketsRouter.get('/stocks/search', validateQuery(searchQuerySchema), searchStocksController);
marketsRouter.get('/stocks/:symbol', validateParams(symbolParamsSchema), validateQuery(quoteQuerySchema), getStockQuoteController);
marketsRouter.get(
  '/stocks/:symbol/chart',
  validateParams(symbolParamsSchema),
  validateQuery(chartQuerySchema),
  getStockChartController
);
marketsRouter.get(
  '/stocks/:symbol/news',
  validateParams(symbolParamsSchema),
  validateQuery(newsQuerySchema),
  getStockNewsController
);

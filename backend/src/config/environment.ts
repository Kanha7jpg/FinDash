import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  IEX_CLOUD_API_KEY: z.string().min(1).optional(),
  FINNHUB_API_KEY: z.string().min(1).optional(),
  ALPHA_VANTAGE_API_KEY: z.string().min(1).optional(),
  STOCK_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
  REDIS_REST_URL: z.string().url().optional(),
  REDIS_REST_TOKEN: z.string().min(1).optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/appError.js';
import { env } from '../config/environment.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details
    });
  }

  const message = err instanceof Error ? err.message : 'Internal server error';
  return res.status(500).json({
    message: env.NODE_ENV === 'production' ? 'Internal server error' : message
  });
}

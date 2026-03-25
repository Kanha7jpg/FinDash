import type { NextFunction, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import type { AuthenticatedRequest } from '../types/index.js';
import { AppError } from '../utils/appError.js';

export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Unauthorized'));
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);
  req.user = { id: payload.sub, email: payload.email };
  return next();
}

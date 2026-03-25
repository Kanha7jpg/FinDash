import type { Request, Response } from 'express';
import { login, logout, me, refresh, register } from '../services/authService.js';
import type { AuthenticatedRequest } from '../types/index.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { env } from '../config/environment.js';

const REFRESH_COOKIE = 'refreshToken';

function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export const registerController = asyncHandler(async (req: Request, res: Response) => {
  const result = await register(req.body);
  setRefreshCookie(res, result.tokens.refreshToken);

  res.status(201).json({
    user: result.user,
    tokens: {
      accessToken: result.tokens.accessToken
    }
  });
});

export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const result = await login(req.body);
  setRefreshCookie(res, result.tokens.refreshToken);

  res.status(200).json({
    user: result.user,
    tokens: {
      accessToken: result.tokens.accessToken
    }
  });
});

export const refreshController = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies[REFRESH_COOKIE];

  if (!refreshToken) {
    throw new AppError(401, 'Missing refresh token');
  }

  const result = await refresh(refreshToken);
  setRefreshCookie(res, result.tokens.refreshToken);

  res.status(200).json({
    user: result.user,
    tokens: {
      accessToken: result.tokens.accessToken
    }
  });
});

export const logoutController = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies[REFRESH_COOKIE];

  if (refreshToken) {
    await logout(refreshToken);
  }

  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth'
  });
  res.status(200).json({ message: 'Logged out' });
});

export const meController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError(401, 'Unauthorized');
  }

  const user = await me(req.user.id);
  res.status(200).json({ user });
});

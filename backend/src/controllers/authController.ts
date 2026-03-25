import type { Request, Response } from 'express';
import { login, logout, me, refresh, register } from '../services/authService';
import type { AuthenticatedRequest } from '../types';

const REFRESH_COOKIE = 'refreshToken';

function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/api/auth'
  });
}

export async function registerController(req: Request, res: Response) {
  const result = await register(req.body);
  setRefreshCookie(res, result.tokens.refreshToken);

  return res.status(201).json({
    user: result.user,
    tokens: {
      accessToken: result.tokens.accessToken
    }
  });
}

export async function loginController(req: Request, res: Response) {
  const result = await login(req.body);
  setRefreshCookie(res, result.tokens.refreshToken);

  return res.status(200).json({
    user: result.user,
    tokens: {
      accessToken: result.tokens.accessToken
    }
  });
}

export async function refreshController(req: Request, res: Response) {
  const refreshToken = req.cookies[REFRESH_COOKIE];

  if (!refreshToken) {
    return res.status(401).json({ message: 'Missing refresh token' });
  }

  const result = await refresh(refreshToken);
  setRefreshCookie(res, result.tokens.refreshToken);

  return res.status(200).json({
    user: result.user,
    tokens: {
      accessToken: result.tokens.accessToken
    }
  });
}

export async function logoutController(req: Request, res: Response) {
  const refreshToken = req.cookies[REFRESH_COOKIE];

  if (refreshToken) {
    await logout(refreshToken);
  }

  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  return res.status(200).json({ message: 'Logged out' });
}

export async function meController(req: AuthenticatedRequest, res: Response) {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await me(req.user.id);
  return res.status(200).json({ user });
}

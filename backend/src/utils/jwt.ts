import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/environment.js';
import { AppError } from './appError.js';

export type JwtPayload = {
  sub: string;
  email: string;
};

function assertJwtPayload(payload: unknown, tokenType: 'access' | 'refresh'): JwtPayload {
  if (
    typeof payload !== 'object' ||
    payload === null ||
    typeof (payload as Record<string, unknown>).sub !== 'string' ||
    typeof (payload as Record<string, unknown>).email !== 'string'
  ) {
    throw new AppError(401, `Invalid or expired ${tokenType} token`);
  }

  return {
    sub: (payload as Record<string, string>).sub,
    email: (payload as Record<string, string>).email
  };
}

export function signAccessToken(payload: JwtPayload): string {
  const expiresIn = env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'];

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn,
    subject: payload.sub
  });
}

export function signRefreshToken(payload: JwtPayload): string {
  const expiresIn = env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'];

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn,
    subject: payload.sub
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    return assertJwtPayload(payload, 'access');
  } catch {
    throw new AppError(401, 'Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): JwtPayload {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    return assertJwtPayload(payload, 'refresh');
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token');
  }
}

export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

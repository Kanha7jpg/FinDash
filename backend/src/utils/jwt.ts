import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/environment.js';
import { AppError } from './appError.js';

export type JwtPayload = {
  sub: string;
  email: string;
};

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    subject: payload.sub
  });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    subject: payload.sub
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    return payload;
  } catch {
    throw new AppError(401, 'Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): JwtPayload {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
    return payload;
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token');
  }
}

export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

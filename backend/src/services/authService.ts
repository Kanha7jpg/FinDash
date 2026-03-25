import { PrismaClient } from '@prisma/client';
import { comparePassword, hashPassword } from '../utils/password.js';
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../utils/appError.js';
import type { LoginInput, RegisterInput } from '../types/index.js';

const prisma = new PrismaClient();

type AuthResult = {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

async function issueTokens(user: { id: string; email: string }): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id, email: user.email });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken)
    }
  });

  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });

  if (existing) {
    throw new AppError(409, 'User already exists');
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash: await hashPassword(input.password),
      firstName: input.firstName,
      lastName: input.lastName
    }
  });

  const tokens = await issueTokens(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    tokens
  };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  const validPassword = await comparePassword(input.password, user.passwordHash);

  if (!validPassword) {
    throw new AppError(401, 'Invalid credentials');
  }

  const tokens = await issueTokens(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    tokens
  };
}

export async function refresh(rawRefreshToken: string) {
  const payload = verifyRefreshToken(rawRefreshToken);
  const tokenHash = hashToken(rawRefreshToken);

  const existing = await prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      userId: payload.sub,
      revokedAt: null
    }
  });

  if (!existing) {
    // Token reuse or unknown token: force logout of all active sessions for the user.
    await prisma.refreshToken.updateMany({
      where: {
        userId: payload.sub,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
    throw new AppError(401, 'Invalid refresh token');
  }

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() }
  });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: payload.sub } });
  const tokens = await issueTokens({ id: user.id, email: user.email });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    tokens
  };
}

export async function logout(rawRefreshToken: string): Promise<void> {
  const tokenHash = hashToken(rawRefreshToken);

  await prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  };
}

import type { Request } from 'express';

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthenticatedRequest = Request & {
  user?: AuthUser;
};

export type RegisterInput = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

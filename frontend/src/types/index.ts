export type User = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
};

export type AuthTokens = {
  accessToken: string;
};

export type AuthResponse = {
  user: User;
  tokens: AuthTokens;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export type ApiError = {
  message: string;
  details?: Record<string, string[] | undefined>;
};

export type RetriableRequestConfig = {
  _retry?: boolean;
  headers?: Record<string, string>;
};

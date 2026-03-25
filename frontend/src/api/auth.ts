import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, payload);
  return data;
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<{ user: User }>(API_ENDPOINTS.auth.me);
  return data.user;
}

export async function logout(): Promise<void> {
  await apiClient.post(API_ENDPOINTS.auth.logout);
}

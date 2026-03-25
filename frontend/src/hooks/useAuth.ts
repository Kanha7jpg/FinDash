import { useCallback, useEffect } from 'react';
import { AxiosError } from 'axios';
import { getCurrentUser, login as loginRequest, logout as logoutRequest, register as registerRequest } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import type { ApiError, LoginPayload, RegisterPayload } from '@/types';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setInitializing = useAuthStore((state) => state.setInitializing);
  const clearAuth = useAuthStore((state) => state.logout);

  const bootstrapAuth = useCallback(async () => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      setInitializing(false);
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      const accessToken = useAuthStore.getState().accessToken;

      if (accessToken) {
        setAuth(currentUser, accessToken);
      }
    } catch {
      clearAuth();
    } finally {
      setInitializing(false);
    }
  }, [clearAuth, hasHydrated, isAuthenticated, setAuth, setInitializing]);

  useEffect(() => {
    void bootstrapAuth();
  }, [bootstrapAuth]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      try {
        const response = await loginRequest(payload);
        setAuth(response.user, response.tokens.accessToken);
      } catch (error) {
        const axiosError = error as AxiosError<ApiError>;
        throw new Error(axiosError.response?.data?.message || 'Invalid credentials');
      }
    },
    [setAuth]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      try {
        const response = await registerRequest(payload);
        setAuth(response.user, response.tokens.accessToken);
      } catch (error) {
        const axiosError = error as AxiosError<ApiError>;
        throw new Error(axiosError.response?.data?.message || 'Unable to register');
      }
    },
    [setAuth]
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  return {
    user,
    isAuthenticated,
    isInitializing,
    setAuth,
    clearAuth,
    login,
    register,
    logout
  };
}

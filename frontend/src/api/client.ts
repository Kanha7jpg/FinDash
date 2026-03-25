import axios from 'axios';
import { getRequiredEnv } from '@/utils/helpers';
import { useAuthStore } from '@/store/authStore';

export const apiClient = axios.create({
  baseURL: getRequiredEnv('VITE_API_BASE_URL'),
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);

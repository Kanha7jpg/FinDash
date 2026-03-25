import axios from 'axios';
import { API_ENDPOINTS } from '@/api/endpoints';
import { getRequiredEnv } from '@/utils/helpers';
import { useAuthStore } from '@/store/authStore';
export const apiClient = axios.create({
    baseURL: getRequiredEnv('VITE_API_BASE_URL'),
    withCredentials: true
});
let refreshPromise = null;
function isAuthEndpoint(url) {
    return Boolean(url?.includes(API_ENDPOINTS.auth.login) ||
        url?.includes(API_ENDPOINTS.auth.register) ||
        url?.includes(API_ENDPOINTS.auth.refresh));
}
async function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = apiClient
            .post(API_ENDPOINTS.auth.refresh)
            .then((response) => {
            const token = response.data.tokens.accessToken;
            useAuthStore.getState().setAuth(response.data.user, token);
            return token;
        })
            .finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
}
apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
apiClient.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry || isAuthEndpoint(originalRequest.url)) {
        if (error.response?.status === 401 && isAuthEndpoint(originalRequest?.url)) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
    originalRequest._retry = true;
    try {
        const newToken = await refreshAccessToken();
        if (originalRequest.headers && 'set' in originalRequest.headers) {
            originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
        }
        else {
            originalRequest.headers = {
                Authorization: `Bearer ${newToken}`
            };
        }
        return apiClient(originalRequest);
    }
    catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
    }
});

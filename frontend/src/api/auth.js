import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
export async function login(payload) {
    const { data } = await apiClient.post(API_ENDPOINTS.auth.login, payload);
    return data;
}
export async function register(payload) {
    const { data } = await apiClient.post(API_ENDPOINTS.auth.register, payload);
    return data;
}
export async function getCurrentUser() {
    const { data } = await apiClient.get(API_ENDPOINTS.auth.me);
    return data.user;
}
export async function logout() {
    await apiClient.post(API_ENDPOINTS.auth.logout);
}

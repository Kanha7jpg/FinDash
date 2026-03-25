import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useAuthStore = create()(persist((set) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isInitializing: true,
    hasHydrated: false,
    setAuth: (user, accessToken) => set({
        user,
        accessToken,
        isAuthenticated: true
    }),
    setAccessToken: (accessToken) => set((state) => ({
        accessToken,
        isAuthenticated: Boolean(accessToken && state.user)
    })),
    setInitializing: (value) => set({ isInitializing: value }),
    setHasHydrated: (value) => set({ hasHydrated: value }),
    logout: () => set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isInitializing: false
    })
}), {
    name: 'financial-dashboard-auth',
    partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated
    }),
    onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
    }
}));

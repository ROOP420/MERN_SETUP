import { create } from 'zustand';
import { User } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;

    // Actions
    setUser: (user: User | null) => void;
    setAccessToken: (token: string | null) => void;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,

    setUser: (user) => {
        set({ user, isAuthenticated: !!user });
    },

    setAccessToken: (accessToken) => {
        set({ accessToken });
    },

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const response = await authService.login({ email, password });
            if (response.success && response.data) {
                set({
                    user: response.data.user,
                    accessToken: response.data.accessToken,
                    isAuthenticated: true,
                });
            }
        } finally {
            set({ isLoading: false });
        }
    },

    register: async (name, email, password) => {
        set({ isLoading: true });
        try {
            const response = await authService.register({ name, email, password });
            if (response.success && response.data) {
                set({
                    user: response.data.user,
                    accessToken: response.data.accessToken,
                    isAuthenticated: true,
                });
            }
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        try {
            await authService.logout();
        } catch {
            // Ignore errors during logout
        } finally {
            set({
                user: null,
                accessToken: null,
                isAuthenticated: false,
            });
        }
    },

    checkAuth: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
            const response = await authService.getMe();
            if (response.success && response.data) {
                set({ user: response.data.user, isAuthenticated: true });
            }
        } catch {
            set({ user: null, accessToken: null, isAuthenticated: false });
        }
    },

    initialize: async () => {
        if (get().isInitialized) return;

        set({ isLoading: true });
        try {
            // Try to refresh token on app load
            const response = await authService.refreshToken();
            if (response.success && response.data) {
                set({ accessToken: response.data.accessToken });
                // Get user data
                const userResponse = await authService.getMe();
                if (userResponse.success && userResponse.data) {
                    set({ user: userResponse.data.user, isAuthenticated: true });
                }
            }
        } catch {
            // Not authenticated
            set({ user: null, accessToken: null, isAuthenticated: false });
        } finally {
            set({ isLoading: false, isInitialized: true });
        }
    },
}));

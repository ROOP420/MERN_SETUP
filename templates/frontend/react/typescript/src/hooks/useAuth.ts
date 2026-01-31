import { useAuthStore } from '@/stores/authStore';

export const useAuth = () => {
    const {
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        isInitialized,
        login,
        register,
        logout,
        checkAuth,
        initialize,
    } = useAuthStore();

    return {
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        isInitialized,
        login,
        register,
        logout,
        checkAuth,
        initialize,
    };
};

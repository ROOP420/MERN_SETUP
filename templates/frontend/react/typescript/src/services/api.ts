import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Send cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - attach access token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const accessToken = useAuthStore.getState().accessToken;
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Track if we're currently refreshing
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
};

// Response interceptor - handle 401 and refresh token
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Skip refresh logic for auth endpoints to prevent infinite loop
        const isAuthEndpoint = originalRequest.url?.includes('/auth/refresh') ||
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register');

        // If error is 401, not an auth endpoint, and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    // Try to refresh the token
                    const response = await axios.post(
                        `${API_URL}/auth/refresh`,
                        {},
                        { withCredentials: true }
                    );

                    const { accessToken } = response.data.data;
                    useAuthStore.getState().setAccessToken(accessToken);

                    isRefreshing = false;
                    onTokenRefreshed(accessToken);

                    // Retry the original request
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    isRefreshing = false;
                    refreshSubscribers = [];

                    // Refresh failed - just reject, don't redirect (let the component handle it)
                    return Promise.reject(refreshError);
                }
            }

            // Wait for refresh to complete
            return new Promise((resolve, reject) => {
                subscribeTokenRefresh((token: string) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    resolve(api(originalRequest));
                });
                // Also handle refresh failure
                setTimeout(() => {
                    if (isRefreshing) {
                        reject(error);
                    }
                }, 10000); // 10 second timeout
            });
        }

        return Promise.reject(error);
    }
);

export default api;

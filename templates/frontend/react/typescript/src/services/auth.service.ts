import api from './api';
import { User, ApiResponse } from '@/types';

export interface AuthResponse {
    user: User;
    accessToken: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export const authService = {
    async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
        return response.data;
    },

    async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
        return response.data;
    },

    async logout(): Promise<ApiResponse<null>> {
        const response = await api.post<ApiResponse<null>>('/auth/logout');
        return response.data;
    },

    async getMe(): Promise<ApiResponse<{ user: User }>> {
        const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
        return response.data;
    },

    async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
        const response = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
        return response.data;
    },

    async forgotPassword(email: string): Promise<ApiResponse<null>> {
        const response = await api.post<ApiResponse<null>>('/auth/forgot-password', { email });
        return response.data;
    },

    async resetPassword(token: string, password: string): Promise<ApiResponse<null>> {
        const response = await api.post<ApiResponse<null>>(`/auth/reset-password/${token}`, { password, confirmPassword: password });
        return response.data;
    },

    async verifyEmail(token: string): Promise<ApiResponse<null>> {
        const response = await api.get<ApiResponse<null>>(`/auth/verify-email/${token}`);
        return response.data;
    },

    getGoogleAuthUrl(): string {
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        return `${apiUrl}/auth/google`;
    },

    getGitHubAuthUrl(): string {
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        return `${apiUrl}/auth/github`;
    },
};

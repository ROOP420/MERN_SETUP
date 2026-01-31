import { useState, useCallback } from 'react';
import api from '@/services/api';
import { AxiosError } from 'axios';
import { ApiError } from '@/types';

interface UseApiOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
}

export const useApi = <T = any>(options?: UseApiOptions<T>) => {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<ApiError | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const execute = useCallback(
        async (
            method: 'get' | 'post' | 'put' | 'patch' | 'delete',
            url: string,
            body?: any
        ) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await api[method]<{ success: boolean; data: T }>(url, body);
                setData(response.data.data);
                options?.onSuccess?.(response.data.data);
                return response.data.data;
            } catch (err) {
                const axiosError = err as AxiosError<ApiError>;
                const apiError: ApiError = axiosError.response?.data || {
                    success: false,
                    statusCode: 500,
                    message: 'An unexpected error occurred',
                };
                setError(apiError);
                options?.onError?.(apiError);
                throw apiError;
            } finally {
                setIsLoading(false);
            }
        },
        [options]
    );

    const get = useCallback((url: string) => execute('get', url), [execute]);
    const post = useCallback((url: string, body?: any) => execute('post', url, body), [execute]);
    const put = useCallback((url: string, body?: any) => execute('put', url, body), [execute]);
    const patch = useCallback((url: string, body?: any) => execute('patch', url, body), [execute]);
    const del = useCallback((url: string) => execute('delete', url), [execute]);

    return {
        data,
        error,
        isLoading,
        get,
        post,
        put,
        patch,
        delete: del,
        execute,
    };
};

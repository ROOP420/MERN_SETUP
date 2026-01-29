export interface ApiResponse<T = any> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T | null;
}

export interface ApiError {
    success: false;
    statusCode: number;
    message: string;
    errors?: Array<{
        field: string;
        message: string;
    }>;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

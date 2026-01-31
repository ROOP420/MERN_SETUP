export class ApiResponse<T = any> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T | null;

    constructor(statusCode: number, message: string, data: T | null = null) {
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }

    static success<T>(data: T, message = 'Success') {
        return new ApiResponse<T>(200, message, data);
    }

    static created<T>(data: T, message = 'Created successfully') {
        return new ApiResponse<T>(201, message, data);
    }

    static noContent(message = 'No content') {
        return new ApiResponse(204, message, null);
    }
}

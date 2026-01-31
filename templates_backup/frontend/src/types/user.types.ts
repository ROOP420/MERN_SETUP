export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role: 'user' | 'admin' | 'moderator';
    isEmailVerified: boolean;
    authProvider: 'local' | 'google' | 'github';
    createdAt?: string;
}

export interface UpdateProfileData {
    name?: string;
    avatar?: string;
}

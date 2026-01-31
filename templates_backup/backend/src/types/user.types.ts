import { Document, Types } from 'mongoose';

export interface IUser extends Document {
    _id: Types.ObjectId;
    email: string;
    password?: string;
    name: string;
    avatar?: string;
    role: 'user' | 'admin' | 'moderator';
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpiry?: Date;
    passwordResetToken?: string;
    passwordResetExpiry?: Date;
    googleId?: string;
    githubId?: string;
    authProvider: 'local' | 'google' | 'github';
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserRole = 'user' | 'admin' | 'moderator';
export type AuthProvider = 'local' | 'google' | 'github';

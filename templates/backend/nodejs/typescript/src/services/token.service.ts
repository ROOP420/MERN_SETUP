import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { Types } from 'mongoose';
import { env } from '../config/env.config.js';
import { RefreshToken } from '../models/RefreshToken.model.js';
import { TokenPayload, AuthTokens } from '../types/auth.types.js';

// Convert time string to seconds for JWT
const parseTimeToSeconds = (timeStr: string): number => {
    const match = timeStr.match(/^(\d+)([smhdw])$/);
    if (!match) return 15 * 60; // default 15 minutes

    const value = parseInt(match[1] ?? '15', 10);
    const unit = match[2];

    switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 60 * 60;
        case 'd': return value * 60 * 60 * 24;
        case 'w': return value * 60 * 60 * 24 * 7;
        default: return 15 * 60;
    }
};

export class TokenService {
    /**
     * Generate access token (short-lived)
     */
    static generateAccessToken(userId: string): string {
        const payload: TokenPayload = {
            userId,
            type: 'access',
        };

        const options: SignOptions = {
            expiresIn: parseTimeToSeconds(env.ACCESS_TOKEN_EXPIRY),
        };

        return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, options);
    }

    /**
     * Generate refresh token and store in database
     */
    static async generateRefreshToken(
        userId: Types.ObjectId,
        userAgent?: string,
        ipAddress?: string
    ): Promise<string> {
        // Generate random token
        const rawToken = crypto.randomBytes(64).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        // Calculate expiry (7 days)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Store in database
        await RefreshToken.create({
            token: hashedToken,
            user: userId,
            expiresAt,
            userAgent,
            ipAddress,
        });

        return rawToken;
    }

    /**
     * Generate both access and refresh tokens
     */
    static async generateTokens(
        userId: Types.ObjectId,
        userAgent?: string,
        ipAddress?: string
    ): Promise<AuthTokens> {
        const accessToken = this.generateAccessToken(userId.toString());
        const refreshToken = await this.generateRefreshToken(userId, userAgent, ipAddress);

        return { accessToken, refreshToken };
    }

    /**
     * Verify access token
     */
    static verifyAccessToken(token: string): TokenPayload | null {
        try {
            const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as TokenPayload;
            if (payload.type !== 'access') return null;
            return payload;
        } catch {
            return null;
        }
    }

    /**
     * Find and validate refresh token from database
     */
    static async findRefreshToken(rawToken: string) {
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        const refreshToken = await RefreshToken.findOne({
            token: hashedToken,
            isRevoked: false,
            expiresAt: { $gt: new Date() },
        }).populate('user');

        return refreshToken;
    }

    /**
     * Rotate refresh token (revoke old, create new)
     */
    static async rotateRefreshToken(
        oldRawToken: string,
        userId: Types.ObjectId,
        userAgent?: string,
        ipAddress?: string
    ): Promise<AuthTokens> {
        // Revoke old token
        const hashedToken = crypto.createHash('sha256').update(oldRawToken).digest('hex');
        await RefreshToken.updateOne(
            { token: hashedToken },
            { isRevoked: true }
        );

        // Generate new tokens
        return this.generateTokens(userId, userAgent, ipAddress);
    }

    /**
     * Revoke a specific refresh token
     */
    static async revokeRefreshToken(rawToken: string): Promise<void> {
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        await RefreshToken.updateOne(
            { token: hashedToken },
            { isRevoked: true }
        );
    }

    /**
     * Revoke all refresh tokens for a user
     */
    static async revokeAllUserTokens(userId: Types.ObjectId): Promise<void> {
        await RefreshToken.updateMany(
            { user: userId },
            { isRevoked: true }
        );
    }

    /**
     * Clean up expired tokens (can be run as a cron job)
     */
    static async cleanupExpiredTokens(): Promise<number> {
        const result = await RefreshToken.deleteMany({
            $or: [
                { expiresAt: { $lt: new Date() } },
                { isRevoked: true },
            ],
        });
        return result.deletedCount;
    }
}

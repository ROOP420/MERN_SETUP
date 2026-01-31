import mongoose, { Schema, Document, Types } from 'mongoose';
import crypto from 'crypto';

export interface IRefreshToken extends Document {
    _id: Types.ObjectId;
    token: string;
    user: Types.ObjectId;
    expiresAt: Date;
    isRevoked: boolean;
    userAgent?: string;
    ipAddress?: string;
    createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
    {
        token: {
            type: String,
            required: true,
            unique: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        isRevoked: {
            type: Boolean,
            default: false,
        },
        userAgent: {
            type: String,
        },
        ipAddress: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Note: token index is created automatically by unique:true
// Index for user lookups and TTL cleanup
refreshTokenSchema.index({ user: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Static method to create a hashed token
refreshTokenSchema.statics.createToken = function (userId: Types.ObjectId) {
    const rawToken = crypto.randomBytes(64).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    return {
        rawToken,
        hashedToken,
        userId,
    };
};

// Static method to find by raw token
refreshTokenSchema.statics.findByToken = async function (rawToken: string) {
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    return this.findOne({
        token: hashedToken,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
    });
};

// Static method to revoke all tokens for a user
refreshTokenSchema.statics.revokeAllForUser = async function (userId: Types.ObjectId) {
    return this.updateMany(
        { user: userId },
        { isRevoked: true }
    );
};

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);

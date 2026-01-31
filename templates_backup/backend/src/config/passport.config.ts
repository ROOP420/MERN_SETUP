import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { env } from './env.config.js';
import { User } from '../models/User.model.js';

export const configurePassport = (): void => {
    // Google OAuth Strategy
    if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL) {
        passport.use(
            new GoogleStrategy(
                {
                    clientID: env.GOOGLE_CLIENT_ID,
                    clientSecret: env.GOOGLE_CLIENT_SECRET,
                    callbackURL: env.GOOGLE_CALLBACK_URL,
                    scope: ['profile', 'email'],
                },
                async (_accessToken, _refreshToken, profile, done) => {
                    try {
                        const email = profile.emails?.[0]?.value;
                        if (!email) {
                            return done(new Error('No email found in Google profile'), undefined);
                        }

                        // Find or create user
                        let user = await User.findOne({ email });

                        if (user) {
                            // Link Google account if not already linked
                            if (!user.googleId) {
                                user.googleId = profile.id;
                                user.isEmailVerified = true;
                                await user.save();
                            }
                        } else {
                            // Create new user
                            user = await User.create({
                                email,
                                name: profile.displayName || email.split('@')[0],
                                googleId: profile.id,
                                avatar: profile.photos?.[0]?.value,
                                isEmailVerified: true,
                                authProvider: 'google',
                            });
                        }

                        return done(null, user);
                    } catch (error) {
                        return done(error as Error, undefined);
                    }
                }
            )
        );
    }

    // GitHub OAuth Strategy
    if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET && env.GITHUB_CALLBACK_URL) {
        passport.use(
            new GitHubStrategy(
                {
                    clientID: env.GITHUB_CLIENT_ID,
                    clientSecret: env.GITHUB_CLIENT_SECRET,
                    callbackURL: env.GITHUB_CALLBACK_URL,
                    scope: ['user:email'],
                },
                async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
                    try {
                        const email = profile.emails?.[0]?.value;
                        if (!email) {
                            return done(new Error('No email found in GitHub profile'), undefined);
                        }

                        // Find or create user
                        let user = await User.findOne({ email });

                        if (user) {
                            // Link GitHub account if not already linked
                            if (!user.githubId) {
                                user.githubId = profile.id;
                                user.isEmailVerified = true;
                                await user.save();
                            }
                        } else {
                            // Create new user
                            user = await User.create({
                                email,
                                name: profile.displayName || profile.username || email.split('@')[0],
                                githubId: profile.id,
                                avatar: profile.photos?.[0]?.value,
                                isEmailVerified: true,
                                authProvider: 'github',
                            });
                        }

                        return done(null, user);
                    } catch (error) {
                        return done(error as Error, undefined);
                    }
                }
            )
        );
    }

    // Serialize user for session (if needed)
    passport.serializeUser((user: any, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

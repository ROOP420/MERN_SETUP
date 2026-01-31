import nodemailer from 'nodemailer';
import { env } from '../config/env.config.js';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

class EmailService {
    private transporter: nodemailer.Transporter | null = null;

    constructor() {
        if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
            this.transporter = nodemailer.createTransport({
                host: env.SMTP_HOST,
                port: env.SMTP_PORT || 587,
                secure: env.SMTP_PORT === 465,
                auth: {
                    user: env.SMTP_USER,
                    pass: env.SMTP_PASS,
                },
            });
        }
    }

    async sendEmail(options: EmailOptions): Promise<boolean> {
        if (!this.transporter) {
            console.warn('⚠️ Email service not configured. Skipping email:', options.subject);
            return false;
        }

        try {
            await this.transporter.sendMail({
                from: `"Your App" <${env.SMTP_USER}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
            });
            return true;
        } catch (error) {
            console.error('❌ Email sending failed:', error);
            return false;
        }
    }

    async sendVerificationEmail(email: string, token: string): Promise<boolean> {
        const verificationUrl = `${env.CLIENT_URL}/verify-email/${token}`;

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Verify Your Email</h1>
            </div>
            <div style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                Welcome! Please click the button below to verify your email address and complete your registration.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Verify Email
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                If you didn't create an account, you can safely ignore this email.
              </p>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                This link will expire in 24 hours.
              </p>
            </div>
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Your App. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

        return this.sendEmail({
            to: email,
            subject: 'Verify Your Email Address',
            html,
        });
    }

    async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
        const resetUrl = `${env.CLIENT_URL}/reset-password/${token}`;

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Reset Your Password</h1>
            </div>
            <div style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                We received a request to reset your password. Click the button below to create a new password.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                If you didn't request a password reset, you can safely ignore this email.
              </p>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                This link will expire in 1 hour.
              </p>
            </div>
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Your App. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

        return this.sendEmail({
            to: email,
            subject: 'Reset Your Password',
            html,
        });
    }
}

export const emailService = new EmailService();

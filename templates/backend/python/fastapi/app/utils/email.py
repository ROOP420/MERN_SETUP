"""
Email utilities for sending emails
"""
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template
from app.config import settings
import logging

logger = logging.getLogger(__name__)


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
):
    """
    Send an email
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML email body
        text_content: Plain text email body (optional)
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured, email not sent")
        return
    
    message = MIMEMultipart("alternative")
    message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    message["To"] = to_email
    message["Subject"] = subject
    
    # Add plain text part
    if text_content:
        text_part = MIMEText(text_content, "plain")
        message.attach(text_part)
    
    # Add HTML part
    html_part = MIMEText(html_content, "html")
    message.attach(html_part)
    
    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=True
        )
        logger.info(f"Email sent successfully to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        raise


async def send_verification_email(email: str, token: str):
    """
    Send email verification link
    
    Args:
        email: User's email address
        token: Verification token
    """
    verification_url = f"http://localhost:5173/verify-email?token={token}"
    
    html_template = Template("""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #007bff; 
                color: white; 
                text-decoration: none; 
                border-radius: 4px; 
                margin: 20px 0;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for registering! Please click the button below to verify your email address:</p>
            <a href="{{ verification_url }}" class="button">Verify Email</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>{{ verification_url }}</p>
            <div class="footer">
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't create an account, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
    """)
    
    html_content = html_template.render(verification_url=verification_url)
    text_content = f"Verify your email by clicking: {verification_url}"
    
    await send_email(
        to_email=email,
        subject="Verify Your Email Address",
        html_content=html_content,
        text_content=text_content
    )


async def send_password_reset_email(email: str, token: str):
    """
    Send password reset link
    
    Args:
        email: User's email address
        token: Password reset token
    """
    reset_url = f"http://localhost:5173/reset-password?token={token}"
    
    html_template = Template("""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #dc3545; 
                color: white; 
                text-decoration: none; 
                border-radius: 4px; 
                margin: 20px 0;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password. Click the button below to proceed:</p>
            <a href="{{ reset_url }}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>{{ reset_url }}</p>
            <div class="footer">
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request a password reset, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
    """)
    
    html_content = html_template.render(reset_url=reset_url)
    text_content = f"Reset your password by clicking: {reset_url}"
    
    await send_email(
        to_email=email,
        subject="Reset Your Password",
        html_content=html_content,
        text_content=text_content
    )

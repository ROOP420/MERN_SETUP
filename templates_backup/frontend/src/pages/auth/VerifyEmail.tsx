import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/utils/constants';

export const VerifyEmail: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link');
                return;
            }

            try {
                await authService.verifyEmail(token);
                setStatus('success');
                setMessage('Your email has been verified successfully!');
            } catch (err: any) {
                setStatus('error');
                setMessage(err.message || 'Verification failed. The link may be expired.');
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="h-16 w-16 mx-auto mb-6 text-primary-600 animate-spin" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying your email...</h1>
                        <p className="text-gray-500">Please wait while we verify your email address.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
                        <p className="text-gray-500 mb-8">{message}</p>
                        <Link to={ROUTES.DASHBOARD}>
                            <Button>Go to Dashboard</Button>
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
                        <p className="text-gray-500 mb-8">{message}</p>
                        <Link to={ROUTES.LOGIN}>
                            <Button variant="outline">Back to Login</Button>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

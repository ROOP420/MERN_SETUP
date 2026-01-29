import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/forms/FormField';
import { FormError } from '@/components/forms/FormError';
import { resetPasswordSchema, ResetPasswordFormData } from '@/schemas/auth.schema';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/utils/constants';

export const ResetPassword: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const methods = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            setError('Invalid reset link');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await authService.resetPassword(token, data.password);
            setIsSuccess(true);
            toast.success('Password reset successful!');
        } catch (err: any) {
            setError(err.message || 'Failed to reset password. The link may be expired.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center">
                <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Password reset!</h1>
                <p className="text-gray-500 mb-8">
                    Your password has been successfully reset. You can now login with your new password.
                </p>
                <Button onClick={() => navigate(ROUTES.LOGIN)}>
                    Go to login
                </Button>
            </div>
        );
    }

    return (
        <div>
            {/* Logo for mobile */}
            <div className="lg:hidden flex items-center gap-2 mb-8">
                <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
                    <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="font-semibold text-xl text-gray-900">MERN Pro</span>
            </div>

            <Link
                to={ROUTES.LOGIN}
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to login
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset your password</h1>
            <p className="text-gray-500 mb-8">
                Enter your new password below.
            </p>

            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-5">
                    {error && <FormError message={error} />}

                    <FormField
                        name="password"
                        label="New Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        leftIcon={<Lock className="h-5 w-5" />}
                        rightIcon={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        }
                    />

                    <FormField
                        name="confirmPassword"
                        label="Confirm Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        leftIcon={<Lock className="h-5 w-5" />}
                    />

                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        Reset password
                    </Button>
                </form>
            </FormProvider>
        </div>
    );
};

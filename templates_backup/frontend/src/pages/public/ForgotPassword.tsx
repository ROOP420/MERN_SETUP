import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/forms/FormField';
import { FormError } from '@/components/forms/FormError';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/schemas/auth.schema';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/utils/constants';

export const ForgotPassword: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const methods = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        setError(null);
        try {
            await authService.forgotPassword(data.email);
            setIsSuccess(true);
        } catch (err: any) {
            // Always show success to prevent email enumeration
            setIsSuccess(true);
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
                <p className="text-gray-500 mb-8">
                    If an account exists with that email, we've sent password reset instructions.
                </p>
                <Link
                    to={ROUTES.LOGIN}
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                </Link>
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

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot password?</h1>
            <p className="text-gray-500 mb-8">
                Enter your email and we'll send you instructions to reset your password.
            </p>

            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-5">
                    {error && <FormError message={error} />}

                    <FormField
                        name="email"
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        leftIcon={<Mail className="h-5 w-5" />}
                    />

                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        Send reset link
                    </Button>
                </form>
            </FormProvider>
        </div>
    );
};

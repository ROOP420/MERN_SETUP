import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants';
import { useAuth } from '@/hooks/useAuth';

export const Home: React.FC = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
                <div className="container mx-auto px-4 py-24">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                            Build Amazing Apps with{' '}
                            <span className="gradient-text">MERN Stack</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Production-ready starter template with TypeScript, authentication,
                            and all the best practices built-in. Start building your next project today.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {isAuthenticated ? (
                                <Link to={ROUTES.DASHBOARD}>
                                    <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                                        Go to Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link to={ROUTES.SIGNUP}>
                                        <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                                            Get Started Free
                                        </Button>
                                    </Link>
                                    <Link to={ROUTES.LOGIN}>
                                        <Button variant="outline" size="lg">
                                            Sign In
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Everything You Need
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Built with the best technologies and practices for production applications.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="p-8 rounded-2xl border border-gray-200 hover:border-primary-200 hover:shadow-lg transition-all">
                            <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center mb-6">
                                <Shield className="h-6 w-6 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Secure Authentication
                            </h3>
                            <p className="text-gray-600">
                                JWT tokens, OAuth providers, email verification, and password reset - all built-in and secure.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl border border-gray-200 hover:border-primary-200 hover:shadow-lg transition-all">
                            <div className="h-12 w-12 rounded-xl bg-secondary-100 flex items-center justify-center mb-6">
                                <Code2 className="h-6 w-6 text-secondary-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                TypeScript First
                            </h3>
                            <p className="text-gray-600">
                                Full type safety across your entire application - frontend and backend.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl border border-gray-200 hover:border-primary-200 hover:shadow-lg transition-all">
                            <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center mb-6">
                                <Zap className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Production Ready
                            </h3>
                            <p className="text-gray-600">
                                Rate limiting, error handling, validation, and security headers configured out of the box.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 gradient-primary">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                        Join thousands of developers building with MERN Pro.
                    </p>
                    <Link to={ROUTES.SIGNUP}>
                        <Button
                            size="lg"
                            variant="secondary"
                            className="!bg-white !text-primary-600 hover:!bg-gray-100 font-semibold"
                        >
                            Create Free Account
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

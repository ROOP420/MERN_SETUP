import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { APP_NAME, ROUTES } from '@/utils/constants';
import { getInitials } from '@/utils/formatters';

export const Header: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleLogout = async () => {
        await logout();
        navigate(ROUTES.LOGIN);
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to={ROUTES.HOME} className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                            <span className="text-white font-bold text-sm">M</span>
                        </div>
                        <span className="font-semibold text-gray-900">{APP_NAME}</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to={ROUTES.DASHBOARD}
                                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <div className="flex items-center gap-4">
                                    <Link
                                        to={ROUTES.PROFILE}
                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="h-8 w-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                                <span className="text-xs font-medium text-primary-600">
                                                    {getInitials(user?.name || 'U')}
                                                </span>
                                            </div>
                                        )}
                                        <span>{user?.name}</span>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleLogout}
                                        leftIcon={<LogOut className="h-4 w-4" />}
                                    >
                                        Logout
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    to={ROUTES.LOGIN}
                                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Login
                                </Link>
                                <Button size="sm" onClick={() => navigate(ROUTES.SIGNUP)}>
                                    Get Started
                                </Button>
                            </>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-600"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <nav className="flex flex-col gap-4">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to={ROUTES.DASHBOARD}
                                        className="text-sm text-gray-600 hover:text-gray-900"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to={ROUTES.PROFILE}
                                        className="text-sm text-gray-600 hover:text-gray-900"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        className="text-sm text-left text-red-600 hover:text-red-700"
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            handleLogout();
                                        }}
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to={ROUTES.LOGIN}
                                        className="text-sm text-gray-600 hover:text-gray-900"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to={ROUTES.SIGNUP}
                                        className="text-sm text-primary-600 hover:text-primary-700"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

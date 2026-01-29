import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '@/utils/constants';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-gray-200 bg-white">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded gradient-primary flex items-center justify-center">
                            <span className="text-white font-bold text-xs">M</span>
                        </div>
                        <span className="text-sm text-gray-600">
                            © {currentYear} {APP_NAME}. All rights reserved.
                        </span>
                    </div>

                    <nav className="flex items-center gap-6">
                        <Link
                            to="/terms"
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Terms
                        </Link>
                        <Link
                            to="/privacy"
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Privacy
                        </Link>
                        <Link
                            to="/contact"
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Contact
                        </Link>
                    </nav>
                </div>
            </div>
        </footer>
    );
};

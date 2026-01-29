import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout: React.FC = () => {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export const AuthLayout: React.FC = () => {
    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12">
                <div className="max-w-md text-white">
                    <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center mb-8">
                        <span className="text-3xl font-bold">M</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">
                        Welcome to MERN Pro
                    </h1>
                    <p className="text-lg text-white/80">
                        Build production-ready applications with our comprehensive MERN stack starter.
                        Secure authentication, beautiful UI, and best practices built-in.
                    </p>
                </div>
            </div>

            {/* Right side - Auth form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

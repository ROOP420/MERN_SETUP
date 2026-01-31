import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Layout, AuthLayout } from '@/components/layout';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { Home, Login, Signup, ForgotPassword, ResetPassword } from '@/pages/public';
import { Dashboard, Profile } from '@/pages/protected';
import { AuthCallback, VerifyEmail } from '@/pages/auth';

const router = createBrowserRouter([
    // Public routes with main layout
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: 'dashboard',
                element: (
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'profile',
                element: (
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                ),
            },
        ],
    },
    // Auth routes with auth layout
    {
        element: <AuthLayout />,
        children: [
            {
                path: 'login',
                element: <Login />,
            },
            {
                path: 'signup',
                element: <Signup />,
            },
            {
                path: 'forgot-password',
                element: <ForgotPassword />,
            },
            {
                path: 'reset-password/:token',
                element: <ResetPassword />,
            },
        ],
    },
    // Special auth pages (no layout)
    {
        path: 'auth/callback',
        element: <AuthCallback />,
    },
    {
        path: 'verify-email/:token',
        element: <VerifyEmail />,
    },
    // Catch all - redirect to home
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);

export const Router: React.FC = () => {
    return <RouterProvider router={router} />;
};

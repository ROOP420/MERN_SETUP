import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { Router } from '@/routes/Router';
import { PageLoader } from '@/components/ui/Loader';

const App: React.FC = () => {
    const { initialize, isInitialized } = useAuthStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    // Show loader while initializing auth
    if (!isInitialized) {
        return <PageLoader />;
    }

    return (
        <>
            <Router />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#333',
                        color: '#fff',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10B981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </>
    );
};

export default App;

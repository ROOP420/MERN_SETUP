import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader } from '@/components/ui/Loader';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/utils/constants';

export const AuthCallback: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setAccessToken, setUser } = useAuthStore();

    useEffect(() => {
        const handleCallback = async () => {
            const token = searchParams.get('token');
            const error = searchParams.get('error');

            if (error) {
                navigate(`${ROUTES.LOGIN}?error=${error}`);
                return;
            }

            if (token) {
                setAccessToken(token);

                try {
                    const response = await authService.getMe();
                    if (response.success && response.data) {
                        setUser(response.data.user);
                        navigate(ROUTES.DASHBOARD);
                    }
                } catch {
                    navigate(ROUTES.LOGIN);
                }
            } else {
                navigate(ROUTES.LOGIN);
            }
        };

        handleCallback();
    }, [navigate, searchParams, setAccessToken, setUser]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader size="lg" text="Completing authentication..." />
        </div>
    );
};

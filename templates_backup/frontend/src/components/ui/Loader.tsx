import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/formatters';

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    fullScreen?: boolean;
    text?: string;
}

export const Loader: React.FC<LoaderProps> = ({
    size = 'md',
    className,
    fullScreen = false,
    text,
}) => {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    const loader = (
        <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
            <Loader2 className={cn('animate-spin text-primary-600', sizes[size])} />
            {text && <p className="text-sm text-gray-500">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                {loader}
            </div>
        );
    }

    return loader;
};

export const PageLoader: React.FC = () => (
    <div className="flex h-screen items-center justify-center">
        <Loader size="lg" text="Loading..." />
    </div>
);

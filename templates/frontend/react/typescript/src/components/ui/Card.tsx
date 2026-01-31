import React from 'react';
import { cn } from '@/utils/formatters';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    children,
    className,
    padding = 'md',
}) => {
    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            className={cn(
                'bg-white rounded-xl shadow-sm border border-gray-200',
                paddings[padding],
                className
            )}
        >
            {children}
        </div>
    );
};

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
    <div className={cn('mb-4', className)}>{children}</div>
);

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
        {children}
    </h3>
);

interface CardDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
    children,
    className,
}) => <p className={cn('text-sm text-gray-500', className)}>{children}</p>;

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
    children,
    className,
}) => <div className={cn('', className)}>{children}</div>;

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
    children,
    className,
}) => <div className={cn('mt-4 pt-4 border-t border-gray-100', className)}>{children}</div>;

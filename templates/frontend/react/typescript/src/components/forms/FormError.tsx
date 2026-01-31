import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
    message?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ message }) => {
    if (!message) return null;

    return (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="text-sm">{message}</p>
        </div>
    );
};

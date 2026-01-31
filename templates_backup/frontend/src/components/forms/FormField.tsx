import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/Input';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    name: string;
    label?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
    name,
    label,
    leftIcon,
    rightIcon,
    ...props
}) => {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    const error = errors[name];

    return (
        <Input
            {...register(name)}
            label={label}
            error={error?.message as string | undefined}
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            {...props}
        />
    );
};

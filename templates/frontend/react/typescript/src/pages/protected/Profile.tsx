import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Shield, Camera, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { FormField } from '@/components/forms/FormField';
import { FormError } from '@/components/forms/FormError';
import { updateProfileSchema, changePasswordSchema, UpdateProfileFormData, ChangePasswordFormData } from '@/schemas/user.schema';
import api from '@/services/api';
import { getInitials } from '@/utils/formatters';

export const Profile: React.FC = () => {
    const { user } = useAuth();
    const [isUpdating, setIsUpdating] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const profileMethods = useForm<UpdateProfileFormData>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            name: user?.name || '',
            avatar: user?.avatar || '',
        },
    });

    const passwordMethods = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onUpdateProfile = async (data: UpdateProfileFormData) => {
        setIsUpdating(true);
        setProfileError(null);
        try {
            await api.put('/users/me', data);
            toast.success('Profile updated successfully!');
        } catch (err: any) {
            setProfileError(err.message || 'Failed to update profile');
        } finally {
            setIsUpdating(false);
        }
    };

    const onChangePassword = async (data: ChangePasswordFormData) => {
        setIsChangingPassword(true);
        setPasswordError(null);
        try {
            await api.put('/users/me/password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            passwordMethods.reset();
            toast.success('Password changed successfully!');
        } catch (err: any) {
            setPasswordError(err.message || 'Failed to change password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
                <p className="text-gray-600">Manage your account settings</p>
            </div>

            <div className="max-w-2xl space-y-8">
                {/* Profile Overview */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="h-20 w-20 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                                        <span className="text-2xl font-semibold text-primary-600">
                                            {getInitials(user?.name || 'U')}
                                        </span>
                                    </div>
                                )}
                                <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50">
                                    <Camera className="h-4 w-4 text-gray-600" />
                                </button>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{user?.name}</h3>
                                <p className="text-gray-500">{user?.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user?.isEmailVerified
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        <Shield className="h-3 w-3" />
                                        {user?.isEmailVerified ? 'Verified' : 'Unverified'}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                                        {user?.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Update Profile */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Update Profile
                        </CardTitle>
                        <CardDescription>Update your personal information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormProvider {...profileMethods}>
                            <form onSubmit={profileMethods.handleSubmit(onUpdateProfile)} className="space-y-4">
                                {profileError && <FormError message={profileError} />}
                                <FormField
                                    name="name"
                                    label="Full Name"
                                    placeholder="Your name"
                                    leftIcon={<User className="h-5 w-5" />}
                                />
                                <FormField
                                    name="avatar"
                                    label="Avatar URL"
                                    placeholder="https://example.com/avatar.jpg"
                                    leftIcon={<Camera className="h-5 w-5" />}
                                />
                                <Button type="submit" isLoading={isUpdating}>
                                    Save Changes
                                </Button>
                            </form>
                        </FormProvider>
                    </CardContent>
                </Card>

                {/* Change Password */}
                {user?.authProvider === 'local' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Change Password
                            </CardTitle>
                            <CardDescription>Update your password</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormProvider {...passwordMethods}>
                                <form onSubmit={passwordMethods.handleSubmit(onChangePassword)} className="space-y-4">
                                    {passwordError && <FormError message={passwordError} />}
                                    <FormField
                                        name="currentPassword"
                                        label="Current Password"
                                        type={showPasswords ? 'text' : 'password'}
                                        placeholder="Enter current password"
                                        leftIcon={<Lock className="h-5 w-5" />}
                                        rightIcon={
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(!showPasswords)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                {showPasswords ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        }
                                    />
                                    <FormField
                                        name="newPassword"
                                        label="New Password"
                                        type={showPasswords ? 'text' : 'password'}
                                        placeholder="Enter new password"
                                        leftIcon={<Lock className="h-5 w-5" />}
                                    />
                                    <FormField
                                        name="confirmPassword"
                                        label="Confirm Password"
                                        type={showPasswords ? 'text' : 'password'}
                                        placeholder="Confirm new password"
                                        leftIcon={<Lock className="h-5 w-5" />}
                                    />
                                    <Button type="submit" isLoading={isChangingPassword}>
                                        Change Password
                                    </Button>
                                </form>
                            </FormProvider>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export const Dashboard: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-4xl font-bold gradient-text mb-2">12</p>
                            <p className="text-sm text-gray-600">Total Projects</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-green-600 mb-2">8</p>
                            <p className="text-sm text-gray-600">Active Tasks</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-purple-600 mb-2">24</p>
                            <p className="text-sm text-gray-600">Completed</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Welcome Card */}
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Getting Started</CardTitle>
                        <CardDescription>
                            Here are some things you can do to get started
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                                    <span className="text-sm font-medium text-primary-600">1</span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Complete your profile</h4>
                                    <p className="text-sm text-gray-600">
                                        Add your details and customize your account settings.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
                                <div className="h-8 w-8 rounded-full bg-secondary-100 flex items-center justify-center shrink-0">
                                    <span className="text-sm font-medium text-secondary-600">2</span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Create your first project</h4>
                                    <p className="text-sm text-gray-600">
                                        Start building something amazing with your team.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                    <span className="text-sm font-medium text-green-600">3</span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Invite team members</h4>
                                    <p className="text-sm text-gray-600">
                                        Collaborate with others to achieve more together.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

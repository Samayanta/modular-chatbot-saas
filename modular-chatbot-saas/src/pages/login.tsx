import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAppStore } from '@/state/store';
import { apiService } from '@/services/api';

// Interface for login form data
interface LoginFormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

// Interface for API login response
interface LoginResponse {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: 'admin' | 'agent';
    };
}

export default function LoginPage() {
    const router = useRouter();
    const { addNotification } = useAppStore();
    const [isLoading, setIsLoading] = useState(false);

    // Initialize React Hook Form with validation rules
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<LoginFormData>({
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });

    /**
     * Handle form submission
     * Sends login request to backend and stores JWT token
     */
    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);

        try {
            // Call login API endpoint
            const response = await apiService.post<LoginResponse>('/api/auth/login', {
                email: data.email,
                password: data.password,
            });

            // Store JWT token in localStorage
            localStorage.setItem('auth_token', response.token);

            // Store user info if needed
            if (data.rememberMe) {
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            // Show success notification
            addNotification('Login successful! Redirecting...', 'success');

            // Redirect to dashboard after short delay
            setTimeout(() => {
                router.push('/');
            }, 500);
        } catch (error: any) {
            // Handle different error scenarios
            if (error.response?.status === 401) {
                setError('password', {
                    type: 'manual',
                    message: 'Invalid email or password',
                });
                addNotification('Invalid credentials. Please try again.', 'error');
            } else if (error.response?.status === 404) {
                setError('email', {
                    type: 'manual',
                    message: 'User not found',
                });
                addNotification('User not found. Please check your email.', 'error');
            } else if (error.response?.status === 429) {
                addNotification('Too many login attempts. Please try again later.', 'error');
            } else {
                addNotification('Login failed. Please try again.', 'error');
                console.error('Login error:', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle demo login (for development/testing)
     */
    const handleDemoLogin = async () => {
        setIsLoading(true);
        try {
            // Demo credentials
            const demoData = {
                email: 'demo@chatbot.com',
                password: 'demo123',
            };

            const response = await apiService.post<LoginResponse>('/api/auth/login', demoData);
            localStorage.setItem('auth_token', response.token);
            addNotification('Demo login successful!', 'success');

            setTimeout(() => {
                router.push('/');
            }, 500);
        } catch (error) {
            addNotification('Demo login not available', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Title Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
                        <span className="text-3xl">🤖</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Chatbot SaaS
                    </h1>
                    <p className="text-gray-600">
                        Multi-language chatbot platform for businesses
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        Sign in to your account
                    </h2>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="label">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                className={`input ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                                placeholder="you@example.com"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                })}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="label">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                className={`input ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                                placeholder="••••••••"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters',
                                    },
                                })}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Remember Me and Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="rememberMe"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    {...register('rememberMe')}
                                />
                                <label
                                    htmlFor="rememberMe"
                                    className="ml-2 block text-sm text-gray-700"
                                >
                                    Remember me
                                </label>
                            </div>

                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-primary-600 hover:text-primary-500"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full btn-primary py-3 text-base font-semibold ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">Or</span>
                        </div>
                    </div>

                    {/* Demo Login Button */}
                    <button
                        onClick={handleDemoLogin}
                        disabled={isLoading}
                        className="mt-6 w-full btn-secondary py-3 text-base font-semibold"
                    >
                        Try Demo Account
                    </button>

                    {/* Sign Up Link */}
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link
                            href="/signup"
                            className="font-medium text-primary-600 hover:text-primary-500"
                        >
                            Sign up for free
                        </Link>
                    </p>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Multi-language support: Nepali, English, and mixed
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                        <Link href="/privacy" className="hover:text-gray-600">
                            Privacy Policy
                        </Link>
                        <span>•</span>
                        <Link href="/terms" className="hover:text-gray-600">
                            Terms of Service
                        </Link>
                        <span>•</span>
                        <Link href="/support" className="hover:text-gray-600">
                            Support
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAppStore } from '@/state/store';
import { authService } from '@/services/auth';

// Interface for signup form data
interface SignupFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
}

export default function SignupPage() {
    const router = useRouter();
    const { addNotification } = useAppStore();
    const [isLoading, setIsLoading] = useState(false);

    // Initialize React Hook Form
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setError,
    } = useForm<SignupFormData>({
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            agreeToTerms: false,
        },
    });

    // Watch password field for validation
    const password = watch('password');

    /**
     * Handle signup form submission
     */
    const onSubmit = async (data: SignupFormData) => {
        setIsLoading(true);

        try {
            // Call signup API endpoint
            const response = await authService.signup({
                name: data.name,
                email: data.email,
                password: data.password,
            });

            // Store JWT token and user info
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            // Show success notification
            addNotification('Account created successfully! Welcome aboard!', 'success');

            // Redirect to dashboard
            setTimeout(() => {
                router.push('/');
            }, 500);
        } catch (error: any) {
            // Handle different error scenarios
            if (error.response?.status === 409) {
                setError('email', {
                    type: 'manual',
                    message: 'Email already exists',
                });
                addNotification('This email is already registered', 'error');
            } else if (error.response?.data?.message) {
                addNotification(error.response.data.message, 'error');
            } else {
                addNotification('Signup failed. Please try again.', 'error');
                console.error('Signup error:', error);
            }
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
                        Create Your Account
                    </h1>
                    <p className="text-gray-600">
                        Start managing your chatbots today
                    </p>
                </div>

                {/* Signup Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        Sign up for free
                    </h2>

                    {/* Signup Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="label">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                autoComplete="name"
                                className={`input ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                                placeholder="John Doe"
                                {...register('name', {
                                    required: 'Name is required',
                                    minLength: {
                                        value: 2,
                                        message: 'Name must be at least 2 characters',
                                    },
                                })}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

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
                                autoComplete="new-password"
                                className={`input ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                                placeholder="••••••••"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters',
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                        message: 'Password must contain uppercase, lowercase, and number',
                                    },
                                })}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="label">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                className={`input ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                                placeholder="••••••••"
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: (value) =>
                                        value === password || 'Passwords do not match',
                                })}
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        {/* Terms and Conditions Checkbox */}
                        <div>
                            <div className="flex items-start">
                                <input
                                    id="agreeToTerms"
                                    type="checkbox"
                                    className={`h-4 w-4 mt-1 text-primary-600 focus:ring-primary-500 border-gray-300 rounded ${errors.agreeToTerms ? 'border-red-500' : ''
                                        }`}
                                    {...register('agreeToTerms', {
                                        required: 'You must agree to the terms and conditions',
                                    })}
                                />
                                <label
                                    htmlFor="agreeToTerms"
                                    className="ml-2 block text-sm text-gray-700"
                                >
                                    I agree to the{' '}
                                    <Link
                                        href="/terms"
                                        className="text-primary-600 hover:text-primary-500"
                                    >
                                        Terms and Conditions
                                    </Link>{' '}
                                    and{' '}
                                    <Link
                                        href="/privacy"
                                        className="text-primary-600 hover:text-primary-500"
                                    >
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                            {errors.agreeToTerms && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.agreeToTerms.message}
                                </p>
                            )}
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
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Already have account */}
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="font-medium text-primary-600 hover:text-primary-500"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        By signing up, you'll get access to all chatbot management features
                    </p>
                </div>
            </div>
        </div>
    );
}

import React, { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { authService } from '@/services/auth';

interface ProtectedRouteProps {
    children: ReactNode;
}

/**
 * Protected Route Component
 * Wraps pages that require authentication
 * Redirects to login if user is not authenticated
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();

    useEffect(() => {
        // Check authentication on mount and route changes
        const checkAuth = () => {
            const isAuthenticated = authService.isAuthenticated();

            if (!isAuthenticated) {
                // Store the intended destination
                const returnUrl = router.asPath;
                router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
            }
        };

        checkAuth();
    }, [router]);

    // Show loading state while checking auth
    if (!authService.isAuthenticated()) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

/**
 * HOC to wrap pages with authentication
 * Usage: export default withAuth(MyPage);
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
    return function AuthenticatedComponent(props: P) {
        return (
            <ProtectedRoute>
                <Component {...props} />
            </ProtectedRoute>
        );
    };
}

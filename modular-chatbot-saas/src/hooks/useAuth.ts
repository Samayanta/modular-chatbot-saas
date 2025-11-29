import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { authService, AuthUser } from '@/services/auth';
import { useAppStore } from '@/state/store';

interface UseAuthReturn {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refetch: () => Promise<void>;
}

/**
 * Custom hook for authentication
 * Provides auth state and methods throughout the app
 */
export const useAuth = (): UseAuthReturn => {
    const router = useRouter();
    const { addNotification } = useAppStore();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is authenticated and fetch user data
    useEffect(() => {
        const initAuth = async () => {
            if (!authService.isAuthenticated()) {
                setIsLoading(false);
                return;
            }

            try {
                // Try to get user from localStorage first
                const storedUser = authService.getStoredUser();
                if (storedUser) {
                    setUser(storedUser);
                }

                // Fetch fresh user data from API
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
                localStorage.setItem('user', JSON.stringify(currentUser));
            } catch (error) {
                console.error('Failed to fetch user:', error);
                // Token might be expired, clear auth data
                await authService.logout();
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    /**
     * Login user
     */
    const login = async (email: string, password: string) => {
        try {
            const response = await authService.login({ email, password });
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            setUser(response.user);
            addNotification('Login successful!', 'success');
        } catch (error) {
            addNotification('Login failed. Please check your credentials.', 'error');
            throw error;
        }
    };

    /**
     * Logout user
     */
    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            addNotification('Logged out successfully', 'success');
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            addNotification('Logout failed', 'error');
        }
    };

    /**
     * Refetch user data
     */
    const refetch = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
        } catch (error) {
            console.error('Failed to refetch user:', error);
        }
    };

    return {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refetch,
    };
};

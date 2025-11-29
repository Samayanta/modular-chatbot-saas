import { authApi } from './api';

// Authentication related interfaces
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupData {
    name: string;
    email: string;
    password: string;
    company?: string;
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    company?: string;
    role: 'admin' | 'user';
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}

/**
 * Authentication Service
 * Handles all authentication-related API calls and local storage
 */
export const authService = {
    /**
     * Login with email and password
     */
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await authApi.login(credentials.email, credentials.password);

        // Store token and user in localStorage
        if (response.token) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }

        return response;
    },

    /**
     * Sign up new user
     */
    signup: async (data: SignupData): Promise<AuthResponse> => {
        const response = await authApi.signup(data);

        // Store token and user in localStorage
        if (response.token) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }

        return response;
    },

    /**
     * Logout current user
     */
    logout: async (): Promise<void> => {
        try {
            await authApi.logout();
        } finally {
            // Clear local storage regardless of API call success
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
    },

    /**
     * Get current user info from API
     */
    getCurrentUser: async (): Promise<AuthUser> => {
        const response = await authApi.getCurrentUser();

        // Update local storage
        localStorage.setItem('user', JSON.stringify(response));

        return response;
    },

    /**
     * Refresh JWT token
     */
    refreshToken: async (): Promise<string> => {
        const response = await authApi.refreshToken();

        // Update token in localStorage
        if (response.token) {
            localStorage.setItem('auth_token', response.token);
        }

        return response.token;
    },

    /**
     * Request password reset (Future feature)
     */
    forgotPassword: async (email: string): Promise<void> => {
        // TODO: Implement forgot password API
        console.log('Forgot password for:', email);
    },

    /**
     * Reset password with token (Future feature)
     */
    resetPassword: async (token: string, newPassword: string): Promise<void> => {
        // TODO: Implement reset password API
        console.log('Reset password with token:', token);
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: (): boolean => {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem('auth_token');
    },

    /**
     * Get stored auth token
     */
    getToken: (): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('auth_token');
    },

    /**
     * Get stored user info
     */
    getStoredUser: (): AuthUser | null => {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    },
};

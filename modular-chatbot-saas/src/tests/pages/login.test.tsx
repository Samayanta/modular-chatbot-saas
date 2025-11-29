import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

// Mock dependencies - must be before component import
const mockAddNotification = jest.fn();

jest.mock('@/state/store', () => ({
    useAppStore: () => ({
        addNotification: mockAddNotification,
        agents: [],
        selectedAgent: null,
        setAgents: jest.fn(),
        setSelectedAgent: jest.fn(),
        dashboardStats: null,
        setDashboardStats: jest.fn(),
        sidebarOpen: true,
        toggleSidebar: jest.fn(),
        notifications: [],
        removeNotification: jest.fn(),
    }),
}));

jest.mock('@/services/api', () => ({
    apiService: {
        login: jest.fn(),
        signup: jest.fn(),
        getAgents: jest.fn(),
    },
}));

jest.mock('@/services/auth');

// Import component after mocks
import LoginPage from '@/pages/login';
import { mockAuthService } from '../mocks/api';

describe('LoginPage', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
            pathname: '/login',
        });
        jest.clearAllMocks();
    });

    /**
     * Test: Page renders correctly
     */
    it('renders login form with all elements', () => {
        render(<LoginPage />);

        expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /demo login/i })).toBeInTheDocument();
    });

    /**
     * Test: Email validation
     */
    it('validates email field correctly', async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        const emailInput = screen.getByLabelText(/email address/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        // Empty email
        await user.click(submitButton);
        expect(await screen.findByText(/email is required/i)).toBeInTheDocument();

        // Invalid email format
        await user.type(emailInput, 'invalid-email');
        await user.click(submitButton);
        expect(await screen.findByText(/invalid email address/i)).toBeInTheDocument();

        // Valid email
        await user.clear(emailInput);
        await user.type(emailInput, 'test@example.com');
        await user.click(submitButton);
        expect(screen.queryByText(/invalid email address/i)).not.toBeInTheDocument();
    });

    /**
     * Test: Password validation
     */
    it('validates password field correctly', async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        // Empty password
        await user.click(submitButton);
        expect(await screen.findByText(/password is required/i)).toBeInTheDocument();

        // Short password
        await user.type(passwordInput, '123');
        await user.click(submitButton);
        expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();

        // Valid password
        await user.clear(passwordInput);
        await user.type(passwordInput, 'password123');
        await user.click(submitButton);
        expect(screen.queryByText(/password must be at least 6 characters/i)).not.toBeInTheDocument();
    });

    /**
     * Test: Successful login
     */
    it('handles successful login and redirects', async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        // Fill form
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        await user.click(submitButton);

        // Verify API called
        await waitFor(() => {
            expect(mockAuthService.login).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
        });

        // Verify redirect
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/');
        });
    });

    /**
     * Test: Failed login
     */
    it('displays error message on failed login', async () => {
        const user = userEvent.setup();
        mockAuthService.login.mockRejectedValueOnce(new Error('Invalid credentials'));

        render(<LoginPage />);

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        await user.type(emailInput, 'wrong@example.com');
        await user.type(passwordInput, 'wrongpassword');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
        });

        expect(mockPush).not.toHaveBeenCalled();
    });

    /**
     * Test: Demo login
     */
    it('handles demo login correctly', async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        const demoButton = screen.getByRole('button', { name: /demo login/i });
        await user.click(demoButton);

        await waitFor(() => {
            expect(mockAuthService.login).toHaveBeenCalledWith({
                email: 'demo@example.com',
                password: 'demo123',
            });
        });

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/');
        });
    });

    /**
     * Test: Remember me checkbox
     */
    it('toggles remember me checkbox', async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        const rememberCheckbox = screen.getByRole('checkbox', { name: /remember me/i });

        expect(rememberCheckbox).not.toBeChecked();
        await user.click(rememberCheckbox);
        expect(rememberCheckbox).toBeChecked();
        await user.click(rememberCheckbox);
        expect(rememberCheckbox).not.toBeChecked();
    });

    /**
     * Test: Password visibility toggle
     */
    it('toggles password visibility', async () => {
        const user = userEvent.setup();
        render(<LoginPage />);

        const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
        const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

        expect(passwordInput.type).toBe('password');
        await user.click(toggleButton);
        expect(passwordInput.type).toBe('text');
        await user.click(toggleButton);
        expect(passwordInput.type).toBe('password');
    });

    /**
     * Test: Loading state during login
     */
    it('shows loading state during login', async () => {
        const user = userEvent.setup();
        mockAuthService.login.mockImplementationOnce(
            () => new Promise(resolve => setTimeout(resolve, 100))
        );

        render(<LoginPage />);

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');
        await user.click(submitButton);

        expect(screen.getByText(/signing in/i)).toBeInTheDocument();
        expect(submitButton).toBeDisabled();

        await waitFor(() => {
            expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument();
        });
    });

    /**
     * Test: Signup link navigation
     */
    it('contains link to signup page', () => {
        render(<LoginPage />);

        const signupLink = screen.getByRole('link', { name: /sign up/i });
        expect(signupLink).toHaveAttribute('href', '/signup');
    });

    /**
     * Test: Forgot password link
     */
    it('contains forgot password link', () => {
        render(<LoginPage />);

        const forgotLink = screen.getByText(/forgot password/i);
        expect(forgotLink).toBeInTheDocument();
    });
});

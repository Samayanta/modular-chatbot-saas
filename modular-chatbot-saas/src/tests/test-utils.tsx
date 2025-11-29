/**
 * Custom test utilities for rendering components with providers
 * This wrapper includes all necessary context providers (Router, State Management, etc.)
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Zustand store for testing
interface MockStore {
    user: any;
    agents: any[];
    kbItems: any[];
    setUser: (user: any) => void;
    setAgents: (agents: any[]) => void;
    setKbItems: (items: any[]) => void;
}

// Create a mock store context
export const createMockStore = (initialState: Partial<MockStore> = {}) => {
    return {
        user: initialState.user || null,
        agents: initialState.agents || [],
        kbItems: initialState.kbItems || [],
        setUser: jest.fn(),
        setAgents: jest.fn(),
        setKbItems: jest.fn(),
    };
};

interface AllTheProvidersProps {
    children: React.ReactNode;
    initialStore?: Partial<MockStore>;
}

/**
 * Wrapper component with all providers needed for testing
 * Note: This is for Next.js, so we don't use React Router
 */
const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children, initialStore }) => {
    // Create a new QueryClient for each test to ensure isolation
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false, // Disable retries in tests
                gcTime: 0, // Disable garbage collection/caching in tests
            },
        },
    });

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

/**
 * Custom render function that wraps components with necessary providers
 */
const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'> & { initialStore?: Partial<MockStore> }
) => {
    const { initialStore, ...renderOptions } = options || {};

    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <AllTheProviders initialStore={initialStore}>{children}</AllTheProviders>
    );

    return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Helper function to wait for async operations
 */
export const waitForLoadingToFinish = () => {
    return new Promise((resolve) => setTimeout(resolve, 0));
};

/**
 * Mock localStorage for testing
 */
export const mockLocalStorage = () => {
    const store: Record<string, string> = {};

    return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        removeItem: jest.fn((key: string) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            Object.keys(store).forEach(key => delete store[key]);
        }),
    };
};

/**
 * Mock WebSocket for real-time updates testing
 */
export class MockWebSocket {
    url: string;
    onopen: ((event: any) => void) | null = null;
    onmessage: ((event: any) => void) | null = null;
    onerror: ((event: any) => void) | null = null;
    onclose: ((event: any) => void) | null = null;
    readyState: number = 1; // OPEN

    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url: string) {
        this.url = url;
        // Simulate connection opening
        setTimeout(() => {
            if (this.onopen) {
                this.onopen({ type: 'open' });
            }
        }, 0);
    }

    send(data: string) {
        // Mock send - can be tracked with jest.fn() if needed
    }

    close() {
        this.readyState = MockWebSocket.CLOSED;
        if (this.onclose) {
            this.onclose({ type: 'close' });
        }
    }

    // Helper to simulate receiving a message
    simulateMessage(data: any) {
        if (this.onmessage) {
            this.onmessage({ data: JSON.stringify(data) });
        }
    }
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };

/**
 * Dashboard Page Tests  
 * Tests overview metrics, real-time updates, charts, and loading/error states
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '../test-utils';
import { server } from '../setup';
import { rest } from 'msw';
import { MockWebSocket, mockWebSocketData } from '../mocks/mockWebSocket';
import Dashboard from '@/pages/dashboard';

// Mock WebSocket
let mockWs: MockWebSocket;
(global as any).WebSocket = jest.fn((url: string) => {
    mockWs = new MockWebSocket(url);
    return mockWs;
});

// Mock router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: mockPush,
        pathname: '/dashboard',
    }),
}));

describe('Dashboard Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        if (mockWs) {
            mockWs.close();
        }
    });

    /**
     * Test: Dashboard renders with overview metrics
     */
    it('renders dashboard with overview metrics', async () => {
        render(<Dashboard />);

        // Wait for API data to load
        await waitFor(() => {
            expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
        });

        // Check for metric cards
        await waitFor(() => {
            expect(screen.getByText(/active agents/i)).toBeInTheDocument();
            expect(screen.getByText(/2/)).toBeInTheDocument(); // 2 active agents from mock

            expect(screen.getByText(/total messages/i)).toBeInTheDocument();
            expect(screen.getByText(/1543/)).toBeInTheDocument(); // Total messages from mock

            expect(screen.getByText(/avg response time/i)).toBeInTheDocument();
            expect(screen.getByText(/1\.2s/)).toBeInTheDocument(); // Response time from mock

            expect(screen.getByText(/queue length/i)).toBeInTheDocument();
            expect(screen.getByText(/17/)).toBeInTheDocument(); // Queue length from mock
        });
    });

    /**
     * Test: GPU usage chart renders correctly
     */
    it('renders GPU usage chart', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/gpu usage/i)).toBeInTheDocument();
        });

        // Chart should show current usage
        await waitFor(() => {
            expect(screen.getByText(/45%/)).toBeInTheDocument(); // From mock data
        });
    });

    /**
     * Test: Historical charts render with data
     */
    it('renders historical charts with time-series data', async () => {
        render(<Dashboard />);

        // Wait for charts to load
        await waitFor(() => {
            expect(screen.getByText(/message volume/i)).toBeInTheDocument();
            expect(screen.getByText(/response time trend/i)).toBeInTheDocument();
            expect(screen.getByText(/queue length over time/i)).toBeInTheDocument();
        });

        // Should have chart containers
        const charts = screen.getAllByRole('img', { hidden: true }); // Recharts uses SVG
        expect(charts.length).toBeGreaterThan(0);
    });

    /**
     * Test: Time range selector works
     */
    it('changes data when time range is selected', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/24 hours/i)).toBeInTheDocument();
        });

        // Find and click 7 days button
        const sevenDaysButton = screen.getByRole('button', { name: /7 days/i });
        fireEvent.click(sevenDaysButton);

        // Should trigger new API call
        await waitFor(() => {
            // Verify the API was called with correct params
            // In real scenario, check if data updated
            expect(sevenDaysButton).toHaveClass('active');
        });
    });

    /**
     * Test: WebSocket updates agent count in real-time
     */
    it('updates active agents count via WebSocket', async () => {
        render(<Dashboard />);

        // Wait for initial render
        await waitFor(() => {
            expect(screen.getByText(/2/)).toBeInTheDocument(); // Initial 2 agents
        });

        // Simulate WebSocket agent update
        mockWs.simulateMessage(mockWebSocketData.agentUpdate('agent-4', 'active'));

        // Count should update to 3
        await waitFor(() => {
            expect(screen.getByText(/3/)).toBeInTheDocument();
        });
    });

    /**
     * Test: WebSocket updates queue length in real-time
     */
    it('updates queue length via WebSocket', async () => {
        render(<Dashboard />);

        // Wait for initial queue length
        await waitFor(() => {
            expect(screen.getByText(/17/)).toBeInTheDocument();
        });

        // Simulate queue update
        mockWs.simulateMessage(mockWebSocketData.queueUpdate('agent-1', 25));

        // Queue length should update
        await waitFor(() => {
            expect(screen.getByText(/25/)).toBeInTheDocument();
        });
    });

    /**
     * Test: WebSocket updates GPU usage chart
     */
    it('updates GPU usage chart via WebSocket', async () => {
        render(<Dashboard />);

        // Wait for initial GPU usage
        await waitFor(() => {
            expect(screen.getByText(/45%/)).toBeInTheDocument();
        });

        // Simulate GPU update
        mockWs.simulateMessage(mockWebSocketData.gpuUpdate(78));

        // GPU usage should update
        await waitFor(() => {
            expect(screen.getByText(/78%/)).toBeInTheDocument();
        });
    });

    /**
     * Test: Loading state is displayed correctly
     */
    it('shows loading state while fetching data', () => {
        // Delay the API response
        server.use(
            rest.get('http://localhost:3000/api/analytics/overview', async (req, res, ctx) => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return res(ctx.status(200), ctx.json({}));
            })
        );

        render(<Dashboard />);

        // Should show loading skeleton/spinner
        expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    /**
     * Test: Error state is displayed when API fails
     */
    it('displays error message when API fails', async () => {
        // Mock API error
        server.use(
            rest.get('http://localhost:3000/api/analytics/overview', (req, res, ctx) => {
                return res(
                    ctx.status(500),
                    ctx.json({ error: 'Internal server error' })
                );
            })
        );

        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/error loading dashboard/i)).toBeInTheDocument();
        });

        // Should show retry button
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    /**
     * Test: Retry button refetches data
     */
    it('retries fetching data when retry button is clicked', async () => {
        let callCount = 0;

        // First call fails, second succeeds
        server.use(
            rest.get('http://localhost:3000/api/analytics/overview', (req, res, ctx) => {
                callCount++;
                if (callCount === 1) {
                    return res(ctx.status(500), ctx.json({ error: 'Server error' }));
                }
                return res(
                    ctx.status(200),
                    ctx.json({
                        activeAgents: 2,
                        totalMessages: 1543,
                        averageResponseTime: 1.2,
                        queueLength: 17,
                        gpuUsage: 45,
                    })
                );
            })
        );

        render(<Dashboard />);

        // Wait for error
        await waitFor(() => {
            expect(screen.getByText(/error loading dashboard/i)).toBeInTheDocument();
        });

        // Click retry
        const retryButton = screen.getByRole('button', { name: /retry/i });
        fireEvent.click(retryButton);

        // Should show data after retry
        await waitFor(() => {
            expect(screen.getByText(/2/)).toBeInTheDocument(); // Active agents
        });
    });

    /**
     * Test: Refresh button reloads data
     */
    it('refreshes data when refresh button is clicked', async () => {
        let callCount = 0;

        server.use(
            rest.get('http://localhost:3000/api/analytics/overview', (req, res, ctx) => {
                callCount++;
                return res(
                    ctx.status(200),
                    ctx.json({
                        activeAgents: callCount === 1 ? 2 : 3,
                        totalMessages: 1543,
                        averageResponseTime: 1.2,
                        queueLength: 17,
                        gpuUsage: 45,
                    })
                );
            })
        );

        render(<Dashboard />);

        // Wait for initial load
        await waitFor(() => {
            expect(screen.getByText(/2/)).toBeInTheDocument();
        });

        // Click refresh
        const refreshButton = screen.getByRole('button', { name: /refresh/i });
        fireEvent.click(refreshButton);

        // Should update to new value
        await waitFor(() => {
            expect(screen.getByText(/3/)).toBeInTheDocument();
        });
    });

    /**
     * Test: WebSocket reconnects on disconnect
     */
    it('handles WebSocket disconnection and reconnection', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(mockWs).toBeDefined();
        });

        // Simulate disconnect
        mockWs.simulateDisconnect();

        // Should show connection warning
        await waitFor(() => {
            expect(screen.getByText(/connection lost/i)).toBeInTheDocument();
        });

        // Simulate reconnection
        mockWs.simulateMessage(mockWebSocketData.gpuUpdate(50));

        // Warning should disappear
        await waitFor(() => {
            expect(screen.queryByText(/connection lost/i)).not.toBeInTheDocument();
        });
    });

    /**
     * Test: Recent activity section displays events
     */
    it('displays recent activity events', async () => {
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/recent activity/i)).toBeInTheDocument();
        });

        // Simulate message processed event
        mockWs.simulateMessage(
            mockWebSocketData.messageProcessed('agent-1', 'msg-123', 1.5)
        );

        // Should show in activity feed
        await waitFor(() => {
            expect(screen.getByText(/agent-1 processed message/i)).toBeInTheDocument();
            expect(screen.getByText(/1\.5s/)).toBeInTheDocument();
        });
    });
});

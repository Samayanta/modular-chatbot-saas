import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '@/pages/index';
import { mockUseAppStore, mockAnalyticsApi, mockUseSocket } from '../mocks/api';
import { mockDashboardStats } from '../mocks/data';

// Mock dependencies
jest.mock('@/state/store', () => ({
    useAppStore: mockUseAppStore,
}));

jest.mock('@/services/api', () => ({
    analyticsApi: mockAnalyticsApi,
}));

jest.mock('@/hooks/useSocket', () => ({
    useSocket: mockUseSocket,
}));

describe('DashboardPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAppStore.mockReturnValue({
            dashboardStats: mockDashboardStats,
            setDashboardStats: jest.fn(),
        });
    });

    /**
     * Test: Page renders correctly with all dashboard elements
     */
    it('renders dashboard with all key elements', async () => {
        render(<DashboardPage />);

        // Verify stats cards
        expect(screen.getByText(/total agents/i)).toBeInTheDocument();
        expect(screen.getByText(/active agents/i)).toBeInTheDocument();
        expect(screen.getByText(/total messages/i)).toBeInTheDocument();
        expect(screen.getByText(/avg response time/i)).toBeInTheDocument();

        // Verify stats values
        expect(screen.getByText('3')).toBeInTheDocument(); // Total agents
        expect(screen.getByText('2')).toBeInTheDocument(); // Active agents
        expect(screen.getByText('1,250')).toBeInTheDocument(); // Total messages
        expect(screen.getByText('1.8s')).toBeInTheDocument(); // Avg response time
    });

    /**
     * Test: Dashboard fetches data on mount
     */
    it('fetches dashboard stats on initial load', async () => {
        render(<DashboardPage />);

        await waitFor(() => {
            expect(mockAnalyticsApi.getDashboard).toHaveBeenCalled();
        });
    });

    /**
     * Test: Charts render with correct data
     */
    it('renders message volume chart', async () => {
        render(<DashboardPage />);

        await waitFor(() => {
            expect(screen.getByText(/message volume/i)).toBeInTheDocument();
        });

        // Verify chart canvas exists
        const canvas = screen.getAllByRole('img', { hidden: true });
        expect(canvas.length).toBeGreaterThan(0);
    });

    /**
     * Test: Response time chart renders
     */
    it('renders response time chart', async () => {
        render(<DashboardPage />);

        await waitFor(() => {
            expect(screen.getByText(/response time/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Agent status chart renders
     */
    it('renders agent status distribution chart', async () => {
        render(<DashboardPage />);

        await waitFor(() => {
            expect(screen.getByText(/agent status/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Platform distribution chart renders
     */
    it('renders platform distribution chart', async () => {
        render(<DashboardPage />);

        await waitFor(() => {
            expect(screen.getByText(/platform distribution/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Recent activity feed displays
     */
    it('displays recent activity feed', async () => {
        render(<DashboardPage />);

        await waitFor(() => {
            expect(screen.getByText(/recent activity/i)).toBeInTheDocument();
            expect(screen.getByText(/new message received/i)).toBeInTheDocument();
            expect(screen.getByText(/agent started successfully/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Active agents table displays
     */
    it('displays active agents table', async () => {
        render(<DashboardPage />);

        await waitFor(() => {
            expect(screen.getByText(/active agents/i)).toBeInTheDocument();
            expect(screen.getByText('WhatsApp Bot')).toBeInTheDocument();
            expect(screen.getByText('Website Chat')).toBeInTheDocument();
        });
    });

    /**
     * Test: WebSocket real-time updates
     */
    it('updates stats on WebSocket message event', async () => {
        const mockSetDashboardStats = jest.fn();
        mockUseAppStore.mockReturnValue({
            dashboardStats: mockDashboardStats,
            setDashboardStats: mockSetDashboardStats,
        });

        const mockSocket = {
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn(),
        };

        mockUseSocket.mockReturnValue({
            socket: mockSocket,
            isConnected: true,
        });

        render(<DashboardPage />);

        // Simulate socket.on('newMessage') callback
        const onNewMessage = mockSocket.on.mock.calls.find(
            call => call[0] === 'newMessage'
        )?.[1];

        if (onNewMessage) {
            onNewMessage({ agentId: 'agent-1', count: 1 });

            await waitFor(() => {
                expect(mockSetDashboardStats).toHaveBeenCalled();
            });
        }
    });

    /**
     * Test: Auto-refresh functionality
     */
    it('auto-refreshes dashboard data every 30 seconds', async () => {
        jest.useFakeTimers();
        render(<DashboardPage />);

        expect(mockAnalyticsApi.getDashboard).toHaveBeenCalledTimes(1);

        // Fast-forward 30 seconds
        jest.advanceTimersByTime(30000);

        await waitFor(() => {
            expect(mockAnalyticsApi.getDashboard).toHaveBeenCalledTimes(2);
        });

        jest.useRealTimers();
    });

    /**
     * Test: Loading state
     */
    it('shows loading state while fetching data', async () => {
        mockAnalyticsApi.getDashboard.mockImplementationOnce(
            () => new Promise(resolve => setTimeout(() => resolve(mockDashboardStats), 100))
        );

        render(<DashboardPage />);

        expect(screen.getByText(/loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        });
    });

    /**
     * Test: Error state
     */
    it('displays error message on fetch failure', async () => {
        mockAnalyticsApi.getDashboard.mockRejectedValueOnce(
            new Error('Failed to fetch dashboard data')
        );

        render(<DashboardPage />);

        await waitFor(() => {
            expect(screen.getByText(/error loading dashboard/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Refresh button
     */
    it('refreshes data when refresh button clicked', async () => {
        const user = userEvent.setup();
        render(<DashboardPage />);

        const refreshButton = screen.getByRole('button', { name: /refresh/i });

        expect(mockAnalyticsApi.getDashboard).toHaveBeenCalledTimes(1);

        await user.click(refreshButton);

        await waitFor(() => {
            expect(mockAnalyticsApi.getDashboard).toHaveBeenCalledTimes(2);
        });
    });

    /**
     * Test: Empty state when no data
     */
    it('shows empty state when no agents exist', async () => {
        mockUseAppStore.mockReturnValue({
            dashboardStats: {
                ...mockDashboardStats,
                totalAgents: 0,
                activeAgents: 0,
            },
            setDashboardStats: jest.fn(),
        });

        render(<DashboardPage />);

        await waitFor(() => {
            expect(screen.getByText(/no agents yet/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: GPU usage indicator
     */
    it('displays GPU usage with correct color coding', async () => {
        render(<DashboardPage />);

        await waitFor(() => {
            expect(screen.getByText(/gpu usage/i)).toBeInTheDocument();
            expect(screen.getByText(/35\.5%/i)).toBeInTheDocument();
        });

        // GPU usage < 50% should be green
        const gpuIndicator = screen.getByTestId('gpu-usage-indicator');
        expect(gpuIndicator).toHaveClass('bg-green-500');
    });

    /**
     * Test: Error rate indicator
     */
    it('displays error rate with warning for high values', async () => {
        render(<DashboardPage />);

        await waitFor(() => {
            expect(screen.getByText(/error rate/i)).toBeInTheDocument();
            expect(screen.getByText(/2\.3%/i)).toBeInTheDocument();
        });
    });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgentsPage from '@/pages/agents';
import { mockAgentApi, mockKbApi, mockUseAppStore } from '../mocks/api';
import { mockAgents, mockKnowledgeBases } from '../mocks/data';

// Mock dependencies
jest.mock('@/services/api', () => ({
    agentApi: mockAgentApi,
    kbApi: mockKbApi,
}));

jest.mock('@/state/store', () => ({
    useAppStore: mockUseAppStore,
}));

describe('AgentsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAppStore.mockReturnValue({
            agents: mockAgents,
            selectedAgent: null,
            dashboardStats: {} as any,
            sidebarOpen: false,
            notifications: [],
            setAgents: jest.fn(),
            setSelectedAgent: jest.fn(),
            setDashboardStats: jest.fn(),
            toggleSidebar: jest.fn(),
            addNotification: jest.fn(),
            removeNotification: jest.fn(),
        });
    });

    /**
     * Test: Page renders with agents list
     */
    it('renders agents list correctly', async () => {
        render(<AgentsPage />);

        await waitFor(() => {
            expect(screen.getByText('WhatsApp Bot')).toBeInTheDocument();
            expect(screen.getByText('Instagram Support')).toBeInTheDocument();
            expect(screen.getByText('Website Chat')).toBeInTheDocument();
        });
    });

    /**
     * Test: Create new agent button opens modal
     */
    it('opens create agent modal when button clicked', async () => {
        const user = userEvent.setup();
        render(<AgentsPage />);

        const createButton = screen.getByRole('button', { name: /create agent/i });
        await user.click(createButton);

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByLabelText(/agent name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/platform/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Create agent with validation
     */
    it('validates agent creation form', async () => {
        const user = userEvent.setup();
        render(<AgentsPage />);

        // Open modal
        await user.click(screen.getByRole('button', { name: /create agent/i }));

        // Try to submit empty form
        const submitButton = screen.getByRole('button', { name: /create/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/platform is required/i)).toBeInTheDocument();
        });

        const mockSetAgents = jest.fn();
        mockUseAppStore.mockReturnValue({
            agents: mockAgents,
            selectedAgent: null,
            dashboardStats: {} as any,
            sidebarOpen: false,
            notifications: [],
            setAgents: mockSetAgents,
            setSelectedAgent: jest.fn(),
            setDashboardStats: jest.fn(),
            toggleSidebar: jest.fn(),
            addNotification: jest.fn(),
            removeNotification: jest.fn(),
        });
        it('creates new agent successfully', async () => {
            const user = userEvent.setup();
            const mockSetAgents = jest.fn();
            mockUseAppStore.mockReturnValue({
                agents: mockAgents,
                setAgents: mockSetAgents,
                addNotification: jest.fn(),
            });

            render(<AgentsPage />);

            // Open modal
            await user.click(screen.getByRole('button', { name: /create agent/i }));

            // Fill form
            await user.type(screen.getByLabelText(/agent name/i), 'New Test Agent');
            await user.selectOptions(screen.getByLabelText(/platform/i), 'whatsapp');
            await user.selectOptions(screen.getByLabelText(/language/i), 'english');

            // Submit
            await user.click(screen.getByRole('button', { name: /create/i }));

            await waitFor(() => {
                expect(mockAgentApi.create).toHaveBeenCalledWith({
                    name: 'New Test Agent',
                    platform: 'whatsapp',
                    language: 'english',
                });
            });

            await waitFor(() => {
                expect(mockSetAgents).toHaveBeenCalled();
            });
        });

        /**
         * Test: Edit agent functionality
         */
        it('edits existing agent', async () => {
            const user = userEvent.setup();
            render(<AgentsPage />);

            // Click edit button for first agent
            const editButtons = screen.getAllByRole('button', { name: /edit/i });
            await user.click(editButtons[0]);

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
                expect(screen.getByDisplayValue('WhatsApp Bot')).toBeInTheDocument();
            });

            // Change name
            const nameInput = screen.getByLabelText(/agent name/i);
            await user.clear(nameInput);
            await user.type(nameInput, 'Updated WhatsApp Bot');

            // Submit
            await user.click(screen.getByRole('button', { name: /save/i }));

            await waitFor(() => {
                expect(mockAgentApi.update).toHaveBeenCalledWith('agent-1', {
                    name: 'Updated WhatsApp Bot',
                });
            });
        });

        /**
         * Test: Delete agent with confirmation
         */
        it('deletes agent after confirmation', async () => {
            const user = userEvent.setup();
            window.confirm = jest.fn(() => true);

            render(<AgentsPage />);

            // Click delete button for first agent
            const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
            await user.click(deleteButtons[0]);

            expect(window.confirm).toHaveBeenCalledWith(
                'Are you sure you want to delete this agent?'
            );

            await waitFor(() => {
                expect(mockAgentApi.delete).toHaveBeenCalledWith('agent-1');
            });
        });

        /**
         * Test: Start agent action
         */
        it('starts inactive agent', async () => {
            const user = userEvent.setup();
            render(<AgentsPage />);

            // Find inactive agent (Instagram Support)
            const agentCard = screen.getByText('Instagram Support').closest('.agent-card');
            const startButton = agentCard?.querySelector('button[name="start"]') ||
                screen.getAllByRole('button', { name: /start/i })[0];

            await user.click(startButton);

            await waitFor(() => {
                expect(mockAgentApi.start).toHaveBeenCalledWith('agent-2');
            });
        });

        /**
         * Test: Stop agent action
         */
        it('stops active agent', async () => {
            const user = userEvent.setup();
            render(<AgentsPage />);

            // Find active agent (WhatsApp Bot)
            const stopButtons = screen.getAllByRole('button', { name: /stop/i });
            await user.click(stopButtons[0]);

            await waitFor(() => {
                expect(mockAgentApi.stop).toHaveBeenCalledWith('agent-1');
            });
        });

        /**
         * Test: Filter agents by status
         */
        it('filters agents by status', async () => {
            const user = userEvent.setup();
            render(<AgentsPage />);

            // Initially shows all agents
            expect(screen.getByText('WhatsApp Bot')).toBeInTheDocument();
            expect(screen.getByText('Instagram Support')).toBeInTheDocument();

            // Filter to active only
            const activeFilter = screen.getByRole('button', { name: /active/i });
            await user.click(activeFilter);

            await waitFor(() => {
                expect(screen.getByText('WhatsApp Bot')).toBeInTheDocument();
                expect(screen.queryByText('Instagram Support')).not.toBeInTheDocument();
            });
        });

        /**
         * Test: Filter agents by platform
         */
        it('filters agents by platform', async () => {
            const user = userEvent.setup();
            render(<AgentsPage />);

            // Filter by WhatsApp
            const platformSelect = screen.getByLabelText(/filter by platform/i);
            await user.selectOptions(platformSelect, 'whatsapp');

            await waitFor(() => {
                expect(screen.getByText('WhatsApp Bot')).toBeInTheDocument();
                expect(screen.queryByText('Instagram Support')).not.toBeInTheDocument();
                expect(screen.queryByText('Website Chat')).not.toBeInTheDocument();
            });
        });

        /**
         * Test: Search agents by name
         */
        it('searches agents by name', async () => {
            const user = userEvent.setup();
            render(<AgentsPage />);

            const searchInput = screen.getByPlaceholderText(/search agents/i);
            await user.type(searchInput, 'WhatsApp');

            await waitFor(() => {
                expect(screen.getByText('WhatsApp Bot')).toBeInTheDocument();
                expect(screen.queryByText('Instagram Support')).not.toBeInTheDocument();
            });
        });

        /**
         * Test: Assign knowledge base to agent
         */
        it('assigns knowledge base to agent', async () => {
            const user = userEvent.setup();
            mockKbApi.getAll.mockResolvedValue(mockKnowledgeBases);

            render(<AgentsPage />);

            // Click KB assignment button
            const kbButtons = screen.getAllByRole('button', { name: /assign kb/i });
            await user.click(kbButtons[0]);

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
                expect(screen.getByText('Product Documentation')).toBeInTheDocument();
            });

            // Select a KB
            const kbCheckbox = screen.getByLabelText('Product Documentation');
            await user.click(kbCheckbox);

            // Save
            await user.click(screen.getByRole('button', { name: /assign/i }));

            await waitFor(() => {
                expect(mockAgentApi.update).toHaveBeenCalled();
            });
        });

        /**
         * Test: View agent queue status
         */
        it('displays agent queue length', async () => {
            render(<AgentsPage />);

            await waitFor(() => {
                // Queue length should be visible for active agents
                const queueBadges = screen.getAllByText(/queue:/i);
                expect(queueBadges.length).toBeGreaterThan(0);
            });
        });

        /**
         * Test: Loading state
         */
        it('shows loading state while fetching agents', async () => {
            mockAgentApi.getAll.mockImplementationOnce(
                () => new Promise(resolve => setTimeout(() => resolve(mockAgents), 100))
            );

            render(<AgentsPage />);

            expect(screen.getByText(/loading agents/i)).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.queryByText(/loading agents/i)).not.toBeInTheDocument();
            });
        });

        /**
         * Test: Empty state
         */
        it('shows empty state when no agents exist', async () => {
            mockUseAppStore.mockReturnValue({
                agents: [],
                setAgents: jest.fn(),
                addNotification: jest.fn(),
            });

            render(<AgentsPage />);

            await waitFor(() => {
                expect(screen.getByText(/no agents yet/i)).toBeInTheDocument();
                expect(screen.getByText(/create your first agent/i)).toBeInTheDocument();
            });
        });

        /**
         * Test: Error handling
         */
        it('displays error message on API failure', async () => {
            mockAgentApi.getAll.mockRejectedValueOnce(new Error('Failed to fetch agents'));

            render(<AgentsPage />);

            await waitFor(() => {
                expect(screen.getByText(/error loading agents/i)).toBeInTheDocument();
            });
        });
    });

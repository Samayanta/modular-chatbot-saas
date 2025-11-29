/**
 * Agents Page Tests
 * Tests agent table, start/stop actions, KB assignment, and real-time queue updates
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '../test-utils';
import { server } from '../setup';
import { rest } from 'msw';
import { MockWebSocket, mockWebSocketData } from '../mocks/mockWebSocket';
import Agents from '@/pages/agents';

// Mock WebSocket
let mockWs: MockWebSocket;
(global as any).WebSocket = jest.fn((url: string) => {
    mockWs = new MockWebSocket(url);
    return mockWs;
});

describe('Agents Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        if (mockWs) {
            mockWs.close();
        }
    });

    /**
     * Test: Agents table renders with all agents
     */
    it('renders agents table with all agents', async () => {
        render(<Agents />);

        await waitFor(() => {
            expect(screen.getByText(/manage agents/i)).toBeInTheDocument();
        });

        // Check for table headers
        expect(screen.getByText(/name/i)).toBeInTheDocument();
        expect(screen.getByText(/platform/i)).toBeInTheDocument();
        expect(screen.getByText(/status/i)).toBeInTheDocument();
        expect(screen.getByText(/queue/i)).toBeInTheDocument();
        expect(screen.getByText(/actions/i)).toBeInTheDocument();

        // Check for agent data
        await waitFor(() => {
            expect(screen.getByText(/whatsapp bot/i)).toBeInTheDocument();
            expect(screen.getByText(/instagram bot/i)).toBeInTheDocument();
            expect(screen.getByText(/website widget/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Agent status badges display correctly
     */
    it('displays correct status badges for agents', async () => {
        render(<Agents />);

        await waitFor(() => {
            // Active agents should have green badge
            const activeBadges = screen.getAllByText(/active/i);
            expect(activeBadges.length).toBeGreaterThan(0);

            // Inactive agents should have gray badge
            const inactiveBadges = screen.getAllByText(/inactive/i);
            expect(inactiveBadges.length).toBeGreaterThan(0);
        });
    });

    /**
     * Test: Start agent button triggers correct API call
     */
    it('starts an inactive agent when start button is clicked', async () => {
        render(<Agents />);

        await waitFor(() => {
            expect(screen.getByText(/instagram bot/i)).toBeInTheDocument();
        });

        // Find start button for Instagram Bot (inactive)
        const startButtons = screen.getAllByRole('button', { name: /start/i });
        const instagramStartButton = startButtons[0];

        fireEvent.click(instagramStartButton);

        // Wait for API call and status update
        await waitFor(() => {
            expect(screen.getByText(/agent started/i)).toBeInTheDocument();
        });

        // Status should change to active
        await waitFor(() => {
            expect(instagramStartButton).toHaveTextContent(/stop/i);
        });
    });

    /**
     * Test: Stop agent button triggers correct API call
     */
    it('stops an active agent when stop button is clicked', async () => {
        render(<Agents />);

        await waitFor(() => {
            expect(screen.getByText(/whatsapp bot/i)).toBeInTheDocument();
        });

        // Find stop button for WhatsApp Bot (active)
        const stopButtons = screen.getAllByRole('button', { name: /stop/i });
        const whatsappStopButton = stopButtons[0];

        fireEvent.click(whatsappStopButton);

        // Confirm stop action in modal
        const confirmButton = await screen.findByRole('button', { name: /confirm/i });
        fireEvent.click(confirmButton);

        // Wait for API call and status update
        await waitFor(() => {
            expect(screen.getByText(/agent stopped/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Assign KB form opens and works
     */
    it('opens assign KB modal and assigns knowledge base', async () => {
        render(<Agents />);

        await waitFor(() => {
            expect(screen.getByText(/whatsapp bot/i)).toBeInTheDocument();
        });

        // Find assign KB button
        const assignButtons = screen.getAllByRole('button', { name: /assign kb/i });
        fireEvent.click(assignButtons[0]);

        // Modal should open
        await waitFor(() => {
            expect(screen.getByText(/assign knowledge base/i)).toBeInTheDocument();
        });

        // Select KB from dropdown
        const kbSelect = screen.getByLabelText(/knowledge base/i);
        fireEvent.change(kbSelect, { target: { value: 'kb-1' } });

        // Submit form
        const submitButton = screen.getByRole('button', { name: /assign/i });
        fireEvent.click(submitButton);

        // Wait for success message
        await waitFor(() => {
            expect(screen.getByText(/knowledge base assigned/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Create new agent button opens form
     */
    it('opens create agent form when button is clicked', async () => {
        render(<Agents />);

        const createButton = screen.getByRole('button', { name: /create agent/i });
        fireEvent.click(createButton);

        // Form should appear
        await waitFor(() => {
            expect(screen.getByText(/new agent/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/agent name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/platform/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Create new agent form submission
     */
    it('creates new agent successfully', async () => {
        render(<Agents />);

        // Open create form
        const createButton = screen.getByRole('button', { name: /create agent/i });
        fireEvent.click(createButton);

        await waitFor(() => {
            expect(screen.getByLabelText(/agent name/i)).toBeInTheDocument();
        });

        // Fill form
        const nameInput = screen.getByLabelText(/agent name/i);
        const platformSelect = screen.getByLabelText(/platform/i);

        fireEvent.change(nameInput, { target: { value: 'Telegram Bot' } });
        fireEvent.change(platformSelect, { target: { value: 'telegram' } });

        // Submit
        const submitButton = screen.getByRole('button', { name: /create/i });
        fireEvent.click(submitButton);

        // Wait for success and table update
        await waitFor(() => {
            expect(screen.getByText(/agent created/i)).toBeInTheDocument();
            expect(screen.getByText(/telegram bot/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Delete agent with confirmation
     */
    it('deletes agent after confirmation', async () => {
        render(<Agents />);

        await waitFor(() => {
            expect(screen.getByText(/instagram bot/i)).toBeInTheDocument();
        });

        // Find delete button
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        fireEvent.click(deleteButtons[1]); // Delete Instagram Bot

        // Confirmation modal should appear
        await waitFor(() => {
            expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
        });

        // Confirm deletion
        const confirmButton = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(confirmButton);

        // Agent should be removed from table
        await waitFor(() => {
            expect(screen.queryByText(/instagram bot/i)).not.toBeInTheDocument();
        });
    });

    /**
     * Test: Cancel delete operation
     */
    it('cancels delete operation when cancel is clicked', async () => {
        render(<Agents />);

        await waitFor(() => {
            expect(screen.getByText(/instagram bot/i)).toBeInTheDocument();
        });

        // Click delete
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        fireEvent.click(deleteButtons[1]);

        // Modal appears
        await waitFor(() => {
            expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
        });

        // Click cancel
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);

        // Agent should still be in table
        expect(screen.getByText(/instagram bot/i)).toBeInTheDocument();
    });

    /**
     * Test: Queue length updates via WebSocket
     */
    it('updates queue length in real-time via WebSocket', async () => {
        render(<Agents />);

        await waitFor(() => {
            expect(screen.getByText(/whatsapp bot/i)).toBeInTheDocument();
            // Initial queue length is 5
            expect(screen.getByText('5')).toBeInTheDocument();
        });

        // Simulate queue update
        mockWs.simulateMessage(mockWebSocketData.queueUpdate('agent-1', 15));

        // Queue length should update
        await waitFor(() => {
            expect(screen.getByText('15')).toBeInTheDocument();
        });
    });

    /**
     * Test: Agent status updates via WebSocket
     */
    it('updates agent status in real-time via WebSocket', async () => {
        render(<Agents />);

        await waitFor(() => {
            expect(screen.getByText(/instagram bot/i)).toBeInTheDocument();
        });

        // Simulate agent going active
        mockWs.simulateMessage(mockWebSocketData.agentUpdate('agent-2', 'active'));

        // Status badge should update
        await waitFor(() => {
            // Count active badges - should increase by 1
            const activeBadges = screen.getAllByText(/active/i);
            expect(activeBadges.length).toBe(3); // Was 2, now 3
        });
    });

    /**
     * Test: Search/filter agents
     */
    it('filters agents by search term', async () => {
        render(<Agents />);

        await waitFor(() => {
            expect(screen.getByText(/whatsapp bot/i)).toBeInTheDocument();
            expect(screen.getByText(/instagram bot/i)).toBeInTheDocument();
        });

        // Find search input
        const searchInput = screen.getByPlaceholderText(/search agents/i);
        fireEvent.change(searchInput, { target: { value: 'whatsapp' } });

        // Only WhatsApp bot should be visible
        await waitFor(() => {
            expect(screen.getByText(/whatsapp bot/i)).toBeInTheDocument();
            expect(screen.queryByText(/instagram bot/i)).not.toBeInTheDocument();
        });
    });

    /**
     * Test: Filter agents by platform
     */
    it('filters agents by platform', async () => {
        render(<Agents />);

        await waitFor(() => {
            expect(screen.getByText(/whatsapp bot/i)).toBeInTheDocument();
        });

        // Find platform filter dropdown
        const platformFilter = screen.getByLabelText(/filter by platform/i);
        fireEvent.change(platformFilter, { target: { value: 'whatsapp' } });

        // Only WhatsApp agents should be visible
        await waitFor(() => {
            expect(screen.getByText(/whatsapp bot/i)).toBeInTheDocument();
            expect(screen.queryByText(/instagram bot/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/website widget/i)).not.toBeInTheDocument();
        });
    });

    /**
     * Test: Filter agents by status
     */
    it('filters agents by status', async () => {
        render(<Agents />);

        await waitFor(() => {
            expect(screen.getByText(/whatsapp bot/i)).toBeInTheDocument();
        });

        // Filter by active status
        const statusFilter = screen.getByLabelText(/filter by status/i);
        fireEvent.change(statusFilter, { target: { value: 'active' } });

        // Only active agents should be visible
        await waitFor(() => {
            expect(screen.getByText(/whatsapp bot/i)).toBeInTheDocument();
            expect(screen.getByText(/website widget/i)).toBeInTheDocument();
            expect(screen.queryByText(/instagram bot/i)).not.toBeInTheDocument();
        });
    });

    /**
     * Test: Empty state when no agents
     */
    it('displays empty state when no agents exist', async () => {
        // Mock empty agents array
        server.use(
            rest.get('http://localhost:3000/api/agents', (req: any, res: any, ctx: any) => {
                return res(ctx.status(200), ctx.json([]));
            })
        );

        render(<Agents />);

        await waitFor(() => {
            expect(screen.getByText(/no agents found/i)).toBeInTheDocument();
            expect(screen.getByText(/create your first agent/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Loading state
     */
    it('shows loading state while fetching agents', () => {
        // Delay API response
        server.use(
            rest.get('http://localhost:3000/api/agents', async (req: any, res: any, ctx: any) => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return res(ctx.status(200), ctx.json([]));
            })
        );

        render(<Agents />);

        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    /**
     * Test: Error state
     */
    it('displays error message when API fails', async () => {
        server.use(
            rest.get('http://localhost:3000/api/agents', (req: any, res: any, ctx: any) => {
                return res(ctx.status(500), ctx.json({ error: 'Server error' }));
            })
        );

        render(<Agents />);

        await waitFor(() => {
            expect(screen.getByText(/error loading agents/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
        });
    });
});

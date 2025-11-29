/**
 * Web Widget Page Tests
 * Tests snippet generation, copy-to-clipboard, live preview, and message sending
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '../test-utils';
import { server } from '../setup';
import { rest } from 'msw';
import WebWidget from '@/pages/web-widget';

// Mock clipboard API
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
    },
});

describe('Web Widget Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Test: Widget page renders with agent selector
     */
    it('renders widget page with agent selector', async () => {
        render(<WebWidget />);

        expect(screen.getByText(/web widget/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/select agent/i)).toBeInTheDocument();
    });

    /**
     * Test: Agent selection loads widget configuration
     */
    it('loads widget configuration when agent is selected', async () => {
        render(<WebWidget />);

        const agentSelect = screen.getByLabelText(/select agent/i);
        fireEvent.change(agentSelect, { target: { value: 'agent-1' } });

        await waitFor(() => {
            expect(screen.getByText(/widget code/i)).toBeInTheDocument();
        });

        // Should display generated snippet
        expect(screen.getByTestId('widget-snippet')).toHaveTextContent(
            /script.*data-agent="agent-1"/i
        );
    });

    /**
     * Test: Widget snippet generation
     */
    it('generates correct widget JavaScript snippet', async () => {
        render(<WebWidget />);

        const agentSelect = screen.getByLabelText(/select agent/i);
        fireEvent.change(agentSelect, { target: { value: 'agent-1' } });

        await waitFor(() => {
            const snippet = screen.getByTestId('widget-snippet');
            expect(snippet).toHaveTextContent(
                /<script src="https:\/\/example\.com\/widget\.js" data-agent="agent-1"><\/script>/
            );
        });
    });

    /**
     * Test: Copy-to-clipboard functionality
     */
    it('copies widget snippet to clipboard', async () => {
        render(<WebWidget />);

        const agentSelect = screen.getByLabelText(/select agent/i);
        fireEvent.change(agentSelect, { target: { value: 'agent-1' } });

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
        });

        const copyButton = screen.getByRole('button', { name: /copy/i });
        fireEvent.click(copyButton);

        // Clipboard API should be called
        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
                expect.stringContaining('data-agent="agent-1"')
            );
        });

        // Success message should appear
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });

    /**
     * Test: Copy button shows feedback
     */
    it('shows visual feedback after copying', async () => {
        render(<WebWidget />);

        const agentSelect = screen.getByLabelText(/select agent/i);
        fireEvent.change(agentSelect, { target: { value: 'agent-1' } });

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
        });

        const copyButton = screen.getByRole('button', { name: /copy/i });
        fireEvent.click(copyButton);

        // Button text should change
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
        });

        // Should revert after timeout
        await waitFor(
            () => {
                expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
            },
            { timeout: 3000 }
        );
    });

    /**
     * Test: Live preview section renders
     */
    it('renders live preview section', async () => {
        render(<WebWidget />);

        const agentSelect = screen.getByLabelText(/select agent/i);
        fireEvent.change(agentSelect, { target: { value: 'agent-1' } });

        await waitFor(() => {
            expect(screen.getByText(/live preview/i)).toBeInTheDocument();
        });

        // Preview iframe or widget container should exist
        expect(screen.getByTestId('widget-preview')).toBeInTheDocument();
    });

    /**
     * Test: Widget preview displays greeting message
     */
    it('displays greeting message in preview', async () => {
        render(<WebWidget />);

        const agentSelect = screen.getByLabelText(/select agent/i);
        fireEvent.change(agentSelect, { target: { value: 'agent-1' } });

        await waitFor(() => {
            expect(screen.getByText(/नमस्ते.*how can i help you/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: User can send message in preview
     */
    it('allows sending message in live preview', async () => {
        render(<WebWidget />);

        const agentSelect = screen.getByLabelText(/select agent/i);
        fireEvent.change(agentSelect, { target: { value: 'agent-1' } });

        await waitFor(() => {
            expect(screen.getByTestId('widget-preview')).toBeInTheDocument();
        });

        // Find message input in preview
        const messageInput = screen.getByPlaceholderText(/type your message/i);
        const sendButton = screen.getByRole('button', { name: /send/i });

        // Type and send message
        fireEvent.change(messageInput, { target: { value: 'Hello, I need help' } });
        fireEvent.click(sendButton);

        // User message should appear
        await waitFor(() => {
            expect(screen.getByText(/hello, i need help/i)).toBeInTheDocument();
        });

        // Bot should respond
        await waitFor(
            () => {
                expect(
                    screen.getByText(/mock response to: hello, i need help/i)
                ).toBeInTheDocument();
            },
            { timeout: 3000 }
        );
    });

    /**
     * Test: Widget settings section
     */
    it('renders widget settings section', async () => {
        render(<WebWidget />);

        const agentSelect = screen.getByLabelText(/select agent/i);
        fireEvent.change(agentSelect, { target: { value: 'agent-1' } });

        await waitFor(() => {
            expect(screen.getByText(/widget settings/i)).toBeInTheDocument();
        });

        // Settings fields should be present
        expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/position/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/greeting message/i)).toBeInTheDocument();
    });

    /**
     * Test: Update widget theme
     */
    it('updates widget theme and reflects in preview', async () => {
        render(<WebWidget />);

        const agentSelect = screen.getByLabelText(/select agent/i);
        fireEvent.change(agentSelect, { target: { value: 'agent-1' } });

        await waitFor(() => {
            expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
        });

        // Change theme to dark
        const themeSelect = screen.getByLabelText(/theme/i);
        fireEvent.change(themeSelect, { target: { value: 'dark' } });

        // Preview should update
        const preview = screen.getByTestId('widget-preview');
        expect(preview).toHaveClass('theme-dark');
    });

    /**
     * Test: Update widget position
     */
    it('updates widget position setting', async () => {
        render(<WebWidget />);

        const agentSelect = screen.getByLabelText(/select agent/i);
        fireEvent.change(agentSelect, { target: { value: 'agent-1' } });

        await waitFor(() => {
            expect(screen.getByLabelText(/position/i)).toBeInTheDocument();
        });

        // Change position
        const positionSelect = screen.getByLabelText(/position/i);
        fireEvent.change(positionSelect, { target: { value: 'bottom-left' } });

        // Preview position should update
        const preview = screen.getByTestId('widget-preview');
        expect(preview).toHaveClass('position-bottom-left');
    });

    /**
     * Test: Update greeting message
     */
    it('updates greeting message in preview', async () => {
        render(<WebWidget />);

        const agentSelect = screen.getByLabelText(/select agent/i);
        fireEvent.change(agentSelect, { target: { value: 'agent-1' } });

        await waitFor(() => {
            expect(screen.getByLabelText(/greeting message/i)).toBeInTheDocument();
        });

        // Change greeting
        const greetingInput = screen.getByLabelText(/greeting message/i);
        fireEvent.change(greetingInput, {
            target: { value: 'Welcome! How can we assist you today?' },
        });

        // Preview should show new greeting
        await waitFor(() => {
            expect(
                screen.getByText(/welcome! how can we assist you today/i)
            ).toBeInTheDocument();
        });
    });

    /**
     * Test: Save widget settings
     */
    it('saves widget settings successfully', async () => {
        render(<WebWidget />);

        const agentSelect = screen.getByLabelText(/select agent/i);
        fireEvent.change(agentSelect, { target: { value: 'agent-1' } });

        await waitFor(() => {
            expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
        });

        // Modify settings
        const themeSelect = screen.getByLabelText(/theme/i);
        fireEvent.change(themeSelect, { target: { value: 'dark' } });

        // Click save
        const saveButton = screen.getByRole('button', { name: /save settings/i });
        fireEvent.click(saveButton);

        // Success message
        await waitFor(() => {
            expect(screen.getByText(/settings saved/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Widget preview displays loading state
     */
    it('shows loading state in preview while sending message', async () => {
        // Delay response
        server.use(
            rest.post(
                'http://localhost:3000/api/widget/:agentId/message',
                async (req: any, res: any, ctx: any) => {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    return res(ctx.status(200), ctx.json({ response: 'Test response' }));
                }
            )
        );

        render(<WebWidget />);

        const agentSelect = screen.getByLabelText(/select agent/i);
        fireEvent.change(agentSelect, { target: { value: 'agent-1' } });

        await waitFor(() => {
            expect(screen.getByTestId('widget-preview')).toBeInTheDocument();
        });

        const messageInput = screen.getByPlaceholderText(/type your message/i);
        const sendButton = screen.getByRole('button', { name: /send/i });

        fireEvent.change(messageInput, { target: { value: 'Test' } });
        fireEvent.click(sendButton);

        // Typing indicator should appear
        await waitFor(() => {
            expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
        });
    });

    /**
     * Test: Widget handles Nepali language
     */
    it('displays messages in Nepali correctly', async () => {
        render(<WebWidget />);

        const agentSelect = screen.getByLabelText(/select agent/i);
        fireEvent.change(agentSelect, { target: { value: 'agent-1' } });

        await waitFor(() => {
            expect(screen.getByTestId('widget-preview')).toBeInTheDocument();
        });

        const messageInput = screen.getByPlaceholderText(/type your message/i);
        const sendButton = screen.getByRole('button', { name: /send/i });

        // Send Nepali message
        fireEvent.change(messageInput, { target: { value: 'नमस्ते, मलाई मद्दत चाहिन्छ' } });
        fireEvent.click(sendButton);

        // Message should display correctly
        await waitFor(() => {
            expect(screen.getByText(/नमस्ते, मलाई मद्दत चाहिन्छ/)).toBeInTheDocument();
        });
    });

    /**
     * Test: Widget handles mixed language
     */
    it('handles mixed language messages', async () => {
        render(<WebWidget />);

        const agentSelect = screen.getByLabelText(/select agent/i);
        fireEvent.change(agentSelect, { target: { value: 'agent-1' } });

        await waitFor(() => {
            expect(screen.getByTestId('widget-preview')).toBeInTheDocument();
        });

        const messageInput = screen.getByPlaceholderText(/type your message/i);
        const sendButton = screen.getByRole('button', { name: /send/i });

        // Send mixed language message
        fireEvent.change(messageInput, {
            target: { value: 'नमस्ते, I need help with my order' },
        });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(
                screen.getByText(/नमस्ते, i need help with my order/i)
            ).toBeInTheDocument();
        });
    });

    /**
     * Test: Widget error handling
     */
    it('displays error when message fails to send', async () => {
        server.use(
            rest.post(
                'http://localhost:3000/api/widget/:agentId/message',
                (req: any, res: any, ctx: any) => {
                    return res(ctx.status(500), ctx.json({ error: 'Server error' }));
                }
            )
        );

        render(<WebWidget />);

        const agentSelect = screen.getByLabelText(/select agent/i);
        fireEvent.change(agentSelect, { target: { value: 'agent-1' } });

        await waitFor(() => {
            expect(screen.getByTestId('widget-preview')).toBeInTheDocument();
        });

        const messageInput = screen.getByPlaceholderText(/type your message/i);
        const sendButton = screen.getByRole('button', { name: /send/i });

        fireEvent.change(messageInput, { target: { value: 'Test' } });
        fireEvent.click(sendButton);

        // Error message should appear
        await waitFor(() => {
            expect(
                screen.getByText(/failed to send message|error occurred/i)
            ).toBeInTheDocument();
        });
    });

    /**
     * Test: No agent selected state
     */
    it('displays prompt to select agent when none selected', () => {
        render(<WebWidget />);

        expect(
            screen.getByText(/select an agent to configure widget/i)
        ).toBeInTheDocument();
        expect(screen.queryByTestId('widget-snippet')).not.toBeInTheDocument();
        expect(screen.queryByTestId('widget-preview')).not.toBeInTheDocument();
    });

    /**
     * Test: Widget customization preview updates in real-time
     */
    it('updates preview in real-time as settings change', async () => {
        render(<WebWidget />);

        const agentSelect = screen.getByLabelText(/select agent/i);
        fireEvent.change(agentSelect, { target: { value: 'agent-1' } });

        await waitFor(() => {
            expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
        });

        const preview = screen.getByTestId('widget-preview');

        // Change theme
        const themeSelect = screen.getByLabelText(/theme/i);
        fireEvent.change(themeSelect, { target: { value: 'dark' } });
        expect(preview).toHaveClass('theme-dark');

        // Change position
        const positionSelect = screen.getByLabelText(/position/i);
        fireEvent.change(positionSelect, { target: { value: 'top-right' } });
        expect(preview).toHaveClass('position-top-right');
    });
});

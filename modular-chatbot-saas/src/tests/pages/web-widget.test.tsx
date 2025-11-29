import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WebWidgetPage from '@/pages/web-widget';
import { mockWidgetApi, mockUseAppStore } from '../mocks/api';
import { mockAgents } from '../mocks/data';

// Mock dependencies
jest.mock('@/services/api', () => ({
    widgetApi: mockWidgetApi,
}));

jest.mock('@/state/store', () => ({
    useAppStore: mockUseAppStore,
}));

// Mock clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn(() => Promise.resolve()),
    },
});

describe('WebWidgetPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAppStore.mockReturnValue({
            agents: mockAgents,
            addNotification: jest.fn(),
        });
    });

    /**
     * Test: Page renders with widget configuration
     */
    it('renders widget configuration panel', async () => {
        render(<WebWidgetPage />);

        await waitFor(() => {
            expect(screen.getByText(/web widget configuration/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/select agent/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/primary color/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/position/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Agent selection
     */
    it('selects agent and loads configuration', async () => {
        const user = userEvent.setup();
        render(<WebWidgetPage />);

        const agentSelect = screen.getByLabelText(/select agent/i);
        await user.selectOptions(agentSelect, 'agent-1');

        await waitFor(() => {
            expect(mockWidgetApi.getConfig).toHaveBeenCalledWith('agent-1');
        });
    });

    /**
     * Test: Color picker changes
     */
    it('updates primary color', async () => {
        const user = userEvent.setup();
        render(<WebWidgetPage />);

        // Select agent first
        await user.selectOptions(screen.getByLabelText(/select agent/i), 'agent-1');

        // Change color
        const colorInput = screen.getByLabelText(/primary color/i);
        await user.clear(colorInput);
        await user.type(colorInput, '#FF5733');

        await waitFor(() => {
            expect(colorInput).toHaveValue('#FF5733');
        });
    });

    /**
     * Test: Position selection
     */
    it('changes widget position', async () => {
        const user = userEvent.setup();
        render(<WebWidgetPage />);

        await user.selectOptions(screen.getByLabelText(/select agent/i), 'agent-1');

        const positionSelect = screen.getByLabelText(/position/i);
        await user.selectOptions(positionSelect, 'bottom-left');

        await waitFor(() => {
            expect(positionSelect).toHaveValue('bottom-left');
        });
    });

    /**
     * Test: Greeting message update
     */
    it('updates greeting message', async () => {
        const user = userEvent.setup();
        render(<WebWidgetPage />);

        await user.selectOptions(screen.getByLabelText(/select agent/i), 'agent-1');

        const greetingInput = screen.getByLabelText(/greeting message/i);
        await user.clear(greetingInput);
        await user.type(greetingInput, 'नमस्ते! म तपाईंलाई कसरी मद्दत गर्न सक्छु?');

        await waitFor(() => {
            expect(greetingInput).toHaveValue('नमस्ते! म तपाईंलाई कसरी मद्दत गर्न सक्छु?');
        });
    });

    /**
     * Test: Save configuration
     */
    it('saves widget configuration', async () => {
        const user = userEvent.setup();
        mockWidgetApi.updateConfig.mockResolvedValue({
            position: 'bottom-right',
            primaryColor: '#FF5733',
            greeting: 'Hello!',
        });

        render(<WebWidgetPage />);

        await user.selectOptions(screen.getByLabelText(/select agent/i), 'agent-1');

        // Update config
        const colorInput = screen.getByLabelText(/primary color/i);
        await user.clear(colorInput);
        await user.type(colorInput, '#FF5733');

        // Save
        const saveButton = screen.getByRole('button', { name: /save configuration/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(mockWidgetApi.updateConfig).toHaveBeenCalledWith(
                'agent-1',
                expect.objectContaining({
                    primaryColor: '#FF5733',
                })
            );
        });
    });

    /**
     * Test: Live preview updates
     */
    it('updates live preview in real-time', async () => {
        const user = userEvent.setup();
        render(<WebWidgetPage />);

        await user.selectOptions(screen.getByLabelText(/select agent/i), 'agent-1');

        // Change color
        const colorInput = screen.getByLabelText(/primary color/i);
        await user.clear(colorInput);
        await user.type(colorInput, '#00FF00');

        // Preview should update
        await waitFor(() => {
            const preview = screen.getByTestId('widget-preview');
            expect(preview).toBeInTheDocument();
        });
    });

    /**
     * Test: Generate embed code
     */
    it('generates embed code snippet', async () => {
        const user = userEvent.setup();
        render(<WebWidgetPage />);

        await user.selectOptions(screen.getByLabelText(/select agent/i), 'agent-1');

        await waitFor(() => {
            expect(screen.getByText(/embed code/i)).toBeInTheDocument();
            const codeBlock = screen.getByRole('textbox', { name: /embed code/i });
            expect(codeBlock).toHaveValue(expect.stringContaining('<script'));
            expect(codeBlock).toHaveValue(expect.stringContaining('agent-1'));
        });
    });

    /**
     * Test: Copy embed code to clipboard
     */
    it('copies embed code to clipboard', async () => {
        const user = userEvent.setup();
        render(<WebWidgetPage />);

        await user.selectOptions(screen.getByLabelText(/select agent/i), 'agent-1');

        const copyButton = screen.getByRole('button', { name: /copy code/i });
        await user.click(copyButton);

        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalled();
        });

        // Should show success notification
        expect(screen.getByText(/copied to clipboard/i)).toBeInTheDocument();
    });

    /**
     * Test: Test chat functionality
     */
    it('tests widget chat', async () => {
        const user = userEvent.setup();
        mockWidgetApi.sendMessage.mockResolvedValue({
            response: 'Test response',
            language: 'english',
        });

        render(<WebWidgetPage />);

        await user.selectOptions(screen.getByLabelText(/select agent/i), 'agent-1');

        // Open test chat
        const testButton = screen.getByRole('button', { name: /test widget/i });
        await user.click(testButton);

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        // Send test message
        const messageInput = screen.getByPlaceholderText(/type a message/i);
        await user.type(messageInput, 'Hello, test message');

        const sendButton = screen.getByRole('button', { name: /send/i });
        await user.click(sendButton);

        await waitFor(() => {
            expect(mockWidgetApi.sendMessage).toHaveBeenCalledWith({
                agentId: 'agent-1',
                message: 'Hello, test message',
            });
        });

        // Should display response
        await waitFor(() => {
            expect(screen.getByText('Test response')).toBeInTheDocument();
        });
    });

    /**
     * Test: Widget size options
     */
    it('changes widget size', async () => {
        const user = userEvent.setup();
        render(<WebWidgetPage />);

        await user.selectOptions(screen.getByLabelText(/select agent/i), 'agent-1');

        const sizeSelect = screen.getByLabelText(/widget size/i);
        await user.selectOptions(sizeSelect, 'large');

        await waitFor(() => {
            expect(sizeSelect).toHaveValue('large');
        });
    });

    /**
     * Test: Toggle features
     */
    it('toggles widget features', async () => {
        const user = userEvent.setup();
        render(<WebWidgetPage />);

        await user.selectOptions(screen.getByLabelText(/select agent/i), 'agent-1');

        // Toggle sound
        const soundToggle = screen.getByLabelText(/enable sound/i);
        await user.click(soundToggle);
        expect(soundToggle).toBeChecked();

        // Toggle emoji
        const emojiToggle = screen.getByLabelText(/enable emoji/i);
        await user.click(emojiToggle);
        expect(emojiToggle).toBeChecked();
    });

    /**
     * Test: Customization validation
     */
    it('validates color format', async () => {
        const user = userEvent.setup();
        render(<WebWidgetPage />);

        await user.selectOptions(screen.getByLabelText(/select agent/i), 'agent-1');

        const colorInput = screen.getByLabelText(/primary color/i);
        await user.clear(colorInput);
        await user.type(colorInput, 'invalid-color');

        const saveButton = screen.getByRole('button', { name: /save configuration/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText(/invalid color format/i)).toBeInTheDocument();
        });

        expect(mockWidgetApi.updateConfig).not.toHaveBeenCalled();
    });

    /**
     * Test: Preview in different themes
     */
    it('previews widget in light and dark themes', async () => {
        const user = userEvent.setup();
        render(<WebWidgetPage />);

        await user.selectOptions(screen.getByLabelText(/select agent/i), 'agent-1');

        // Switch to dark theme preview
        const themeToggle = screen.getByRole('button', { name: /dark theme/i });
        await user.click(themeToggle);

        await waitFor(() => {
            const preview = screen.getByTestId('widget-preview');
            expect(preview).toHaveClass('dark-theme');
        });
    });

    /**
     * Test: Responsive preview
     */
    it('shows responsive preview for mobile', async () => {
        const user = userEvent.setup();
        render(<WebWidgetPage />);

        await user.selectOptions(screen.getByLabelText(/select agent/i), 'agent-1');

        // Switch to mobile preview
        const mobileButton = screen.getByRole('button', { name: /mobile/i });
        await user.click(mobileButton);

        await waitFor(() => {
            const preview = screen.getByTestId('widget-preview');
            expect(preview).toHaveClass('mobile-view');
        });
    });

    /**
     * Test: Empty state without agent selection
     */
    it('shows prompt to select agent', () => {
        render(<WebWidgetPage />);

        expect(screen.getByText(/select an agent to configure/i)).toBeInTheDocument();
    });

    /**
     * Test: Error handling
     */
    it('displays error on save failure', async () => {
        const user = userEvent.setup();
        mockWidgetApi.updateConfig.mockRejectedValueOnce(new Error('Save failed'));

        render(<WebWidgetPage />);

        await user.selectOptions(screen.getByLabelText(/select agent/i), 'agent-1');

        const saveButton = screen.getByRole('button', { name: /save configuration/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText(/failed to save configuration/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Unsaved changes warning
     */
    it('warns about unsaved changes', async () => {
        const user = userEvent.setup();
        window.confirm = jest.fn(() => false);

        render(<WebWidgetPage />);

        await user.selectOptions(screen.getByLabelText(/select agent/i), 'agent-1');

        // Make changes
        const colorInput = screen.getByLabelText(/primary color/i);
        await user.clear(colorInput);
        await user.type(colorInput, '#123456');

        // Try to switch agent without saving
        await user.selectOptions(screen.getByLabelText(/select agent/i), 'agent-2');

        expect(window.confirm).toHaveBeenCalledWith(
            'You have unsaved changes. Do you want to continue?'
        );
    });
});

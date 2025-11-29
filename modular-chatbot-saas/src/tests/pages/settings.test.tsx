import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from '@/pages/settings';
import { mockSettingsApi, mockUseAppStore } from '../mocks/api';
import { mockSettings } from '../mocks/data';

// Mock dependencies
jest.mock('@/services/api', () => ({
    settingsApi: mockSettingsApi,
}));

jest.mock('@/state/store', () => ({
    useAppStore: mockUseAppStore,
}));

describe('SettingsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAppStore.mockReturnValue({
            addNotification: jest.fn(),
        });
    });

    /**
     * Test: Page renders with all sections
     */
    it('renders all settings sections', async () => {
        mockSettingsApi.get.mockResolvedValue(mockSettings);
        render(<SettingsPage />);

        await waitFor(() => {
            expect(screen.getByText(/api keys/i)).toBeInTheDocument();
            expect(screen.getByText(/language settings/i)).toBeInTheDocument();
            expect(screen.getByText(/fallback responses/i)).toBeInTheDocument();
            expect(screen.getByText(/profile settings/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Load settings on mount
     */
    it('loads settings on initial render', async () => {
        mockSettingsApi.get.mockResolvedValue(mockSettings);
        render(<SettingsPage />);

        await waitFor(() => {
            expect(mockSettingsApi.get).toHaveBeenCalled();
        });
    });

    /**
     * Test: API Keys section
     */
    it('displays and updates API keys', async () => {
        const user = userEvent.setup();
        mockSettingsApi.get.mockResolvedValue(mockSettings);
        render(<SettingsPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/whatsapp api key/i)).toBeInTheDocument();
        });

        // Update WhatsApp API key
        const whatsappKeyInput = screen.getByLabelText(/whatsapp api key/i);
        await user.clear(whatsappKeyInput);
        await user.type(whatsappKeyInput, 'new-whatsapp-key');

        // Save
        const saveButton = screen.getByRole('button', { name: /save api keys/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(mockSettingsApi.updateApiKeys).toHaveBeenCalledWith(
                expect.objectContaining({
                    whatsappApiKey: 'new-whatsapp-key',
                })
            );
        });
    });

    /**
     * Test: API key visibility toggle
     */
    it('toggles API key visibility', async () => {
        const user = userEvent.setup();
        mockSettingsApi.get.mockResolvedValue(mockSettings);
        render(<SettingsPage />);

        await waitFor(() => {
            const apiKeyInput = screen.getByLabelText(/whatsapp api key/i) as HTMLInputElement;
            expect(apiKeyInput.type).toBe('password');
        });

        // Click show button
        const showButton = screen.getByRole('button', { name: /show api key/i });
        await user.click(showButton);

        const apiKeyInput = screen.getByLabelText(/whatsapp api key/i) as HTMLInputElement;
        expect(apiKeyInput.type).toBe('text');
    });

    /**
     * Test: Language settings update
     */
    it('updates language settings', async () => {
        const user = userEvent.setup();
        mockSettingsApi.get.mockResolvedValue(mockSettings);
        render(<SettingsPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/default language/i)).toBeInTheDocument();
        });

        // Change default language
        const languageSelect = screen.getByLabelText(/default language/i);
        await user.selectOptions(languageSelect, 'nepali');

        // Toggle auto-detect
        const autoDetectToggle = screen.getByLabelText(/auto-detect language/i);
        await user.click(autoDetectToggle);

        // Save
        const saveButton = screen.getByRole('button', { name: /save language settings/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(mockSettingsApi.updateLanguage).toHaveBeenCalledWith(
                expect.objectContaining({
                    defaultLanguage: 'nepali',
                    autoDetectLanguage: expect.any(Boolean),
                })
            );
        });
    });

    /**
     * Test: Fallback responses update
     */
    it('updates fallback responses', async () => {
        const user = userEvent.setup();
        mockSettingsApi.get.mockResolvedValue(mockSettings);
        render(<SettingsPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/no knowledge base response/i)).toBeInTheDocument();
        });

        // Update English fallback
        const noKbInput = screen.getByLabelText(/no knowledge base response/i);
        await user.clear(noKbInput);
        await user.type(noKbInput, 'Custom no KB response');

        // Update Nepali fallback
        const nepaliNoKbInput = screen.getByLabelText(/nepali no knowledge base/i);
        await user.clear(nepaliNoKbInput);
        await user.type(nepaliNoKbInput, 'कस्टम प्रतिक्रिया');

        // Save
        const saveButton = screen.getByRole('button', { name: /save fallback responses/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(mockSettingsApi.updateFallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    noKnowledgeBase: 'Custom no KB response',
                    nepaliNoKB: 'कस्टम प्रतिक्रिया',
                })
            );
        });
    });

    /**
     * Test: Profile settings update
     */
    it('updates profile settings', async () => {
        const user = userEvent.setup();
        mockSettingsApi.get.mockResolvedValue(mockSettings);
        render(<SettingsPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
        });

        // Update name
        const nameInput = screen.getByLabelText(/^name$/i);
        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');

        // Update company
        const companyInput = screen.getByLabelText(/company/i);
        await user.clear(companyInput);
        await user.type(companyInput, 'New Company');

        // Save
        const saveButton = screen.getByRole('button', { name: /save profile/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(mockSettingsApi.updateProfile).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Jane Doe',
                    company: 'New Company',
                })
            );
        });
    });

    /**
     * Test: Email notifications toggle
     */
    it('toggles email notifications', async () => {
        const user = userEvent.setup();
        mockSettingsApi.get.mockResolvedValue(mockSettings);
        render(<SettingsPage />);

        await waitFor(() => {
            const emailToggle = screen.getByLabelText(/email notifications/i);
            expect(emailToggle).toBeChecked();
        });

        const emailToggle = screen.getByLabelText(/email notifications/i);
        await user.click(emailToggle);

        expect(emailToggle).not.toBeChecked();
    });

    /**
     * Test: Timezone selection
     */
    it('updates timezone', async () => {
        const user = userEvent.setup();
        mockSettingsApi.get.mockResolvedValue(mockSettings);
        render(<SettingsPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument();
        });

        const timezoneSelect = screen.getByLabelText(/timezone/i);
        await user.selectOptions(timezoneSelect, 'America/New_York');

        await waitFor(() => {
            expect(timezoneSelect).toHaveValue('America/New_York');
        });
    });

    /**
     * Test: Validation errors
     */
    it('validates profile form', async () => {
        const user = userEvent.setup();
        mockSettingsApi.get.mockResolvedValue(mockSettings);
        render(<SettingsPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
        });

        // Clear required fields
        const nameInput = screen.getByLabelText(/^name$/i);
        await user.clear(nameInput);

        const emailInput = screen.getByLabelText(/email/i);
        await user.clear(emailInput);

        // Try to save
        const saveButton = screen.getByRole('button', { name: /save profile/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText(/name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        });

        expect(mockSettingsApi.updateProfile).not.toHaveBeenCalled();
    });

    /**
     * Test: Email format validation
     */
    it('validates email format', async () => {
        const user = userEvent.setup();
        mockSettingsApi.get.mockResolvedValue(mockSettings);
        render(<SettingsPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        });

        const emailInput = screen.getByLabelText(/email/i);
        await user.clear(emailInput);
        await user.type(emailInput, 'invalid-email');

        const saveButton = screen.getByRole('button', { name: /save profile/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Unsaved changes warning
     */
    it('warns about unsaved changes', async () => {
        const user = userEvent.setup();
        window.confirm = jest.fn(() => false);
        mockSettingsApi.get.mockResolvedValue(mockSettings);
        render(<SettingsPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
        });

        // Make changes
        const nameInput = screen.getByLabelText(/^name$/i);
        await user.clear(nameInput);
        await user.type(nameInput, 'Changed Name');

        // Try to navigate away (simulated)
        const languageTab = screen.getByRole('tab', { name: /language/i });
        await user.click(languageTab);

        expect(window.confirm).toHaveBeenCalledWith(
            'You have unsaved changes. Do you want to discard them?'
        );
    });

    /**
     * Test: Reset to defaults
     */
    it('resets settings to defaults', async () => {
        const user = userEvent.setup();
        window.confirm = jest.fn(() => true);
        mockSettingsApi.get.mockResolvedValue(mockSettings);
        render(<SettingsPage />);

        await waitFor(() => {
            expect(screen.getByText(/fallback responses/i)).toBeInTheDocument();
        });

        // Click reset button
        const resetButton = screen.getByRole('button', { name: /reset to defaults/i });
        await user.click(resetButton);

        expect(window.confirm).toHaveBeenCalledWith(
            'Are you sure you want to reset all settings to defaults?'
        );

        await waitFor(() => {
            expect(mockSettingsApi.update).toHaveBeenCalled();
        });
    });

    /**
     * Test: Success notifications
     */
    it('shows success notification after save', async () => {
        const user = userEvent.setup();
        const mockAddNotification = jest.fn();
        mockUseAppStore.mockReturnValue({
            addNotification: mockAddNotification,
        });
        mockSettingsApi.get.mockResolvedValue(mockSettings);
        mockSettingsApi.updateProfile.mockResolvedValue(mockSettings);

        render(<SettingsPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
        });

        const saveButton = screen.getByRole('button', { name: /save profile/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(mockAddNotification).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'success',
                    message: expect.stringContaining('saved'),
                })
            );
        });
    });

    /**
     * Test: Error handling
     */
    it('displays error on save failure', async () => {
        const user = userEvent.setup();
        mockSettingsApi.get.mockResolvedValue(mockSettings);
        mockSettingsApi.updateProfile.mockRejectedValueOnce(new Error('Save failed'));

        render(<SettingsPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
        });

        const saveButton = screen.getByRole('button', { name: /save profile/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText(/failed to save settings/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Loading state
     */
    it('shows loading state while fetching settings', async () => {
        mockSettingsApi.get.mockImplementationOnce(
            () => new Promise(resolve => setTimeout(() => resolve(mockSettings), 100))
        );

        render(<SettingsPage />);

        expect(screen.getByText(/loading settings/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText(/loading settings/i)).not.toBeInTheDocument();
        });
    });

    /**
     * Test: Tab navigation
     */
    it('navigates between setting tabs', async () => {
        const user = userEvent.setup();
        mockSettingsApi.get.mockResolvedValue(mockSettings);
        render(<SettingsPage />);

        await waitFor(() => {
            expect(screen.getByRole('tab', { name: /api keys/i })).toBeInTheDocument();
        });

        // Click language tab
        const languageTab = screen.getByRole('tab', { name: /language/i });
        await user.click(languageTab);

        await waitFor(() => {
            expect(screen.getByLabelText(/default language/i)).toBeVisible();
        });

        // Click fallback tab
        const fallbackTab = screen.getByRole('tab', { name: /fallback/i });
        await user.click(fallbackTab);

        await waitFor(() => {
            expect(screen.getByLabelText(/no knowledge base response/i)).toBeVisible();
        });
    });
});

/**
 * Settings Page Tests
 * Tests API key fields, save functionality, and loading existing settings
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '../test-utils';
import { server } from '../setup';
import { rest } from 'msw';
import Settings from '@/pages/settings';

describe('Settings Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Test: Settings page renders with all sections
     */
    it('renders settings page with all sections', async () => {
        render(<Settings />);

        expect(screen.getByText(/settings/i)).toBeInTheDocument();
        expect(screen.getByText(/api keys/i)).toBeInTheDocument();
        expect(screen.getByText(/language settings/i)).toBeInTheDocument();
        expect(screen.getByText(/fallback response/i)).toBeInTheDocument();
    });

    /**
     * Test: Load existing settings on mount
     */
    it('loads and displays existing settings on mount', async () => {
        render(<Settings />);

        // Wait for settings to load
        await waitFor(() => {
            // WhatsApp API key (masked)
            const whatsappInput = screen.getByLabelText(/whatsapp api key/i) as HTMLInputElement;
            expect(whatsappInput.value).toBe('wa-key-***');

            // Instagram API key (masked)
            const instagramInput = screen.getByLabelText(/instagram api key/i) as HTMLInputElement;
            expect(instagramInput.value).toBe('ig-key-***');

            // Gemma API URL
            const gemmaInput = screen.getByLabelText(/gemma api url/i) as HTMLInputElement;
            expect(gemmaInput.value).toBe('http://localhost:8080');
        });
    });

    /**
     * Test: API key input fields render correctly
     */
    it('renders API key input fields', async () => {
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByLabelText(/whatsapp api key/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/instagram api key/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/gemma api url/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Update WhatsApp API key
     */
    it('updates WhatsApp API key successfully', async () => {
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByLabelText(/whatsapp api key/i)).toBeInTheDocument();
        });

        const whatsappInput = screen.getByLabelText(/whatsapp api key/i);
        const saveButton = screen.getByRole('button', { name: /save settings/i });

        // Update key
        fireEvent.change(whatsappInput, { target: { value: 'new-wa-key-123' } });
        fireEvent.click(saveButton);

        // Success message
        await waitFor(() => {
            expect(screen.getByText(/settings updated successfully/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Update Instagram API key
     */
    it('updates Instagram API key successfully', async () => {
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByLabelText(/instagram api key/i)).toBeInTheDocument();
        });

        const instagramInput = screen.getByLabelText(/instagram api key/i);
        const saveButton = screen.getByRole('button', { name: /save settings/i });

        // Update key
        fireEvent.change(instagramInput, { target: { value: 'new-ig-key-456' } });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText(/settings updated successfully/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Update Gemma API URL
     */
    it('updates Gemma API URL successfully', async () => {
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByLabelText(/gemma api url/i)).toBeInTheDocument();
        });

        const gemmaInput = screen.getByLabelText(/gemma api url/i);
        const saveButton = screen.getByRole('button', { name: /save settings/i });

        // Update URL
        fireEvent.change(gemmaInput, { target: { value: 'http://localhost:9000' } });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText(/settings updated successfully/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Default language setting
     */
    it('displays and updates default language setting', async () => {
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByLabelText(/default language/i)).toBeInTheDocument();
        });

        const languageSelect = screen.getByLabelText(/default language/i) as HTMLSelectElement;

        // Should show current value
        expect(languageSelect.value).toBe('mixed');

        // Update language
        fireEvent.change(languageSelect, { target: { value: 'nepali' } });

        const saveButton = screen.getByRole('button', { name: /save settings/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText(/settings updated successfully/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Fallback response setting
     */
    it('displays and updates fallback response', async () => {
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByLabelText(/fallback response/i)).toBeInTheDocument();
        });

        const fallbackInput = screen.getByLabelText(/fallback response/i) as HTMLTextAreaElement;

        // Should show current value
        expect(fallbackInput.value).toContain('Sorry, I could not understand');

        // Update fallback
        fireEvent.change(fallbackInput, {
            target: { value: 'माफ गर्नुहोस्, म बुझिन। Please try again.' },
        });

        const saveButton = screen.getByRole('button', { name: /save settings/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText(/settings updated successfully/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Validation for empty API key
     */
    it('shows validation error for empty API key', async () => {
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByLabelText(/whatsapp api key/i)).toBeInTheDocument();
        });

        const whatsappInput = screen.getByLabelText(/whatsapp api key/i);
        const saveButton = screen.getByRole('button', { name: /save settings/i });

        // Clear the input
        fireEvent.change(whatsappInput, { target: { value: '' } });
        fireEvent.click(saveButton);

        // Validation error should appear
        await waitFor(() => {
            expect(screen.getByText(/api key cannot be empty/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Validation for invalid URL format
     */
    it('shows validation error for invalid URL', async () => {
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByLabelText(/gemma api url/i)).toBeInTheDocument();
        });

        const gemmaInput = screen.getByLabelText(/gemma api url/i);
        const saveButton = screen.getByRole('button', { name: /save settings/i });

        // Enter invalid URL
        fireEvent.change(gemmaInput, { target: { value: 'not-a-valid-url' } });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText(/invalid url format/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Show/hide API key toggle
     */
    it('toggles API key visibility', async () => {
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByLabelText(/whatsapp api key/i)).toBeInTheDocument();
        });

        const whatsappInput = screen.getByLabelText(/whatsapp api key/i) as HTMLInputElement;
        const toggleButton = screen.getAllByRole('button', { name: /show|hide/i })[0];

        // Should be masked initially
        expect(whatsappInput.type).toBe('password');

        // Click to show
        fireEvent.click(toggleButton);
        expect(whatsappInput.type).toBe('text');

        // Click to hide again
        fireEvent.click(toggleButton);
        expect(whatsappInput.type).toBe('password');
    });

    /**
     * Test: Reset to defaults button
     */
    it('resets settings to defaults when reset button is clicked', async () => {
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByLabelText(/default language/i)).toBeInTheDocument();
        });

        // Change a setting
        const languageSelect = screen.getByLabelText(/default language/i);
        fireEvent.change(languageSelect, { target: { value: 'english' } });

        // Click reset
        const resetButton = screen.getByRole('button', { name: /reset to defaults/i });
        fireEvent.click(resetButton);

        // Confirm reset
        const confirmButton = await screen.findByRole('button', { name: /confirm/i });
        fireEvent.click(confirmButton);

        // Should reset to default (mixed)
        await waitFor(() => {
            const languageSelectAfter = screen.getByLabelText(
                /default language/i
            ) as HTMLSelectElement;
            expect(languageSelectAfter.value).toBe('mixed');
        });
    });

    /**
     * Test: Unsaved changes warning
     */
    it('warns user about unsaved changes', async () => {
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByLabelText(/whatsapp api key/i)).toBeInTheDocument();
        });

        // Make a change
        const whatsappInput = screen.getByLabelText(/whatsapp api key/i);
        fireEvent.change(whatsappInput, { target: { value: 'new-key' } });

        // Unsaved changes warning should appear
        await waitFor(() => {
            expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Save button disabled when no changes
     */
    it('disables save button when no changes made', async () => {
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /save settings/i })).toBeInTheDocument();
        });

        const saveButton = screen.getByRole('button', { name: /save settings/i });

        // Should be disabled initially
        expect(saveButton).toBeDisabled();

        // Make a change
        const whatsappInput = screen.getByLabelText(/whatsapp api key/i);
        fireEvent.change(whatsappInput, { target: { value: 'new-key' } });

        // Should be enabled now
        expect(saveButton).toBeEnabled();
    });

    /**
     * Test: Loading state
     */
    it('shows loading state while fetching settings', () => {
        // Delay API response
        server.use(
            rest.get('http://localhost:3000/api/settings', async (req: any, res: any, ctx: any) => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return res(ctx.status(200), ctx.json({}));
            })
        );

        render(<Settings />);

        expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    /**
     * Test: Error state when loading fails
     */
    it('displays error when loading settings fails', async () => {
        server.use(
            rest.get('http://localhost:3000/api/settings', (req: any, res: any, ctx: any) => {
                return res(ctx.status(500), ctx.json({ error: 'Server error' }));
            })
        );

        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByText(/error loading settings/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
        });
    });

    /**
     * Test: Error handling when save fails
     */
    it('displays error message when save fails', async () => {
        server.use(
            rest.patch('http://localhost:3000/api/settings', (req: any, res: any, ctx: any) => {
                return res(ctx.status(500), ctx.json({ error: 'Failed to save' }));
            })
        );

        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByLabelText(/whatsapp api key/i)).toBeInTheDocument();
        });

        const whatsappInput = screen.getByLabelText(/whatsapp api key/i);
        const saveButton = screen.getByRole('button', { name: /save settings/i });

        fireEvent.change(whatsappInput, { target: { value: 'new-key' } });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText(/failed to save|error saving/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Test connection button for Gemma API
     */
    it('tests connection to Gemma API', async () => {
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByLabelText(/gemma api url/i)).toBeInTheDocument();
        });

        const testButton = screen.getByRole('button', { name: /test connection/i });
        fireEvent.click(testButton);

        // Should show testing indicator
        await waitFor(() => {
            expect(screen.getByText(/testing connection/i)).toBeInTheDocument();
        });

        // Success message
        await waitFor(
            () => {
                expect(screen.getByText(/connection successful/i)).toBeInTheDocument();
            },
            { timeout: 3000 }
        );
    });

    /**
     * Test: Export settings
     */
    it('exports settings as JSON', async () => {
        // Mock URL.createObjectURL
        global.URL.createObjectURL = jest.fn();

        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
        });

        const exportButton = screen.getByRole('button', { name: /export/i });
        fireEvent.click(exportButton);

        // Should trigger download
        await waitFor(() => {
            expect(global.URL.createObjectURL).toHaveBeenCalled();
        });
    });

    /**
     * Test: Import settings
     */
    it('imports settings from JSON file', async () => {
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument();
        });

        const importButton = screen.getByRole('button', { name: /import/i });
        fireEvent.click(importButton);

        // File input should appear
        const fileInput = await screen.findByLabelText(/select settings file/i);

        // Upload JSON file
        const file = new File(['{"whatsappApiKey": "imported-key"}'], 'settings.json', {
            type: 'application/json',
        });
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText(/settings imported/i)).toBeInTheDocument();
        });
    });
});

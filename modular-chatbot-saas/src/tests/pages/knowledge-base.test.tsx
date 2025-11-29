import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KnowledgeBasePage from '@/pages/knowledge-base';
import { mockKbApi, mockUseAppStore } from '../mocks/api';
import { mockKnowledgeBases, mockChunks } from '../mocks/data';

// Mock dependencies
jest.mock('@/services/api', () => ({
    kbApi: mockKbApi,
}));

jest.mock('@/state/store', () => ({
    useAppStore: mockUseAppStore,
}));

// Mock file reader
global.FileReader = class FileReader {
    readAsDataURL() {
        this.onload?.({ target: { result: 'data:text/plain;base64,test' } } as any);
    }
} as any;

describe('KnowledgeBasePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAppStore.mockReturnValue({
            addNotification: jest.fn(),
        });
    });

    /**
     * Test: Page renders with KB list
     */
    it('renders knowledge bases list', async () => {
        mockKbApi.getAll.mockResolvedValue(mockKnowledgeBases);
        render(<KnowledgeBasePage />);

        await waitFor(() => {
            expect(screen.getByText('Product Documentation')).toBeInTheDocument();
            expect(screen.getByText('FAQ Database')).toBeInTheDocument();
            expect(screen.getByText('Company Website')).toBeInTheDocument();
        });
    });

    /**
     * Test: Upload KB modal opens
     */
    it('opens upload modal when button clicked', async () => {
        const user = userEvent.setup();
        mockKbApi.getAll.mockResolvedValue(mockKnowledgeBases);
        render(<KnowledgeBasePage />);

        const uploadButton = screen.getByRole('button', { name: /upload knowledge base/i });
        await user.click(uploadButton);

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByLabelText(/knowledge base name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/agent/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: File upload validation
     */
    it('validates file upload form', async () => {
        const user = userEvent.setup();
        mockKbApi.getAll.mockResolvedValue(mockKnowledgeBases);
        render(<KnowledgeBasePage />);

        await user.click(screen.getByRole('button', { name: /upload knowledge base/i }));

        // Try to submit without file
        const submitButton = screen.getByRole('button', { name: /upload/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/agent is required/i)).toBeInTheDocument();
            expect(screen.getByText(/file is required/i)).toBeInTheDocument();
        });

        expect(mockKbApi.upload).not.toHaveBeenCalled();
    });

    /**
     * Test: Successfully upload PDF
     */
    it('uploads PDF file successfully', async () => {
        const user = userEvent.setup();
        mockKbApi.getAll.mockResolvedValue(mockKnowledgeBases);
        mockKbApi.upload.mockResolvedValue({ id: 'new-kb', status: 'processing' });

        render(<KnowledgeBasePage />);

        await user.click(screen.getByRole('button', { name: /upload knowledge base/i }));

        // Fill form
        await user.type(screen.getByLabelText(/knowledge base name/i), 'New KB');
        await user.selectOptions(screen.getByLabelText(/agent/i), 'agent-1');

        // Upload file
        const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
        const fileInput = screen.getByLabelText(/choose file/i);
        await user.upload(fileInput, file);

        // Submit
        await user.click(screen.getByRole('button', { name: /upload/i }));

        await waitFor(() => {
            expect(mockKbApi.upload).toHaveBeenCalled();
        });
    });

    /**
     * Test: Upload CSV file
     */
    it('uploads CSV file successfully', async () => {
        const user = userEvent.setup();
        mockKbApi.getAll.mockResolvedValue(mockKnowledgeBases);
        mockKbApi.upload.mockResolvedValue({ id: 'new-kb', status: 'processing' });

        render(<KnowledgeBasePage />);

        await user.click(screen.getByRole('button', { name: /upload knowledge base/i }));

        // Fill form
        await user.type(screen.getByLabelText(/knowledge base name/i), 'CSV KB');
        await user.selectOptions(screen.getByLabelText(/agent/i), 'agent-1');

        // Upload CSV
        const file = new File(['col1,col2\nval1,val2'], 'test.csv', { type: 'text/csv' });
        const fileInput = screen.getByLabelText(/choose file/i);
        await user.upload(fileInput, file);

        await user.click(screen.getByRole('button', { name: /upload/i }));

        await waitFor(() => {
            expect(mockKbApi.upload).toHaveBeenCalled();
        });
    });

    /**
     * Test: File type validation
     */
    it('rejects invalid file types', async () => {
        const user = userEvent.setup();
        mockKbApi.getAll.mockResolvedValue(mockKnowledgeBases);
        render(<KnowledgeBasePage />);

        await user.click(screen.getByRole('button', { name: /upload knowledge base/i }));

        // Try to upload invalid file type
        const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
        const fileInput = screen.getByLabelText(/choose file/i);
        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Website scraping modal
     */
    it('opens website scraping modal', async () => {
        const user = userEvent.setup();
        mockKbApi.getAll.mockResolvedValue(mockKnowledgeBases);
        render(<KnowledgeBasePage />);

        const scrapeButton = screen.getByRole('button', { name: /scrape website/i });
        await user.click(scrapeButton);

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByLabelText(/website url/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/max pages/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Website scraping validation
     */
    it('validates website URL', async () => {
        const user = userEvent.setup();
        mockKbApi.getAll.mockResolvedValue(mockKnowledgeBases);
        render(<KnowledgeBasePage />);

        await user.click(screen.getByRole('button', { name: /scrape website/i }));

        // Invalid URL
        const urlInput = screen.getByLabelText(/website url/i);
        await user.type(urlInput, 'not-a-url');

        const submitButton = screen.getByRole('button', { name: /start scraping/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/invalid url/i)).toBeInTheDocument();
        });

        expect(mockKbApi.scrape).not.toHaveBeenCalled();
    });

    /**
     * Test: Successfully scrape website
     */
    it('scrapes website successfully', async () => {
        const user = userEvent.setup();
        mockKbApi.getAll.mockResolvedValue(mockKnowledgeBases);
        mockKbApi.scrape.mockResolvedValue({ id: 'scraped-kb', status: 'processing' });

        render(<KnowledgeBasePage />);

        await user.click(screen.getByRole('button', { name: /scrape website/i }));

        // Fill form
        await user.type(screen.getByLabelText(/website url/i), 'https://example.com');
        await user.type(screen.getByLabelText(/knowledge base name/i), 'Scraped KB');
        await user.selectOptions(screen.getByLabelText(/agent/i), 'agent-1');

        await user.click(screen.getByRole('button', { name: /start scraping/i }));

        await waitFor(() => {
            expect(mockKbApi.scrape).toHaveBeenCalledWith({
                url: 'https://example.com',
                name: 'Scraped KB',
                agentId: 'agent-1',
                maxPages: expect.any(Number),
            });
        });
    });

    /**
     * Test: View KB chunks
     */
    it('views chunks of a knowledge base', async () => {
        const user = userEvent.setup();
        mockKbApi.getAll.mockResolvedValue(mockKnowledgeBases);
        mockKbApi.getChunks.mockResolvedValue({ chunks: mockChunks, total: 3 });

        render(<KnowledgeBasePage />);

        await waitFor(() => {
            expect(screen.getByText('Product Documentation')).toBeInTheDocument();
        });

        // Click view chunks button
        const viewButtons = screen.getAllByRole('button', { name: /view chunks/i });
        await user.click(viewButtons[0]);

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText(/45 chunks/i)).toBeInTheDocument();
        });

        expect(mockKbApi.getChunks).toHaveBeenCalledWith('kb-1', { page: 1, limit: 10 });
    });

    /**
     * Test: Chunk pagination
     */
    it('paginates through chunks', async () => {
        const user = userEvent.setup();
        mockKbApi.getAll.mockResolvedValue(mockKnowledgeBases);
        mockKbApi.getChunks.mockResolvedValue({ chunks: mockChunks, total: 30 });

        render(<KnowledgeBasePage />);

        await waitFor(() => {
            expect(screen.getByText('Product Documentation')).toBeInTheDocument();
        });

        const viewButtons = screen.getAllByRole('button', { name: /view chunks/i });
        await user.click(viewButtons[0]);

        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        // Click next page
        const nextButton = screen.getByRole('button', { name: /next/i });
        await user.click(nextButton);

        await waitFor(() => {
            expect(mockKbApi.getChunks).toHaveBeenCalledWith('kb-1', { page: 2, limit: 10 });
        });
    });

    /**
     * Test: Delete KB with confirmation
     */
    it('deletes knowledge base after confirmation', async () => {
        const user = userEvent.setup();
        window.confirm = jest.fn(() => true);
        mockKbApi.getAll.mockResolvedValue(mockKnowledgeBases);

        render(<KnowledgeBasePage />);

        await waitFor(() => {
            expect(screen.getByText('Product Documentation')).toBeInTheDocument();
        });

        // Click delete button
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        await user.click(deleteButtons[0]);

        expect(window.confirm).toHaveBeenCalledWith(
            'Are you sure you want to delete this knowledge base?'
        );

        await waitFor(() => {
            expect(mockKbApi.delete).toHaveBeenCalledWith('kb-1');
        });
    });

    /**
     * Test: Generate embeddings
     */
    it('generates embeddings for KB', async () => {
        const user = userEvent.setup();
        mockKbApi.getAll.mockResolvedValue(mockKnowledgeBases);
        mockKbApi.generateEmbeddings.mockResolvedValue({ status: 'processing' });

        render(<KnowledgeBasePage />);

        await waitFor(() => {
            expect(screen.getByText('Product Documentation')).toBeInTheDocument();
        });

        // Click generate embeddings button
        const embedButtons = screen.getAllByRole('button', { name: /generate embeddings/i });
        await user.click(embedButtons[0]);

        await waitFor(() => {
            expect(mockKbApi.generateEmbeddings).toHaveBeenCalledWith('kb-1');
        });
    });

    /**
     * Test: KB status badges
     */
    it('displays correct status badges', async () => {
        mockKbApi.getAll.mockResolvedValue(mockKnowledgeBases);
        render(<KnowledgeBasePage />);

        await waitFor(() => {
            // Ready status (green)
            const readyBadges = screen.getAllByText('ready');
            expect(readyBadges.length).toBeGreaterThan(0);

            // Processing status (yellow)
            expect(screen.getByText('processing')).toBeInTheDocument();
        });
    });

    /**
     * Test: Filter by agent
     */
    it('filters knowledge bases by agent', async () => {
        const user = userEvent.setup();
        mockKbApi.getAll.mockResolvedValue(mockKnowledgeBases);
        render(<KnowledgeBasePage />);

        await waitFor(() => {
            expect(screen.getByText('Product Documentation')).toBeInTheDocument();
            expect(screen.getByText('Company Website')).toBeInTheDocument();
        });

        // Filter by agent-1
        const agentFilter = screen.getByLabelText(/filter by agent/i);
        await user.selectOptions(agentFilter, 'agent-1');

        await waitFor(() => {
            expect(screen.getByText('Product Documentation')).toBeInTheDocument();
            expect(screen.queryByText('Company Website')).not.toBeInTheDocument();
        });
    });

    /**
     * Test: Search knowledge bases
     */
    it('searches knowledge bases by name', async () => {
        const user = userEvent.setup();
        mockKbApi.getAll.mockResolvedValue(mockKnowledgeBases);
        render(<KnowledgeBasePage />);

        await waitFor(() => {
            expect(screen.getByText('Product Documentation')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText(/search knowledge bases/i);
        await user.type(searchInput, 'Product');

        await waitFor(() => {
            expect(screen.getByText('Product Documentation')).toBeInTheDocument();
            expect(screen.queryByText('FAQ Database')).not.toBeInTheDocument();
        });
    });

    /**
     * Test: Empty state
     */
    it('shows empty state when no KBs exist', async () => {
        mockKbApi.getAll.mockResolvedValue([]);
        render(<KnowledgeBasePage />);

        await waitFor(() => {
            expect(screen.getByText(/no knowledge bases yet/i)).toBeInTheDocument();
            expect(screen.getByText(/upload your first knowledge base/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Loading state
     */
    it('shows loading state while fetching', async () => {
        mockKbApi.getAll.mockImplementationOnce(
            () => new Promise(resolve => setTimeout(() => resolve(mockKnowledgeBases), 100))
        );

        render(<KnowledgeBasePage />);

        expect(screen.getByText(/loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        });
    });

    /**
     * Test: Error handling
     */
    it('displays error message on fetch failure', async () => {
        mockKbApi.getAll.mockRejectedValueOnce(new Error('Failed to fetch'));

        render(<KnowledgeBasePage />);

        await waitFor(() => {
            expect(screen.getByText(/error loading knowledge bases/i)).toBeInTheDocument();
        });
    });
});

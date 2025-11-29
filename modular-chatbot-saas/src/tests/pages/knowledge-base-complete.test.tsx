/**
 * Knowledge Base Page Tests
 * Tests CSV/PDF upload, website scraping, KB items rendering, and vector embeddings
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '../test-utils';
import { server } from '../setup';
import { rest } from 'msw';
import KnowledgeBase from '@/pages/knowledge-base';

describe('Knowledge Base Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Test: KB page renders with all knowledge bases
     */
    it('renders knowledge base list', async () => {
        render(<KnowledgeBase />);

        await waitFor(() => {
            expect(screen.getByText(/knowledge bases/i)).toBeInTheDocument();
        });

        // Check for KB items from mock data
        await waitFor(() => {
            expect(screen.getByText(/general faq/i)).toBeInTheDocument();
            expect(screen.getByText(/product catalog/i)).toBeInTheDocument();
        });

        // Check for chunk counts
        expect(screen.getByText(/150 chunks/i)).toBeInTheDocument();
        expect(screen.getByText(/300 chunks/i)).toBeInTheDocument();
    });

    /**
     * Test: Upload CSV/PDF UI renders
     */
    it('renders upload file section with drag-and-drop', () => {
        render(<KnowledgeBase />);

        expect(screen.getByText(/upload file/i)).toBeInTheDocument();
        expect(screen.getByText(/drag.*drop.*csv.*pdf/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/browse files/i)).toBeInTheDocument();
    });

    /**
     * Test: File upload via input works
     */
    it('uploads file successfully via file input', async () => {
        render(<KnowledgeBase />);

        // Create mock file
        const file = new File(['sample content'], 'test.csv', { type: 'text/csv' });
        const fileInput = screen.getByLabelText(/browse files/i) as HTMLInputElement;

        // Simulate file selection
        fireEvent.change(fileInput, { target: { files: [file] } });

        // Should show file name
        await waitFor(() => {
            expect(screen.getByText(/test\.csv/i)).toBeInTheDocument();
        });

        // Click upload button
        const uploadButton = screen.getByRole('button', { name: /upload/i });
        fireEvent.click(uploadButton);

        // Wait for success message
        await waitFor(() => {
            expect(screen.getByText(/knowledge base created/i)).toBeInTheDocument();
        });

        // New KB should appear in list
        await waitFor(() => {
            expect(screen.getByText(/uploaded kb/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: File upload with drag and drop
     */
    it('uploads file via drag and drop', async () => {
        render(<KnowledgeBase />);

        const dropZone = screen.getByTestId('file-dropzone');
        const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

        // Simulate drag and drop
        const dropEvent = {
            dataTransfer: {
                files: [file],
                types: ['Files'],
            },
        };

        fireEvent.drop(dropZone, dropEvent);

        // Should show file name
        await waitFor(() => {
            expect(screen.getByText(/test\.pdf/i)).toBeInTheDocument();
        });

        // Auto-upload or manual trigger
        const uploadButton = screen.getByRole('button', { name: /upload/i });
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(screen.getByText(/knowledge base created/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: File validation - invalid file type
     */
    it('shows error for invalid file type', async () => {
        render(<KnowledgeBase />);

        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        const fileInput = screen.getByLabelText(/browse files/i) as HTMLInputElement;

        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(
                screen.getByText(/only csv and pdf files are allowed/i)
            ).toBeInTheDocument();
        });
    });

    /**
     * Test: File validation - file too large
     */
    it('shows error for oversized file', async () => {
        render(<KnowledgeBase />);

        // Create large file (> 10MB)
        const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.csv', {
            type: 'text/csv',
        });
        const fileInput = screen.getByLabelText(/browse files/i) as HTMLInputElement;

        fireEvent.change(fileInput, { target: { files: [largeFile] } });

        await waitFor(() => {
            expect(screen.getByText(/file size exceeds 10mb/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Website scrape form renders
     */
    it('renders website scrape form', () => {
        render(<KnowledgeBase />);

        expect(screen.getByText(/scrape website/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter website url/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /scrape/i })).toBeInTheDocument();
    });

    /**
     * Test: Website scraping works
     */
    it('scrapes website and creates knowledge base', async () => {
        render(<KnowledgeBase />);

        const urlInput = screen.getByPlaceholderText(/enter website url/i);
        const scrapeButton = screen.getByRole('button', { name: /scrape/i });

        // Enter URL
        fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
        fireEvent.click(scrapeButton);

        // Should show loading state
        await waitFor(() => {
            expect(screen.getByText(/scraping website/i)).toBeInTheDocument();
        });

        // Wait for success
        await waitFor(
            () => {
                expect(screen.getByText(/website scraped successfully/i)).toBeInTheDocument();
            },
            { timeout: 3000 }
        );

        // New KB should appear
        await waitFor(() => {
            expect(screen.getByText(/kb from https:\/\/example\.com/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Website scrape URL validation
     */
    it('validates website URL format', async () => {
        render(<KnowledgeBase />);

        const urlInput = screen.getByPlaceholderText(/enter website url/i);
        const scrapeButton = screen.getByRole('button', { name: /scrape/i });

        // Enter invalid URL
        fireEvent.change(urlInput, { target: { value: 'not-a-url' } });
        fireEvent.click(scrapeButton);

        await waitFor(() => {
            expect(screen.getByText(/invalid url format/i)).toBeInTheDocument();
        });

        // Should not trigger API call
        expect(screen.queryByText(/scraping website/i)).not.toBeInTheDocument();
    });

    /**
     * Test: View KB chunks modal
     */
    it('opens modal to view KB chunks', async () => {
        render(<KnowledgeBase />);

        await waitFor(() => {
            expect(screen.getByText(/general faq/i)).toBeInTheDocument();
        });

        // Click view chunks button
        const viewButtons = screen.getAllByRole('button', { name: /view chunks/i });
        fireEvent.click(viewButtons[0]);

        // Modal should open with chunks
        await waitFor(() => {
            expect(screen.getByText(/knowledge base chunks/i)).toBeInTheDocument();
            expect(screen.getByText(/sample chunk text 1/i)).toBeInTheDocument();
            expect(screen.getByText(/sample chunk text 2/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Delete knowledge base
     */
    it('deletes knowledge base with confirmation', async () => {
        render(<KnowledgeBase />);

        await waitFor(() => {
            expect(screen.getByText(/product catalog/i)).toBeInTheDocument();
        });

        // Click delete button
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        fireEvent.click(deleteButtons[1]);

        // Confirmation modal
        await waitFor(() => {
            expect(
                screen.getByText(/are you sure.*delete.*knowledge base/i)
            ).toBeInTheDocument();
        });

        // Confirm deletion
        const confirmButton = screen.getByRole('button', { name: /confirm/i });
        fireEvent.click(confirmButton);

        // KB should be removed
        await waitFor(() => {
            expect(screen.queryByText(/product catalog/i)).not.toBeInTheDocument();
        });
    });

    /**
     * Test: Mock vector embedding generation display
     */
    it('displays embedding generation progress', async () => {
        render(<KnowledgeBase />);

        const file = new File(['sample'], 'test.csv', { type: 'text/csv' });
        const fileInput = screen.getByLabelText(/browse files/i) as HTMLInputElement;

        fireEvent.change(fileInput, { target: { files: [file] } });

        const uploadButton = screen.getByRole('button', { name: /upload/i });
        fireEvent.click(uploadButton);

        // Should show embedding generation message
        await waitFor(() => {
            expect(screen.getByText(/generating embeddings/i)).toBeInTheDocument();
        });

        // Progress indicator
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    /**
     * Test: Search/filter knowledge bases
     */
    it('filters knowledge bases by search term', async () => {
        render(<KnowledgeBase />);

        await waitFor(() => {
            expect(screen.getByText(/general faq/i)).toBeInTheDocument();
            expect(screen.getByText(/product catalog/i)).toBeInTheDocument();
        });

        // Search for 'general'
        const searchInput = screen.getByPlaceholderText(/search knowledge bases/i);
        fireEvent.change(searchInput, { target: { value: 'general' } });

        // Only matching KB should be visible
        await waitFor(() => {
            expect(screen.getByText(/general faq/i)).toBeInTheDocument();
            expect(screen.queryByText(/product catalog/i)).not.toBeInTheDocument();
        });
    });

    /**
     * Test: Sort knowledge bases
     */
    it('sorts knowledge bases by different criteria', async () => {
        render(<KnowledgeBase />);

        await waitFor(() => {
            expect(screen.getByText(/general faq/i)).toBeInTheDocument();
        });

        // Find sort dropdown
        const sortSelect = screen.getByLabelText(/sort by/i);

        // Sort by chunks (descending)
        fireEvent.change(sortSelect, { target: { value: 'chunks-desc' } });

        await waitFor(() => {
            const items = screen.getAllByTestId('kb-item');
            // Product Catalog (300 chunks) should be first
            expect(items[0]).toHaveTextContent(/product catalog/i);
        });
    });

    /**
     * Test: Empty state when no KBs exist
     */
    it('displays empty state when no knowledge bases exist', async () => {
        server.use(
            rest.get('http://localhost:3000/api/kb', (req: any, res: any, ctx: any) => {
                return res(ctx.status(200), ctx.json([]));
            })
        );

        render(<KnowledgeBase />);

        await waitFor(() => {
            expect(screen.getByText(/no knowledge bases found/i)).toBeInTheDocument();
            expect(
                screen.getByText(/upload.*file.*scrape.*website/i)
            ).toBeInTheDocument();
        });
    });

    /**
     * Test: Loading state
     */
    it('shows loading state while fetching KBs', () => {
        server.use(
            rest.get('http://localhost:3000/api/kb', async (req: any, res: any, ctx: any) => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return res(ctx.status(200), ctx.json([]));
            })
        );

        render(<KnowledgeBase />);

        expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    /**
     * Test: Error handling for upload
     */
    it('handles upload errors gracefully', async () => {
        server.use(
            rest.post('http://localhost:3000/api/kb/upload', (req: any, res: any, ctx: any) => {
                return res(ctx.status(500), ctx.json({ error: 'Upload failed' }));
            })
        );

        render(<KnowledgeBase />);

        const file = new File(['content'], 'test.csv', { type: 'text/csv' });
        const fileInput = screen.getByLabelText(/browse files/i) as HTMLInputElement;

        fireEvent.change(fileInput, { target: { files: [file] } });

        const uploadButton = screen.getByRole('button', { name: /upload/i });
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: Error handling for scraping
     */
    it('handles scraping errors gracefully', async () => {
        server.use(
            rest.post('http://localhost:3000/api/kb/scrape', (req: any, res: any, ctx: any) => {
                return res(ctx.status(400), ctx.json({ error: 'Invalid URL' }));
            })
        );

        render(<KnowledgeBase />);

        const urlInput = screen.getByPlaceholderText(/enter website url/i);
        const scrapeButton = screen.getByRole('button', { name: /scrape/i });

        fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
        fireEvent.click(scrapeButton);

        await waitFor(() => {
            expect(screen.getByText(/invalid url/i)).toBeInTheDocument();
        });
    });

    /**
     * Test: KB card displays metadata correctly
     */
    it('displays KB metadata including dates', async () => {
        render(<KnowledgeBase />);

        await waitFor(() => {
            expect(screen.getByText(/general faq/i)).toBeInTheDocument();
        });

        // Check for creation date
        expect(screen.getByText(/created.*jan.*2025/i)).toBeInTheDocument();

        // Check for update date
        expect(screen.getByText(/updated.*jan.*2025/i)).toBeInTheDocument();
    });
});

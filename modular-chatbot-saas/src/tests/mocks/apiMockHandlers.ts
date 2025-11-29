/**
 * MSW Mock Handlers for all API routes
 * Simulates backend API responses for testing
 */

import { rest } from 'msw';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const handlers = [
    // ============================================
    // AUTH ROUTES
    // ============================================

    /**
     * POST /api/auth/login
     * Login with email and password
     */
    rest.post(`${API_BASE_URL}/api/auth/login`, (req, res, ctx) => {
        const { email, password } = req.body as any;

        // Mock validation
        if (!email || !password) {
            return res(
                ctx.status(400),
                ctx.json({ error: 'Email and password are required' })
            );
        }

        // Mock failed login
        if (password === 'wrongpassword') {
            return res(
                ctx.status(401),
                ctx.json({ error: 'Invalid credentials' })
            );
        }

        // Mock successful login
        return res(
            ctx.status(200),
            ctx.json({
                token: 'mock-jwt-token-123',
                user: {
                    id: '1',
                    email,
                    name: 'Test User',
                    role: 'agent',
                },
            })
        );
    }),

    /**
     * POST /api/auth/signup
     * Register new user
     */
    rest.post(`${API_BASE_URL}/api/auth/signup`, (req, res, ctx) => {
        const { email, password, name } = req.body as any;

        // Mock validation
        if (!email || !password || !name) {
            return res(
                ctx.status(400),
                ctx.json({ error: 'All fields are required' })
            );
        }

        // Mock email already exists
        if (email === 'existing@test.com') {
            return res(
                ctx.status(409),
                ctx.json({ error: 'Email already exists' })
            );
        }

        // Mock successful signup
        return res(
            ctx.status(201),
            ctx.json({
                token: 'mock-jwt-token-456',
                user: {
                    id: '2',
                    email,
                    name,
                    role: 'agent',
                },
            })
        );
    }),

    /**
     * POST /api/auth/logout
     * Logout user
     */
    rest.post(`${API_BASE_URL}/api/auth/logout`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ success: true }));
    }),

    /**
     * GET /api/auth/me
     * Get current user info
     */
    rest.get(`${API_BASE_URL}/api/auth/me`, (req, res, ctx) => {
        const token = req.headers.get('Authorization');

        if (!token || token !== 'Bearer mock-jwt-token-123') {
            return res(ctx.status(401), ctx.json({ error: 'Unauthorized' }));
        }

        return res(
            ctx.status(200),
            ctx.json({
                id: '1',
                email: 'test@test.com',
                name: 'Test User',
                role: 'agent',
            })
        );
    }),

    // ============================================
    // AGENT ROUTES
    // ============================================

    /**
     * GET /api/agents
     * Get all agents for current user
     */
    rest.get(`${API_BASE_URL}/api/agents`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
                {
                    id: 'agent-1',
                    name: 'WhatsApp Bot',
                    platform: 'whatsapp',
                    status: 'active',
                    queueLength: 5,
                    kbId: 'kb-1',
                    createdAt: '2025-01-01T00:00:00Z',
                },
                {
                    id: 'agent-2',
                    name: 'Instagram Bot',
                    platform: 'instagram',
                    status: 'inactive',
                    queueLength: 0,
                    kbId: 'kb-2',
                    createdAt: '2025-01-02T00:00:00Z',
                },
                {
                    id: 'agent-3',
                    name: 'Website Widget',
                    platform: 'website',
                    status: 'active',
                    queueLength: 12,
                    kbId: 'kb-1',
                    createdAt: '2025-01-03T00:00:00Z',
                },
            ])
        );
    }),

    /**
     * POST /api/agents
     * Create new agent
     */
    rest.post(`${API_BASE_URL}/api/agents`, (req, res, ctx) => {
        const { name, platform } = req.body as any;

        if (!name || !platform) {
            return res(
                ctx.status(400),
                ctx.json({ error: 'Name and platform are required' })
            );
        }

        return res(
            ctx.status(201),
            ctx.json({
                id: 'agent-new',
                name,
                platform,
                status: 'inactive',
                queueLength: 0,
                kbId: null,
                createdAt: new Date().toISOString(),
            })
        );
    }),

    /**
     * PATCH /api/agents/:id/status
     * Start or stop an agent
     */
    rest.patch(`${API_BASE_URL}/api/agents/:id/status`, (req, res, ctx) => {
        const { id } = req.params;
        const { status } = req.body as any;

        return res(
            ctx.status(200),
            ctx.json({
                id,
                status,
                message: `Agent ${status === 'active' ? 'started' : 'stopped'}`,
            })
        );
    }),

    /**
     * PATCH /api/agents/:id/kb
     * Assign knowledge base to agent
     */
    rest.patch(`${API_BASE_URL}/api/agents/:id/kb`, (req, res, ctx) => {
        const { id } = req.params;
        const { kbId } = req.body as any;

        return res(
            ctx.status(200),
            ctx.json({
                id,
                kbId,
                message: 'Knowledge base assigned successfully',
            })
        );
    }),

    /**
     * DELETE /api/agents/:id
     * Delete an agent
     */
    rest.delete(`${API_BASE_URL}/api/agents/:id`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ success: true }));
    }),

    // ============================================
    // KNOWLEDGE BASE ROUTES
    // ============================================

    /**
     * GET /api/kb
     * Get all knowledge bases
     */
    rest.get(`${API_BASE_URL}/api/kb`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
                {
                    id: 'kb-1',
                    name: 'General FAQ',
                    chunks: 150,
                    createdAt: '2025-01-01T00:00:00Z',
                    updatedAt: '2025-01-05T00:00:00Z',
                },
                {
                    id: 'kb-2',
                    name: 'Product Catalog',
                    chunks: 300,
                    createdAt: '2025-01-02T00:00:00Z',
                    updatedAt: '2025-01-06T00:00:00Z',
                },
            ])
        );
    }),

    /**
     * POST /api/kb/upload
     * Upload CSV/PDF to create knowledge base
     */
    rest.post(`${API_BASE_URL}/api/kb/upload`, async (req, res, ctx) => {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 100));

        return res(
            ctx.status(201),
            ctx.json({
                id: 'kb-new',
                name: 'Uploaded KB',
                chunks: 50,
                message: 'Knowledge base created successfully',
            })
        );
    }),

    /**
     * POST /api/kb/scrape
     * Scrape website to create knowledge base
     */
    rest.post(`${API_BASE_URL}/api/kb/scrape`, async (req, res, ctx) => {
        const { url } = req.body as any;

        if (!url) {
            return res(ctx.status(400), ctx.json({ error: 'URL is required' }));
        }

        // Simulate scraping delay
        await new Promise(resolve => setTimeout(resolve, 200));

        return res(
            ctx.status(201),
            ctx.json({
                id: 'kb-scraped',
                name: `KB from ${url}`,
                chunks: 75,
                message: 'Website scraped successfully',
            })
        );
    }),

    /**
     * GET /api/kb/:id/chunks
     * Get chunks for a specific knowledge base
     */
    rest.get(`${API_BASE_URL}/api/kb/:id/chunks`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([
                {
                    id: 'chunk-1',
                    text: 'Sample chunk text 1',
                    embedding: '[0.1, 0.2, 0.3]',
                },
                {
                    id: 'chunk-2',
                    text: 'Sample chunk text 2',
                    embedding: '[0.4, 0.5, 0.6]',
                },
            ])
        );
    }),

    /**
     * DELETE /api/kb/:id
     * Delete knowledge base
     */
    rest.delete(`${API_BASE_URL}/api/kb/:id`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ success: true }));
    }),

    // ============================================
    // WIDGET ROUTES
    // ============================================

    /**
     * GET /api/widget/:agentId/config
     * Get widget configuration
     */
    rest.get(`${API_BASE_URL}/api/widget/:agentId/config`, (req, res, ctx) => {
        const { agentId } = req.params;

        return res(
            ctx.status(200),
            ctx.json({
                agentId,
                widgetCode: `<script src="https://example.com/widget.js" data-agent="${agentId}"></script>`,
                settings: {
                    theme: 'light',
                    position: 'bottom-right',
                    greeting: 'नमस्ते! How can I help you?',
                },
            })
        );
    }),

    /**
     * POST /api/widget/:agentId/message
     * Send message via widget (for live preview)
     */
    rest.post(`${API_BASE_URL}/api/widget/:agentId/message`, async (req, res, ctx) => {
        const { message } = req.body as any;

        // Simulate LLM processing delay
        await new Promise(resolve => setTimeout(resolve, 150));

        return res(
            ctx.status(200),
            ctx.json({
                response: `Mock response to: ${message}`,
                language: 'mixed',
                intent: 'general_query',
            })
        );
    }),

    /**
     * PATCH /api/widget/:agentId/settings
     * Update widget settings
     */
    rest.patch(`${API_BASE_URL}/api/widget/:agentId/settings`, (req, res, ctx) => {
        const { agentId } = req.params;
        const settings = req.body as any;

        return res(
            ctx.status(200),
            ctx.json({
                agentId,
                settings,
                message: 'Widget settings updated',
            })
        );
    }),

    // ============================================
    // SETTINGS ROUTES
    // ============================================

    /**
     * GET /api/settings
     * Get user settings
     */
    rest.get(`${API_BASE_URL}/api/settings`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                whatsappApiKey: 'wa-key-***',
                instagramApiKey: 'ig-key-***',
                gemmaApiUrl: 'http://localhost:8080',
                defaultLanguage: 'mixed',
                fallbackResponse: 'Sorry, I could not understand. कृपया फेरि प्रयास गर्नुहोस्।',
            })
        );
    }),

    /**
     * PATCH /api/settings
     * Update user settings
     */
    rest.patch(`${API_BASE_URL}/api/settings`, (req, res, ctx) => {
        const settings = req.body as any;

        return res(
            ctx.status(200),
            ctx.json({
                ...settings,
                message: 'Settings updated successfully',
            })
        );
    }),

    // ============================================
    // ANALYTICS / DASHBOARD ROUTES
    // ============================================

    /**
     * GET /api/analytics/overview
     * Get dashboard overview metrics
     */
    rest.get(`${API_BASE_URL}/api/analytics/overview`, (req, res, ctx) => {
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
    }),

    /**
     * GET /api/analytics/history
     * Get historical analytics data
     */
    rest.get(`${API_BASE_URL}/api/analytics/history`, (req, res, ctx) => {
        const range = req.url.searchParams.get('range') || '24h';

        // Generate mock time-series data
        const dataPoints = range === '24h' ? 24 : 7;
        const history = Array.from({ length: dataPoints }, (_, i) => ({
            timestamp: new Date(Date.now() - (dataPoints - i) * 3600000).toISOString(),
            messages: Math.floor(Math.random() * 50) + 10,
            responseTime: Math.random() * 2 + 0.5,
            queueLength: Math.floor(Math.random() * 20),
            gpuUsage: Math.floor(Math.random() * 80) + 20,
        }));

        return res(ctx.status(200), ctx.json(history));
    }),
];

export default handlers;

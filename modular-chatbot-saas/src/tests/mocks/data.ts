import { Agent, KnowledgeBase, DashboardStats, User, Settings } from '@/types';

/**
 * Mock data for testing
 * Provides realistic sample data for all entity types
 */

// Mock Agents
export const mockAgents: Agent[] = [
    {
        id: 'agent-1',
        name: 'WhatsApp Bot',
        status: 'active',
        platform: 'whatsapp',
        language: 'english',
        createdAt: '2025-11-20T10:00:00Z',
        lastActive: '2025-11-26T08:30:00Z',
    },
    {
        id: 'agent-2',
        name: 'Instagram Support',
        status: 'inactive',
        platform: 'instagram',
        language: 'nepali',
        createdAt: '2025-11-21T14:00:00Z',
        lastActive: '2025-11-25T16:45:00Z',
    },
    {
        id: 'agent-3',
        name: 'Website Chat',
        status: 'active',
        platform: 'website',
        language: 'mixed',
        createdAt: '2025-11-22T09:00:00Z',
        lastActive: '2025-11-26T09:15:00Z',
    },
];

// Mock Knowledge Bases
export const mockKnowledgeBases: KnowledgeBase[] = [
    {
        id: 'kb-1',
        agentId: 'agent-1',
        name: 'Product Documentation',
        chunks: 45,
        source: 'pdf',
        status: 'ready',
        createdAt: '2025-11-20T11:00:00Z',
        metadata: {
            fileType: 'pdf',
            size: 2048000,
            pages: 15,
        },
    },
    {
        id: 'kb-2',
        agentId: 'agent-1',
        name: 'FAQ Database',
        chunks: 23,
        source: 'csv',
        status: 'ready',
        createdAt: '2025-11-21T10:00:00Z',
        metadata: {
            fileType: 'csv',
            size: 512000,
        },
    },
    {
        id: 'kb-3',
        agentId: 'agent-2',
        name: 'Company Website',
        chunks: 67,
        source: 'website',
        status: 'processing',
        createdAt: '2025-11-22T15:00:00Z',
        metadata: {
            url: 'https://example.com',
            pages: 12,
        },
    },
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
    totalAgents: 3,
    activeAgents: 2,
    totalMessages: 1250,
    todayMessages: 45,
    avgResponseTime: 1.8,
    queueLength: 5,
    gpuUsage: 35.5,
    errorRate: 2.3,
    recentActivity: [
        {
            id: 'activity-1',
            type: 'message',
            agentId: 'agent-1',
            agentName: 'WhatsApp Bot',
            message: 'New message received',
            timestamp: '2025-11-26T09:15:00Z',
        },
        {
            id: 'activity-2',
            type: 'agent_started',
            agentId: 'agent-3',
            agentName: 'Website Chat',
            message: 'Agent started successfully',
            timestamp: '2025-11-26T09:00:00Z',
        },
        {
            id: 'activity-3',
            type: 'kb_uploaded',
            agentId: 'agent-1',
            agentName: 'WhatsApp Bot',
            message: 'Knowledge base uploaded: FAQ Database',
            timestamp: '2025-11-26T08:45:00Z',
        },
    ],
};

// Mock User
export const mockUser: User = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Test Company',
    role: 'admin',
    createdAt: '2025-11-01T10:00:00Z',
};

// Mock Settings
export const mockSettings: Settings = {
    apiKeys: {
        whatsappApiKey: 'test-whatsapp-key',
        whatsappPhoneNumberId: '123456789',
        whatsappBusinessAccountId: '987654321',
        instagramAccessToken: 'test-instagram-token',
        instagramBusinessAccountId: '456789123',
        openaiApiKey: 'sk-test-key',
    },
    language: {
        defaultLanguage: 'english',
        autoDetectLanguage: true,
        supportedLanguages: ['english', 'nepali', 'mixed'],
        translationEnabled: false,
    },
    fallback: {
        noKnowledgeBase: 'I apologize, but I don\'t have enough information to answer that.',
        errorResponse: 'Sorry, I encountered an error. Please try again.',
        outOfScope: 'I can only help with topics related to our services.',
        agentOffline: 'Our chatbot is currently offline. Please try again later.',
        queueFull: 'We\'re experiencing high volume. Your message will be answered shortly.',
        nepaliNoKB: 'माफ गर्नुहोस्, मसँग त्यो प्रश्नको जवाफ दिन पर्याप्त जानकारी छैन।',
        nepaliError: 'माफ गर्नुहोस्, त्रुटि भयो। कृपया फेरि प्रयास गर्नुहोस्।',
        nepaliOffline: 'हाम्रो च्याटबोट अहिले अफलाइन छ। कृपया पछि प्रयास गर्नुहोस्।',
    },
    profile: {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Test Company',
        timezone: 'Asia/Kathmandu',
        emailNotifications: true,
        weeklyReport: true,
    },
};

// Mock Chunks
export const mockChunks = [
    {
        id: 'chunk-1',
        kbId: 'kb-1',
        text: 'This is the first chunk of text from the knowledge base.',
        index: 0,
        metadata: { page: 1, position: 0 },
    },
    {
        id: 'chunk-2',
        kbId: 'kb-1',
        text: 'This is the second chunk with more detailed information.',
        index: 1,
        metadata: { page: 1, position: 1 },
    },
    {
        id: 'chunk-3',
        kbId: 'kb-1',
        text: 'Final chunk containing conclusion and references.',
        index: 2,
        metadata: { page: 2, position: 0 },
    },
];

// Mock Chart Data
export const mockChartData = {
    messageVolume: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Messages',
                data: [120, 150, 180, 220, 200, 160, 140],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
            },
        ],
    },
    responseTime: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Avg Response Time (s)',
                data: [1.5, 1.8, 1.6, 2.1, 1.9, 1.7, 1.8],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
            },
        ],
    },
};

// Mock API Responses
export const mockApiResponses = {
    login: {
        token: 'mock-jwt-token',
        user: mockUser,
    },
    signup: {
        token: 'mock-jwt-token',
        user: mockUser,
    },
    agents: mockAgents,
    knowledgeBases: mockKnowledgeBases,
    dashboardStats: mockDashboardStats,
    settings: mockSettings,
    chunks: mockChunks,
};

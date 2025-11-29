import { mockApiResponses, mockAgents, mockKnowledgeBases, mockDashboardStats, mockSettings } from './data';

/**
 * Mock API Service
 * Provides mock implementations of all API endpoints for testing
 */

export const mockAgentApi = {
    getAll: jest.fn(() => Promise.resolve(mockAgents)),
    getById: jest.fn((id: string) =>
        Promise.resolve(mockAgents.find(a => a.id === id))
    ),
    create: jest.fn((data: any) =>
        Promise.resolve({ id: 'new-agent', ...data })
    ),
    update: jest.fn((id: string, data: any) =>
        Promise.resolve({ ...mockAgents[0], ...data })
    ),
    delete: jest.fn(() => Promise.resolve({ success: true })),
    start: jest.fn(() => Promise.resolve({ status: 'active' })),
    stop: jest.fn(() => Promise.resolve({ status: 'inactive' })),
};

export const mockKbApi = {
    getAll: jest.fn(() => Promise.resolve(mockKnowledgeBases)),
    getById: jest.fn((id: string) =>
        Promise.resolve(mockKnowledgeBases.find(kb => kb.id === id))
    ),
    upload: jest.fn(() =>
        Promise.resolve({ id: 'new-kb', status: 'processing' })
    ),
    scrape: jest.fn(() =>
        Promise.resolve({ id: 'scraped-kb', status: 'processing' })
    ),
    delete: jest.fn(() => Promise.resolve({ success: true })),
    generateEmbeddings: jest.fn(() =>
        Promise.resolve({ status: 'processing' })
    ),
    getChunks: jest.fn(() =>
        Promise.resolve({ chunks: [], total: 0 })
    ),
};

export const mockAnalyticsApi = {
    getDashboard: jest.fn(() => Promise.resolve(mockDashboardStats)),
    getAgentMetrics: jest.fn(() => Promise.resolve([])),
    getMetrics: jest.fn(() => Promise.resolve([])),
};

export const mockAuthApi = {
    login: jest.fn(() => Promise.resolve(mockApiResponses.login)),
    signup: jest.fn(() => Promise.resolve(mockApiResponses.signup)),
    logout: jest.fn(() => Promise.resolve()),
    getCurrentUser: jest.fn(() => Promise.resolve(mockApiResponses.login.user)),
    refreshToken: jest.fn(() => Promise.resolve({ token: 'new-token' })),
};

export const mockSettingsApi = {
    get: jest.fn(() => Promise.resolve(mockSettings)),
    update: jest.fn((data: any) => Promise.resolve({ ...mockSettings, ...data })),
    updateApiKeys: jest.fn((data: any) => Promise.resolve(mockSettings)),
    updateLanguage: jest.fn((data: any) => Promise.resolve(mockSettings)),
    updateFallback: jest.fn((data: any) => Promise.resolve(mockSettings)),
    updateProfile: jest.fn((data: any) => Promise.resolve(mockSettings)),
};

export const mockWidgetApi = {
    getConfig: jest.fn(() =>
        Promise.resolve({
            position: 'bottom-right',
            primaryColor: '#3B82F6',
            greeting: 'Hello! How can I help you today?',
        })
    ),
    updateConfig: jest.fn((agentId: string, config: any) =>
        Promise.resolve(config)
    ),
    sendMessage: jest.fn(() =>
        Promise.resolve({
            response: 'This is a test response',
            language: 'english',
        })
    ),
};

// Mock Zustand store
export const mockUseAppStore = jest.fn(() => ({
    agents: mockAgents,
    selectedAgent: null,
    dashboardStats: mockDashboardStats,
    sidebarOpen: true,
    notifications: [],
    setAgents: jest.fn(),
    setSelectedAgent: jest.fn(),
    setDashboardStats: jest.fn(),
    toggleSidebar: jest.fn(),
    addNotification: jest.fn(),
    removeNotification: jest.fn(),
}));

// Mock useSocket hook
export const mockUseSocket = jest.fn(() => ({
    socket: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
    },
    isConnected: true,
}));

// Mock auth service
export const mockAuthService = {
    login: jest.fn(() => Promise.resolve(mockApiResponses.login)),
    signup: jest.fn(() => Promise.resolve(mockApiResponses.signup)),
    logout: jest.fn(() => Promise.resolve()),
    getCurrentUser: jest.fn(() => Promise.resolve(mockApiResponses.login.user)),
    refreshToken: jest.fn(() => Promise.resolve('new-token')),
    isAuthenticated: jest.fn(() => true),
    getToken: jest.fn(() => 'mock-token'),
    getUser: jest.fn(() => mockApiResponses.login.user),
};

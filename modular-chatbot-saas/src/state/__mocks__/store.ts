/**
 * Mock implementation of the Zustand store for testing
 */

const mockStore = {
    // Agents
    agents: [],
    selectedAgent: null,
    setAgents: jest.fn(),
    setSelectedAgent: jest.fn(),

    // Dashboard stats
    dashboardStats: null,
    setDashboardStats: jest.fn(),

    // UI state
    sidebarOpen: true,
    toggleSidebar: jest.fn(),

    // Notifications
    notifications: [],
    addNotification: jest.fn(),
    removeNotification: jest.fn(),
};

export const useAppStore = jest.fn(() => mockStore);

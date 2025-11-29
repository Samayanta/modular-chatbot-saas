import { create } from 'zustand';
import { Agent, DashboardStats } from '@/types';

interface AppState {
    // Agents
    agents: Agent[];
    selectedAgent: Agent | null;
    setAgents: (agents: Agent[]) => void;
    setSelectedAgent: (agent: Agent | null) => void;

    // Dashboard stats
    dashboardStats: DashboardStats | null;
    setDashboardStats: (stats: DashboardStats) => void;

    // UI state
    sidebarOpen: boolean;
    toggleSidebar: () => void;

    // Notifications
    notifications: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
    addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
    removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
    // Agents
    agents: [],
    selectedAgent: null,
    setAgents: (agents) => set({ agents }),
    setSelectedAgent: (agent) => set({ selectedAgent: agent }),

    // Dashboard stats
    dashboardStats: null,
    setDashboardStats: (stats) => set({ dashboardStats: stats }),

    // UI state
    sidebarOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    // Notifications
    notifications: [],
    addNotification: (message, type) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
            notifications: [...state.notifications, { id, message, type }],
        }));
        // Auto-remove after 5 seconds
        setTimeout(() => {
            set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id),
            }));
        }, 5000);
    },
    removeNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        })),
}));

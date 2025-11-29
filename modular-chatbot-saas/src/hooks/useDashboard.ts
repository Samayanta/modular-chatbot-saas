import { useEffect } from 'react';
import { useAppStore } from '@/state/store';
import { analyticsApi } from '@/services/api';

export const useDashboard = () => {
    const { dashboardStats, setDashboardStats, addNotification } = useAppStore();

    const fetchDashboardStats = async () => {
        try {
            const stats = await analyticsApi.getDashboard();
            setDashboardStats(stats);
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
            addNotification('Failed to load dashboard statistics', 'error');
        }
    };

    useEffect(() => {
        fetchDashboardStats();
        // Refresh every 30 seconds
        const interval = setInterval(fetchDashboardStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return { dashboardStats, refresh: fetchDashboardStats };
};

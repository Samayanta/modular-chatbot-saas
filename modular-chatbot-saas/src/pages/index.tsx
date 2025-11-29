import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useSocket } from '@/hooks/useSocket';

export default function HomePage() {
    const { dashboardStats } = useDashboard();
    const { isConnected } = useSocket();

    const statCards = [
        { label: 'Total Agents', value: dashboardStats?.totalAgents || 0, icon: '🤖' },
        { label: 'Active Agents', value: dashboardStats?.activeAgents || 0, icon: '✅' },
        { label: 'Total Messages', value: dashboardStats?.totalMessages || 0, icon: '💬' },
        { label: 'Avg Response Time', value: `${dashboardStats?.avgResponseTime || 0}ms`, icon: '⚡' },
        { label: 'Queue Length', value: dashboardStats?.queueLength || 0, icon: '📋' },
        { label: 'GPU Usage', value: `${dashboardStats?.gpuUsage || 0}%`, icon: '🔥' },
    ];

    return (
        <div className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">
                    {isConnected ? 'Connected to server' : 'Disconnected'}
                </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.label} className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <span className="text-4xl">{stat.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    <p className="text-gray-600 text-sm">No recent activity</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="flex gap-3">
                    <button className="btn-primary">Create New Agent</button>
                    <button className="btn-secondary">Upload Knowledge Base</button>
                </div>
            </div>
        </div>
    );
}

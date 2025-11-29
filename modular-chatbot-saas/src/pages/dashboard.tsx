import React, { useEffect, useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useSocket } from '@/hooks/useSocket';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { agentApi, analyticsApi } from '@/services/api';
import { Agent } from '@/types';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

/**
 * Dashboard Overview Page
 * Displays real-time metrics, charts, and agent status
 */
export default function DashboardPage() {
    const { dashboardStats, refresh } = useDashboard();
    const { socket, isConnected } = useSocket();

    // Local state for detailed data
    const [agents, setAgents] = useState<Agent[]>([]);
    const [messageHistory, setMessageHistory] = useState<any[]>([]);
    const [responseTimeHistory, setResponseTimeHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Fetch initial dashboard data
     */
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);

                // Fetch agents
                const agentsData = await agentApi.getAll();
                setAgents(agentsData);

                // Fetch message history for chart (last 24 hours)
                const metricsData = await analyticsApi.getDashboard();
                if (metricsData.messageHistory) {
                    setMessageHistory(metricsData.messageHistory);
                }
                if (metricsData.responseTimeHistory) {
                    setResponseTimeHistory(metricsData.responseTimeHistory);
                }
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    /**
     * Setup Socket.io listeners for real-time updates
     */
    useEffect(() => {
        if (!socket) return;

        // Listen for metric updates
        socket.on('metrics:update', (data) => {
            console.log('Received metric update:', data);
            refresh(); // Refresh dashboard stats
        });

        // Listen for agent status changes
        socket.on('agent:status', (data) => {
            console.log('Agent status changed:', data);
            setAgents((prev) =>
                prev.map((agent) =>
                    agent.id === data.agentId
                        ? { ...agent, status: data.status }
                        : agent
                )
            );
        });

        // Listen for new messages
        socket.on('message:received', (data) => {
            console.log('New message received:', data);
            // Update message history
            setMessageHistory((prev) => [...prev.slice(-23), data]);
        });

        return () => {
            socket.off('metrics:update');
            socket.off('agent:status');
            socket.off('message:received');
        };
    }, [socket, refresh]);

    /**
     * Auto-refresh dashboard every 30 seconds
     */
    useEffect(() => {
        const interval = setInterval(() => {
            refresh();
        }, 30000);

        return () => clearInterval(interval);
    }, [refresh]);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with connection status */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-600 mt-1">Monitor your chatbot agents in real-time</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm text-gray-600">
                        {isConnected ? 'Live' : 'Disconnected'}
                    </span>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <MetricsGrid stats={dashboardStats} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Message Volume Chart */}
                <MessageVolumeChart data={messageHistory} />

                {/* Response Time Chart */}
                <ResponseTimeChart data={responseTimeHistory} />
            </div>

            {/* Second Row Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Agent Status Distribution */}
                <AgentStatusChart agents={agents} />

                {/* Queue Length by Agent */}
                <QueueLengthChart agents={agents} />
            </div>

            {/* Active Agents Table */}
            <ActiveAgentsTable agents={agents} />

            {/* Recent Activity */}
            <RecentActivity messageHistory={messageHistory} />
        </div>
    );
}

/**
 * Metrics Grid Component
 * Displays key statistics in card format
 */
interface MetricsGridProps {
    stats: any;
}

function MetricsGrid({ stats }: MetricsGridProps) {
    const metrics = [
        {
            label: 'Total Agents',
            value: stats?.totalAgents || 0,
            icon: '🤖',
            color: 'bg-blue-100 text-blue-600',
        },
        {
            label: 'Active Agents',
            value: stats?.activeAgents || 0,
            icon: '✅',
            color: 'bg-green-100 text-green-600',
        },
        {
            label: 'Total Messages',
            value: stats?.totalMessages || 0,
            icon: '💬',
            color: 'bg-purple-100 text-purple-600',
        },
        {
            label: 'Avg Response Time',
            value: `${stats?.avgResponseTime || 0}ms`,
            icon: '⚡',
            color: 'bg-yellow-100 text-yellow-600',
        },
        {
            label: 'Queue Length',
            value: stats?.queueLength || 0,
            icon: '📋',
            color: 'bg-orange-100 text-orange-600',
        },
        {
            label: 'GPU Usage',
            value: `${stats?.gpuUsage || 0}%`,
            icon: '🔥',
            color: 'bg-red-100 text-red-600',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric) => (
                <div key={metric.label} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                            <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                        </div>
                        <div className={`w-14 h-14 rounded-xl ${metric.color} flex items-center justify-center text-2xl`}>
                            {metric.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Message Volume Chart Component
 * Line chart showing message volume over time
 */
interface MessageVolumeChartProps {
    data: any[];
}

function MessageVolumeChart({ data }: MessageVolumeChartProps) {
    // Process data for chart (last 24 hours)
    const labels = data.map((item) => {
        const date = new Date(item.timestamp || Date.now());
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    });

    const values = data.map((item) => item.count || 0);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Messages',
                data: values,
                fill: true,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                },
            },
        },
    };

    return (
        <div className="card">
            <h3 className="text-lg font-semibold mb-4">Message Volume (24h)</h3>
            <div className="h-[300px]">
                {data.length > 0 ? (
                    <Line data={chartData} options={options} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        No data available
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Response Time Chart Component
 * Line chart showing average response time over time
 */
interface ResponseTimeChartProps {
    data: any[];
}

function ResponseTimeChart({ data }: ResponseTimeChartProps) {
    const labels = data.map((item) => {
        const date = new Date(item.timestamp || Date.now());
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    });

    const values = data.map((item) => item.avgTime || 0);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Response Time (ms)',
                data: values,
                fill: true,
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="card">
            <h3 className="text-lg font-semibold mb-4">Avg Response Time (24h)</h3>
            <div className="h-[300px]">
                {data.length > 0 ? (
                    <Line data={chartData} options={options} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        No data available
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Agent Status Chart Component
 * Doughnut chart showing agent status distribution
 */
interface AgentStatusChartProps {
    agents: Agent[];
}

function AgentStatusChart({ agents }: AgentStatusChartProps) {
    const statusCounts = agents.reduce((acc, agent) => {
        acc[agent.status] = (acc[agent.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const chartData = {
        labels: ['Active', 'Inactive', 'Error'],
        datasets: [
            {
                data: [
                    statusCounts.active || 0,
                    statusCounts.inactive || 0,
                    statusCounts.error || 0,
                ],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(156, 163, 175, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                ],
                borderColor: [
                    'rgb(16, 185, 129)',
                    'rgb(156, 163, 175)',
                    'rgb(239, 68, 68)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
        },
    };

    return (
        <div className="card">
            <h3 className="text-lg font-semibold mb-4">Agent Status Distribution</h3>
            <div className="h-[300px] flex items-center justify-center">
                {agents.length > 0 ? (
                    <Doughnut data={chartData} options={options} />
                ) : (
                    <p className="text-gray-500">No agents available</p>
                )}
            </div>
        </div>
    );
}

/**
 * Queue Length Chart Component
 * Bar chart showing queue length per agent
 */
interface QueueLengthChartProps {
    agents: Agent[];
}

function QueueLengthChart({ agents }: QueueLengthChartProps) {
    const chartData = {
        labels: agents.map((agent) => agent.name),
        datasets: [
            {
                label: 'Queue Length',
                data: agents.map(() => Math.floor(Math.random() * 50)), // TODO: Replace with actual queue data
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                },
            },
        },
    };

    return (
        <div className="card">
            <h3 className="text-lg font-semibold mb-4">Queue Length by Agent</h3>
            <div className="h-[300px]">
                {agents.length > 0 ? (
                    <Bar data={chartData} options={options} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        No agents available
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Active Agents Table Component
 * Displays detailed agent information in table format
 */
interface ActiveAgentsTableProps {
    agents: Agent[];
}

function ActiveAgentsTable({ agents }: ActiveAgentsTableProps) {
    return (
        <div className="card">
            <h3 className="text-lg font-semibold mb-4">Active Agents</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Agent
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Platform
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Language
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Active
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {agents.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                    No agents found. Create your first agent to get started.
                                </td>
                            </tr>
                        ) : (
                            agents.map((agent) => (
                                <tr key={agent.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 capitalize">{agent.platform}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${agent.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : agent.status === 'inactive'
                                                        ? 'bg-gray-100 text-gray-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {agent.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                        {agent.language}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {agent.lastActive
                                            ? new Date(agent.lastActive).toLocaleString()
                                            : 'Never'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/**
 * Recent Activity Component
 * Shows recent message activity
 */
interface RecentActivityProps {
    messageHistory: any[];
}

function RecentActivity({ messageHistory }: RecentActivityProps) {
    const recentMessages = messageHistory.slice(-5).reverse();

    return (
        <div className="card">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
                {recentMessages.length === 0 ? (
                    <p className="text-gray-600 text-sm">No recent activity</p>
                ) : (
                    recentMessages.map((message, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <span className="text-primary-600 font-semibold">
                                        {message.agentName?.charAt(0) || 'A'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {message.agentName || 'Unknown Agent'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        New message received from {message.platform || 'unknown'}
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-500">
                                {message.timestamp
                                    ? new Date(message.timestamp).toLocaleTimeString()
                                    : 'Just now'}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

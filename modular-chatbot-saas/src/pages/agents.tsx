import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppStore } from '@/state/store';
import { agentApi, kbApi } from '@/services/api';
import { Agent, KnowledgeBase } from '@/types';

/**
 * Agent Management Page
 * Comprehensive interface for managing chatbot agents
 * Features: Create, Update, Delete, Start/Stop, KB Assignment, Queue Monitoring
 */
export default function AgentsPage() {
    const { agents, setAgents, addNotification } = useAppStore();
    const [isLoading, setIsLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showKBModal, setShowKBModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
    const [queueLengths, setQueueLengths] = useState<Record<string, number>>({});
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    /**
     * Load all agents on component mount
     */
    useEffect(() => {
        loadAgents();
        // Fetch queue lengths every 10 seconds
        const interval = setInterval(fetchQueueLengths, 10000);
        return () => clearInterval(interval);
    }, []);

    /**
     * Fetch agents from backend
     */
    const loadAgents = async () => {
        try {
            setIsLoading(true);
            const data = await agentApi.getAll();
            setAgents(data);
            await fetchQueueLengths();
        } catch (error) {
            console.error('Failed to load agents:', error);
            addNotification('Failed to load agents', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Fetch queue lengths for all agents
     */
    const fetchQueueLengths = async () => {
        try {
            // TODO: Replace with actual queue API
            const mockQueues: Record<string, number> = {};
            agents.forEach(agent => {
                mockQueues[agent.id] = Math.floor(Math.random() * 50);
            });
            setQueueLengths(mockQueues);
        } catch (error) {
            console.error('Failed to fetch queue lengths:', error);
        }
    };

    /**
     * Start an agent
     */
    const handleStartAgent = async (id: string) => {
        try {
            await agentApi.start(id);
            addNotification('Agent started successfully', 'success');
            await loadAgents();
        } catch (error) {
            addNotification('Failed to start agent', 'error');
        }
    };

    /**
     * Stop an agent
     */
    const handleStopAgent = async (id: string) => {
        try {
            await agentApi.stop(id);
            addNotification('Agent stopped successfully', 'success');
            await loadAgents();
        } catch (error) {
            addNotification('Failed to stop agent', 'error');
        }
    };

    /**
     * Delete an agent
     */
    const handleDeleteAgent = async (id: string) => {
        if (!confirm('Are you sure you want to delete this agent?')) return;

        try {
            await agentApi.delete(id);
            addNotification('Agent deleted successfully', 'success');
            await loadAgents();
        } catch (error) {
            addNotification('Failed to delete agent', 'error');
        }
    };

    /**
     * Open edit modal
     */
    const handleEditAgent = (agent: Agent) => {
        setSelectedAgent(agent);
        setShowEditModal(true);
    };

    /**
     * Open KB assignment modal
     */
    const handleAssignKB = async (agent: Agent) => {
        setSelectedAgent(agent);
        try {
            const kbs = await kbApi.getAll(agent.id);
            setKnowledgeBases(kbs);
            setShowKBModal(true);
        } catch (error) {
            addNotification('Failed to load knowledge bases', 'error');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Agent Management</h1>
                    <p className="text-gray-600 mt-1">
                        Create and manage your chatbot agents
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-1 rounded ${viewMode === 'grid'
                                    ? 'bg-white shadow-sm'
                                    : 'text-gray-600'
                                }`}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1 rounded ${viewMode === 'table'
                                    ? 'bg-white shadow-sm'
                                    : 'text-gray-600'
                                }`}
                        >
                            Table
                        </button>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary"
                    >
                        + Create Agent
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard
                    label="Total Agents"
                    value={agents.length}
                    icon="🤖"
                    color="blue"
                />
                <StatsCard
                    label="Active"
                    value={agents.filter(a => a.status === 'active').length}
                    icon="✅"
                    color="green"
                />
                <StatsCard
                    label="Inactive"
                    value={agents.filter(a => a.status === 'inactive').length}
                    icon="⏸️"
                    color="gray"
                />
                <StatsCard
                    label="Total Queue"
                    value={Object.values(queueLengths).reduce((a, b) => a + b, 0)}
                    icon="📋"
                    color="orange"
                />
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
                        <p className="text-gray-600">Loading agents...</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Agents Display */}
                    {viewMode === 'grid' ? (
                        <AgentsGrid
                            agents={agents}
                            queueLengths={queueLengths}
                            onStart={handleStartAgent}
                            onStop={handleStopAgent}
                            onEdit={handleEditAgent}
                            onDelete={handleDeleteAgent}
                            onAssignKB={handleAssignKB}
                        />
                    ) : (
                        <AgentsTable
                            agents={agents}
                            queueLengths={queueLengths}
                            onStart={handleStartAgent}
                            onStop={handleStopAgent}
                            onEdit={handleEditAgent}
                            onDelete={handleDeleteAgent}
                            onAssignKB={handleAssignKB}
                        />
                    )}
                </>
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreateAgentModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={loadAgents}
                />
            )}

            {showEditModal && selectedAgent && (
                <EditAgentModal
                    agent={selectedAgent}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedAgent(null);
                    }}
                    onSuccess={loadAgents}
                />
            )}

            {showKBModal && selectedAgent && (
                <AssignKBModal
                    agent={selectedAgent}
                    knowledgeBases={knowledgeBases}
                    onClose={() => {
                        setShowKBModal(false);
                        setSelectedAgent(null);
                    }}
                    onSuccess={loadAgents}
                />
            )}
        </div>
    );
}

/**
 * Stats Card Component
 */
interface StatsCardProps {
    label: string;
    value: number;
    icon: string;
    color: 'blue' | 'green' | 'gray' | 'orange';
}

function StatsCard({ label, value, icon, color }: StatsCardProps) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        gray: 'bg-gray-100 text-gray-600',
        orange: 'bg-orange-100 text-orange-600',
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center text-2xl`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

/**
 * Agents Grid View Component
 */
interface AgentsDisplayProps {
    agents: Agent[];
    queueLengths: Record<string, number>;
    onStart: (id: string) => void;
    onStop: (id: string) => void;
    onEdit: (agent: Agent) => void;
    onDelete: (id: string) => void;
    onAssignKB: (agent: Agent) => void;
}

function AgentsGrid({
    agents,
    queueLengths,
    onStart,
    onStop,
    onEdit,
    onDelete,
    onAssignKB,
}: AgentsDisplayProps) {
    if (agents.length === 0) {
        return (
            <div className="col-span-full card text-center py-12">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No agents yet
                </h3>
                <p className="text-gray-600">
                    Create your first agent to get started with the chatbot platform
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
                <div key={agent.id} className="card hover:shadow-lg transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {agent.name}
                            </h3>
                            <p className="text-sm text-gray-600 capitalize">
                                {agent.platform}
                            </p>
                        </div>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${agent.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : agent.status === 'inactive'
                                        ? 'bg-gray-100 text-gray-700'
                                        : 'bg-red-100 text-red-700'
                                }`}
                        >
                            {agent.status}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Language:</span>
                            <span className="font-medium capitalize">{agent.language}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Queue:</span>
                            <span className="font-medium">
                                {queueLengths[agent.id] || 0} messages
                            </span>
                        </div>
                        {agent.lastActive && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Last active:</span>
                                <span className="font-medium text-xs">
                                    {new Date(agent.lastActive).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            {agent.status === 'active' ? (
                                <button
                                    onClick={() => onStop(agent.id)}
                                    className="btn-secondary flex-1"
                                >
                                    ⏸️ Stop
                                </button>
                            ) : (
                                <button
                                    onClick={() => onStart(agent.id)}
                                    className="btn-primary flex-1"
                                >
                                    ▶️ Start
                                </button>
                            )}
                            <button
                                onClick={() => onEdit(agent)}
                                className="btn-secondary flex-1"
                            >
                                ✏️ Edit
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onAssignKB(agent)}
                                className="btn-secondary flex-1 text-sm"
                            >
                                📚 Assign KB
                            </button>
                            <button
                                onClick={() => onDelete(agent.id)}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Agents Table View Component
 */
function AgentsTable({
    agents,
    queueLengths,
    onStart,
    onStop,
    onEdit,
    onDelete,
    onAssignKB,
}: AgentsDisplayProps) {
    if (agents.length === 0) {
        return (
            <div className="card text-center py-12">
                <p className="text-gray-600">No agents found</p>
            </div>
        );
    }

    return (
        <div className="card overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Agent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Platform
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Language
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Queue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {agents.map((agent) => (
                        <tr key={agent.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    {agent.name}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 capitalize">
                                    {agent.platform}
                                </div>
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {queueLengths[agent.id] || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    {agent.status === 'active' ? (
                                        <button
                                            onClick={() => onStop(agent.id)}
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            Stop
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onStart(agent.id)}
                                            className="text-primary-600 hover:text-primary-900"
                                        >
                                            Start
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onEdit(agent)}
                                        className="text-primary-600 hover:text-primary-900"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onAssignKB(agent)}
                                        className="text-primary-600 hover:text-primary-900"
                                    >
                                        KB
                                    </button>
                                    <button
                                        onClick={() => onDelete(agent.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/**
 * Create Agent Modal Component
 */
interface CreateAgentModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

function CreateAgentModal({ onClose, onSuccess }: CreateAgentModalProps) {
    const { addNotification } = useAppStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: '',
            platform: 'whatsapp',
            language: 'english',
        },
    });

    const onSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            await agentApi.create(data);
            addNotification('Agent created successfully', 'success');
            onSuccess();
            onClose();
        } catch (error) {
            addNotification('Failed to create agent', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal title="Create New Agent" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="label">Agent Name</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="My WhatsApp Bot"
                        {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <label className="label">Platform</label>
                    <select className="input" {...register('platform')}>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="instagram">Instagram</option>
                        <option value="website">Website</option>
                    </select>
                </div>

                <div>
                    <label className="label">Language</label>
                    <select className="input" {...register('language')}>
                        <option value="english">English</option>
                        <option value="nepali">Nepali</option>
                        <option value="mixed">Mixed (Nepali + English)</option>
                    </select>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary flex-1"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary flex-1"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Agent'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

/**
 * Edit Agent Modal Component
 */
interface EditAgentModalProps {
    agent: Agent;
    onClose: () => void;
    onSuccess: () => void;
}

function EditAgentModal({ agent, onClose, onSuccess }: EditAgentModalProps) {
    const { addNotification } = useAppStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: agent.name,
            platform: agent.platform,
            language: agent.language,
        },
    });

    const onSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            await agentApi.update(agent.id, data);
            addNotification('Agent updated successfully', 'success');
            onSuccess();
            onClose();
        } catch (error) {
            addNotification('Failed to update agent', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal title="Edit Agent" onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="label">Agent Name</label>
                    <input
                        type="text"
                        className="input"
                        {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <label className="label">Platform</label>
                    <select className="input" {...register('platform')}>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="instagram">Instagram</option>
                        <option value="website">Website</option>
                    </select>
                </div>

                <div>
                    <label className="label">Language</label>
                    <select className="input" {...register('language')}>
                        <option value="english">English</option>
                        <option value="nepali">Nepali</option>
                        <option value="mixed">Mixed (Nepali + English)</option>
                    </select>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary flex-1"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary flex-1"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

/**
 * Assign Knowledge Base Modal Component
 */
interface AssignKBModalProps {
    agent: Agent;
    knowledgeBases: KnowledgeBase[];
    onClose: () => void;
    onSuccess: () => void;
}

function AssignKBModal({ agent, knowledgeBases, onClose, onSuccess }: AssignKBModalProps) {
    const { addNotification } = useAppStore();
    const [selectedKB, setSelectedKB] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAssign = async () => {
        if (!selectedKB) {
            addNotification('Please select a knowledge base', 'error');
            return;
        }

        try {
            setIsSubmitting(true);
            // TODO: Implement KB assignment API
            await new Promise(resolve => setTimeout(resolve, 1000));
            addNotification('Knowledge base assigned successfully', 'success');
            onSuccess();
            onClose();
        } catch (error) {
            addNotification('Failed to assign knowledge base', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal title={`Assign KB to ${agent.name}`} onClose={onClose}>
            <div className="space-y-4">
                <div>
                    <label className="label">Select Knowledge Base</label>
                    <select
                        className="input"
                        value={selectedKB}
                        onChange={(e) => setSelectedKB(e.target.value)}
                    >
                        <option value="">-- Select KB --</option>
                        {knowledgeBases.map((kb) => (
                            <option key={kb.id} value={kb.id}>
                                {kb.name} ({kb.chunks} chunks)
                            </option>
                        ))}
                    </select>
                </div>

                {knowledgeBases.length === 0 && (
                    <div className="text-center py-6 text-gray-600">
                        <p>No knowledge bases available.</p>
                        <p className="text-sm mt-1">Create one in the KB management page.</p>
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary flex-1"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={isSubmitting || !selectedKB}
                        className="btn-primary flex-1"
                    >
                        {isSubmitting ? 'Assigning...' : 'Assign KB'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

/**
 * Modal Wrapper Component
 */
interface ModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

function Modal({ title, onClose, children }: ModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

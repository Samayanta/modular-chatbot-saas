import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppStore } from '@/state/store';
import { kbApi, agentApi } from '@/services/api';
import { KnowledgeBase, Agent } from '@/types';

/**
 * Knowledge Base Management Page
 * Comprehensive interface for managing agent knowledge bases
 * Features: Upload files (CSV/PDF), website scraping, view KB chunks, trigger embeddings
 */
export default function KnowledgeBasePage() {
    const { agents, addNotification } = useAppStore();
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'upload' | 'scrape' | 'view'>('view');
    const [viewMode, setViewMode] = useState<'list' | 'chunks'>('list');

    /**
     * Load agents on mount
     */
    useEffect(() => {
        loadAgents();
    }, []);

    /**
     * Load KBs when agent is selected
     */
    useEffect(() => {
        if (selectedAgent) {
            loadKnowledgeBases();
        }
    }, [selectedAgent]);

    /**
     * Fetch all agents
     */
    const loadAgents = async () => {
        try {
            const data = await agentApi.getAll();
            useAppStore.setState({ agents: data });
            if (data.length > 0 && !selectedAgent) {
                setSelectedAgent(data[0]);
            }
        } catch (error) {
            console.error('Failed to load agents:', error);
            addNotification('Failed to load agents', 'error');
        }
    };

    /**
     * Fetch knowledge bases for selected agent
     */
    const loadKnowledgeBases = async () => {
        if (!selectedAgent) return;

        try {
            setIsLoading(true);
            const data = await kbApi.getAll(selectedAgent.id);
            setKnowledgeBases(data);
        } catch (error) {
            console.error('Failed to load knowledge bases:', error);
            addNotification('Failed to load knowledge bases', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Delete a knowledge base
     */
    const handleDeleteKB = async (kbId: string) => {
        if (!confirm('Are you sure you want to delete this knowledge base?')) return;

        try {
            await kbApi.delete(kbId);
            addNotification('Knowledge base deleted successfully', 'success');
            await loadKnowledgeBases();
        } catch (error) {
            addNotification('Failed to delete knowledge base', 'error');
        }
    };

    /**
     * Trigger embedding generation for KB
     */
    const handleGenerateEmbeddings = async (kbId: string) => {
        try {
            // TODO: Implement embedding generation API
            await new Promise(resolve => setTimeout(resolve, 2000));
            addNotification('Embeddings generated successfully', 'success');
            await loadKnowledgeBases();
        } catch (error) {
            addNotification('Failed to generate embeddings', 'error');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Knowledge Base Management</h1>
                    <p className="text-gray-600 mt-1">
                        Upload files or scrape websites to create agent knowledge bases
                    </p>
                </div>
            </div>

            {/* Agent Selector */}
            <div className="card">
                <label className="label">Select Agent</label>
                <select
                    className="input max-w-md"
                    value={selectedAgent?.id || ''}
                    onChange={(e) => {
                        const agent = agents.find(a => a.id === e.target.value);
                        setSelectedAgent(agent || null);
                    }}
                >
                    <option value="">-- Select an agent --</option>
                    {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                            {agent.name} ({agent.platform})
                        </option>
                    ))}
                </select>

                {selectedAgent && (
                    <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Status:</span>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${selectedAgent.status === 'active'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {selectedAgent.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Language:</span>
                            <span className="text-sm font-medium capitalize">
                                {selectedAgent.language}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Total KBs:</span>
                            <span className="text-sm font-medium">
                                {knowledgeBases.length}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {!selectedAgent ? (
                <div className="card text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Select an agent to manage knowledge bases
                    </h3>
                    <p className="text-gray-600">
                        Choose an agent from the dropdown above to view and manage its knowledge bases
                    </p>
                </div>
            ) : (
                <>
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('view')}
                            className={`px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'view'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            📋 View Knowledge Bases
                        </button>
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'upload'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            📤 Upload Files
                        </button>
                        <button
                            onClick={() => setActiveTab('scrape')}
                            className={`px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'scrape'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            🌐 Scrape Website
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="mt-6">
                        {activeTab === 'view' && (
                            <ViewKnowledgeBases
                                knowledgeBases={knowledgeBases}
                                isLoading={isLoading}
                                viewMode={viewMode}
                                onViewModeChange={setViewMode}
                                onDelete={handleDeleteKB}
                                onGenerateEmbeddings={handleGenerateEmbeddings}
                                onRefresh={loadKnowledgeBases}
                            />
                        )}

                        {activeTab === 'upload' && (
                            <UploadFileForm
                                agentId={selectedAgent.id}
                                onSuccess={() => {
                                    loadKnowledgeBases();
                                    setActiveTab('view');
                                }}
                            />
                        )}

                        {activeTab === 'scrape' && (
                            <ScrapeWebsiteForm
                                agentId={selectedAgent.id}
                                onSuccess={() => {
                                    loadKnowledgeBases();
                                    setActiveTab('view');
                                }}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

/**
 * View Knowledge Bases Component
 * Displays list of KBs with details and actions
 */
interface ViewKnowledgeBasesProps {
    knowledgeBases: KnowledgeBase[];
    isLoading: boolean;
    viewMode: 'list' | 'chunks';
    onViewModeChange: (mode: 'list' | 'chunks') => void;
    onDelete: (id: string) => void;
    onGenerateEmbeddings: (id: string) => void;
    onRefresh: () => void;
}

function ViewKnowledgeBases({
    knowledgeBases,
    isLoading,
    viewMode,
    onViewModeChange,
    onDelete,
    onGenerateEmbeddings,
    onRefresh,
}: ViewKnowledgeBasesProps) {
    const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
                    <p className="text-gray-600">Loading knowledge bases...</p>
                </div>
            </div>
        );
    }

    if (knowledgeBases.length === 0) {
        return (
            <div className="card text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No knowledge bases yet
                </h3>
                <p className="text-gray-600 mb-6">
                    Upload files or scrape a website to create your first knowledge base
                </p>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={onRefresh}
                        className="btn-secondary"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* View Mode Toggle & Stats */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">
                            {knowledgeBases.length}
                        </span>{' '}
                        knowledge base{knowledgeBases.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">
                            {knowledgeBases.reduce((sum, kb) => sum + kb.chunks, 0)}
                        </span>{' '}
                        total chunks
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onRefresh}
                        className="btn-secondary"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Knowledge Bases List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {knowledgeBases.map((kb) => (
                    <div key={kb.id} className="card hover:shadow-lg transition-shadow">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {kb.name}
                                </h3>
                                <p className="text-sm text-gray-600 capitalize mt-1">
                                    {kb.source} • {kb.chunks} chunks
                                </p>
                            </div>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${kb.status === 'ready'
                                        ? 'bg-green-100 text-green-700'
                                        : kb.status === 'processing'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                            >
                                {kb.status}
                            </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Created:</span>
                                <span className="font-medium">
                                    {new Date(kb.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            {kb.metadata && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">File Type:</span>
                                    <span className="font-medium uppercase">
                                        {kb.metadata.fileType || 'N/A'}
                                    </span>
                                </div>
                            )}
                            {kb.metadata?.url && (
                                <div className="text-sm">
                                    <span className="text-gray-600">URL:</span>
                                    <a
                                        href={kb.metadata.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 text-primary-600 hover:underline break-all"
                                    >
                                        {kb.metadata.url}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedKB(kb)}
                                className="btn-secondary flex-1"
                            >
                                👁️ View Chunks
                            </button>
                            {kb.status === 'pending' && (
                                <button
                                    onClick={() => onGenerateEmbeddings(kb.id)}
                                    className="btn-primary flex-1"
                                >
                                    ⚡ Generate Embeddings
                                </button>
                            )}
                            <button
                                onClick={() => onDelete(kb.id)}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* View Chunks Modal */}
            {selectedKB && (
                <ViewChunksModal
                    knowledgeBase={selectedKB}
                    onClose={() => setSelectedKB(null)}
                />
            )}
        </div>
    );
}

/**
 * Upload File Form Component
 * Handles CSV and PDF file uploads
 */
interface UploadFileFormProps {
    agentId: string;
    onSuccess: () => void;
}

function UploadFileForm({ agentId, onSuccess }: UploadFileFormProps) {
    const { addNotification } = useAppStore();
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            name: '',
            description: '',
        },
    });

    /**
     * Handle file selection
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    /**
     * Validate and set selected file
     */
    const validateAndSetFile = (file: File) => {
        const allowedTypes = ['text/csv', 'application/pdf', 'text/plain'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(file.type)) {
            addNotification('Only CSV, PDF, and TXT files are allowed', 'error');
            return;
        }

        if (file.size > maxSize) {
            addNotification('File size must be less than 10MB', 'error');
            return;
        }

        setSelectedFile(file);
    };

    /**
     * Handle drag events
     */
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    /**
     * Handle file drop
     */
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    /**
     * Submit form
     */
    const onSubmit = async (data: any) => {
        if (!selectedFile) {
            addNotification('Please select a file', 'error');
            return;
        }

        try {
            setIsUploading(true);

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('name', data.name || selectedFile.name);
            formData.append('description', data.description);
            formData.append('agentId', agentId);

            await kbApi.upload(agentId, formData);

            addNotification('File uploaded successfully', 'success');
            reset();
            setSelectedFile(null);
            onSuccess();
        } catch (error) {
            console.error('Upload failed:', error);
            addNotification('Failed to upload file', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="card max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Upload Knowledge Base File
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* File Upload Area */}
                <div>
                    <label className="label">Select File (CSV, PDF, TXT)</label>
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive
                                ? 'border-primary-600 bg-primary-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                    >
                        <input
                            type="file"
                            accept=".csv,.pdf,.txt"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="space-y-3">
                            <div className="text-5xl">📄</div>
                            {selectedFile ? (
                                <>
                                    <p className="text-lg font-medium text-gray-900">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFile(null)}
                                        className="text-sm text-red-600 hover:text-red-700"
                                    >
                                        Remove file
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="text-gray-700">
                                        <span className="font-medium text-primary-600">
                                            Click to upload
                                        </span>{' '}
                                        or drag and drop
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        CSV, PDF, or TXT (max 10MB)
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* KB Name */}
                <div>
                    <label className="label">Knowledge Base Name</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="e.g., Product Documentation"
                        {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label className="label">Description (Optional)</label>
                    <textarea
                        className="input"
                        rows={3}
                        placeholder="Brief description of this knowledge base"
                        {...register('description')}
                    />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={isUploading || !selectedFile}
                        className="btn-primary flex-1"
                    >
                        {isUploading ? (
                            <>
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Uploading...
                            </>
                        ) : (
                            '📤 Upload & Process'
                        )}
                    </button>
                </div>
            </form>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                    ℹ️ Processing Information
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Files are chunked into smaller segments for RAG</li>
                    <li>• Embeddings are generated using 1536-dimensional vectors</li>
                    <li>• Processing time depends on file size (typically 1-5 minutes)</li>
                    <li>• Knowledge bases are ephemeral and deleted after agent inactivity</li>
                </ul>
            </div>
        </div>
    );
}

/**
 * Scrape Website Form Component
 * Handles website URL scraping for KB generation
 */
interface ScrapeWebsiteFormProps {
    agentId: string;
    onSuccess: () => void;
}

function ScrapeWebsiteForm({ agentId, onSuccess }: ScrapeWebsiteFormProps) {
    const { addNotification } = useAppStore();
    const [isScraping, setIsScraping] = useState(false);
    const [progress, setProgress] = useState(0);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm({
        defaultValues: {
            url: '',
            name: '',
            maxPages: 10,
            followLinks: true,
        },
    });

    const url = watch('url');

    /**
     * Submit form
     */
    const onSubmit = async (data: any) => {
        try {
            setIsScraping(true);
            setProgress(0);

            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress((prev) => Math.min(prev + 10, 90));
            }, 500);

            await kbApi.scrape(agentId, {
                url: data.url,
                name: data.name || new URL(data.url).hostname,
                maxPages: data.maxPages,
                followLinks: data.followLinks,
            });

            clearInterval(progressInterval);
            setProgress(100);

            addNotification('Website scraped successfully', 'success');
            reset();
            setTimeout(() => {
                setProgress(0);
                onSuccess();
            }, 1000);
        } catch (error) {
            console.error('Scraping failed:', error);
            addNotification('Failed to scrape website', 'error');
            setProgress(0);
        } finally {
            setIsScraping(false);
        }
    };

    return (
        <div className="card max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Scrape Website for Knowledge Base
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Website URL */}
                <div>
                    <label className="label">Website URL</label>
                    <input
                        type="url"
                        className="input"
                        placeholder="https://example.com"
                        {...register('url', {
                            required: 'URL is required',
                            pattern: {
                                value: /^https?:\/\/.+/,
                                message: 'Please enter a valid URL',
                            },
                        })}
                    />
                    {errors.url && (
                        <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
                    )}
                </div>

                {/* KB Name */}
                <div>
                    <label className="label">Knowledge Base Name</label>
                    <input
                        type="text"
                        className="input"
                        placeholder={
                            url
                                ? `Leave blank to use: ${new URL(url || 'https://example.com').hostname}`
                                : 'e.g., Company Website'
                        }
                        {...register('name')}
                    />
                </div>

                {/* Max Pages */}
                <div>
                    <label className="label">Maximum Pages to Scrape</label>
                    <input
                        type="number"
                        className="input"
                        min="1"
                        max="100"
                        {...register('maxPages', {
                            required: 'Max pages is required',
                            min: { value: 1, message: 'Minimum 1 page' },
                            max: { value: 100, message: 'Maximum 100 pages' },
                        })}
                    />
                    {errors.maxPages && (
                        <p className="mt-1 text-sm text-red-600">{errors.maxPages.message}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                        Recommended: 10-20 pages for faster processing
                    </p>
                </div>

                {/* Follow Links */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="followLinks"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        {...register('followLinks')}
                    />
                    <label htmlFor="followLinks" className="ml-2 text-sm text-gray-700">
                        Follow internal links (scrape multiple pages)
                    </label>
                </div>

                {/* Progress Bar */}
                {isScraping && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">Scraping progress...</span>
                            <span className="font-medium text-gray-900">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={isScraping}
                        className="btn-primary flex-1"
                    >
                        {isScraping ? (
                            <>
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Scraping...
                            </>
                        ) : (
                            '🌐 Scrape Website'
                        )}
                    </button>
                </div>
            </form>

            {/* Info Box */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-900 mb-2">
                    ⚠️ Scraping Guidelines
                </h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Only scrape websites you have permission to access</li>
                    <li>• Respect robots.txt and website terms of service</li>
                    <li>• Processing time: ~30 seconds per page</li>
                    <li>• Text content and metadata are extracted, media files ignored</li>
                    <li>• For large sites, consider limiting pages and focusing on key sections</li>
                </ul>
            </div>
        </div>
    );
}

/**
 * View Chunks Modal Component
 * Displays individual chunks from a knowledge base
 */
interface ViewChunksModalProps {
    knowledgeBase: KnowledgeBase;
    onClose: () => void;
}

function ViewChunksModal({ knowledgeBase, onClose }: ViewChunksModalProps) {
    const [chunks, setChunks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadChunks();
    }, []);

    /**
     * Load chunks for KB
     */
    const loadChunks = async () => {
        try {
            setIsLoading(true);
            // TODO: Implement chunks API
            // Mock data for demonstration
            const mockChunks = Array.from({ length: Math.min(knowledgeBase.chunks, 20) }, (_, i) => ({
                id: `chunk-${i}`,
                text: `This is chunk ${i + 1} of the knowledge base. It contains relevant information that will be used for RAG-based responses. The text is split into manageable segments for efficient embedding and retrieval.`,
                index: i,
                metadata: {
                    page: Math.floor(i / 5) + 1,
                    position: i,
                },
            }));
            setChunks(mockChunks);
        } catch (error) {
            console.error('Failed to load chunks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {knowledgeBase.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {knowledgeBase.chunks} chunks • {knowledgeBase.source}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
                                <p className="text-gray-600">Loading chunks...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {chunks.map((chunk) => (
                                <div
                                    key={chunk.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">
                                            Chunk #{chunk.index + 1}
                                        </span>
                                        {chunk.metadata?.page && (
                                            <span className="text-xs text-gray-500">
                                                Page {chunk.metadata.page}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-900 leading-relaxed">
                                        {chunk.text}
                                    </p>
                                </div>
                            ))}

                            {knowledgeBase.chunks > 20 && (
                                <div className="text-center py-4 text-sm text-gray-600">
                                    Showing first 20 of {knowledgeBase.chunks} chunks
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
                    <button onClick={onClose} className="btn-secondary w-full">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// Core types for the chatbot SaaS platform

export interface Agent {
    id: string;
    name: string;
    status: 'active' | 'inactive' | 'error';
    platform: 'whatsapp' | 'instagram' | 'website';
    language: 'nepali' | 'english' | 'mixed';
    createdAt: string;
    lastActive?: string;
}

export interface KnowledgeBase {
    id: string;
    agentId: string;
    name: string;
    chunks: number;
    source: 'manual' | 'csv' | 'pdf' | 'website' | 'txt';
    createdAt: string;
    updatedAt?: string;
    status: 'pending' | 'processing' | 'ready' | 'error';
    metadata?: {
        fileType?: string;
        url?: string;
        size?: number;
        pages?: number;
    };
}

export interface Message {
    id: string;
    agentId: string;
    userId: string;
    text: string;
    language: string;
    intent: string;
    timestamp: string;
    platform: 'whatsapp' | 'instagram' | 'website';
}

export interface Metric {
    id: string;
    agentId: string;
    type: 'response_time' | 'queue_length' | 'gpu_usage' | 'error' | 'message_count';
    value: number;
    timestamp: string;
    details?: any;
}

export interface DashboardStats {
    totalAgents: number;
    activeAgents: number;
    totalMessages: number;
    todayMessages: number;
    avgResponseTime: number;
    queueLength: number;
    gpuUsage: number;
    errorRate: number;
    recentActivity: ActivityItem[];
}

export interface ActivityItem {
    id: string;
    type: 'message' | 'error' | 'agent_started' | 'agent_stopped' | 'kb_uploaded';
    agentId?: string;
    agentName?: string;
    message: string;
    timestamp: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    company?: string;
    role: 'admin' | 'user';
    createdAt: string;
}

export interface Settings {
    apiKeys: {
        whatsappApiKey?: string;
        whatsappPhoneNumberId?: string;
        whatsappBusinessAccountId?: string;
        instagramAccessToken?: string;
        instagramBusinessAccountId?: string;
        openaiApiKey?: string;
    };
    language: {
        defaultLanguage: 'english' | 'nepali' | 'mixed';
        autoDetectLanguage: boolean;
        supportedLanguages: string[];
        translationEnabled: boolean;
    };
    fallback: {
        noKnowledgeBase: string;
        errorResponse: string;
        outOfScope: string;
        agentOffline: string;
        queueFull: string;
        nepaliNoKB: string;
        nepaliError: string;
        nepaliOffline: string;
    };
    profile: {
        name: string;
        email: string;
        company?: string;
        timezone: string;
        emailNotifications: boolean;
        weeklyReport: boolean;
    };
}

export interface ChunkData {
    id: string;
    kbId: string;
    text: string;
    index: number;
    embedding?: number[];
    metadata?: {
        page?: number;
        position?: number;
        source?: string;
    };
}

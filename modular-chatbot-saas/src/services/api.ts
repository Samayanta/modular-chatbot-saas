import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class ApiService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor
        this.client.interceptors.request.use(
            (config) => {
                // Add auth token if available
                const token = localStorage.getItem('auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Handle unauthorized - redirect to login
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }
}

export const apiService = new ApiService();

// Specific API endpoints
export const agentApi = {
    getAll: () => apiService.get<any[]>('/api/agents'),
    getById: (id: string) => apiService.get<any>(`/api/agents/${id}`),
    create: (data: any) => apiService.post<any>('/api/agents', data),
    update: (id: string, data: any) => apiService.put<any>(`/api/agents/${id}`, data),
    delete: (id: string) => apiService.delete<any>(`/api/agents/${id}`),
    start: (id: string) => apiService.post<any>(`/api/agents/${id}/start`),
    stop: (id: string) => apiService.post<any>(`/api/agents/${id}/stop`),
};

export const kbApi = {
    getAll: (agentId: string) => apiService.get<any[]>(`/api/agents/${agentId}/kb`),
    getById: (kbId: string) => apiService.get<any>(`/api/kb/${kbId}`),
    upload: (agentId: string, data: FormData) =>
        apiService.post<any>(`/api/agents/${agentId}/kb/upload`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    scrape: (agentId: string, data: { url: string; name: string; maxPages: number; followLinks: boolean }) =>
        apiService.post<any>(`/api/agents/${agentId}/kb/scrape`, data),
    delete: (kbId: string) => apiService.delete<any>(`/api/kb/${kbId}`),
    generateEmbeddings: (kbId: string) => apiService.post<any>(`/api/kb/${kbId}/embeddings`),
    getChunks: (kbId: string, page?: number, limit?: number) =>
        apiService.get<any>(`/api/kb/${kbId}/chunks?page=${page || 1}&limit=${limit || 20}`),
};

export const analyticsApi = {
    getDashboard: () => apiService.get<any>('/api/analytics/dashboard'),
    getAgentMetrics: (agentId: string, type?: string) =>
        apiService.get<any[]>(`/api/analytics/agents/${agentId}?type=${type || ''}`),
    getMetrics: (params?: { agentId?: string; type?: string; startDate?: string; endDate?: string }) =>
        apiService.get<any[]>(`/api/analytics/metrics`, { params }),
};

export const authApi = {
    login: (email: string, password: string) =>
        apiService.post<{ token: string; user: any }>('/api/auth/login', { email, password }),
    signup: (data: { name: string; email: string; password: string; company?: string }) =>
        apiService.post<{ token: string; user: any }>('/api/auth/signup', data),
    logout: () => apiService.post<void>('/api/auth/logout'),
    getCurrentUser: () => apiService.get<any>('/api/auth/me'),
    refreshToken: () => apiService.post<{ token: string }>('/api/auth/refresh'),
};

export const settingsApi = {
    get: () => apiService.get<any>('/api/settings'),
    update: (data: any) => apiService.put<any>('/api/settings', data),
    updateApiKeys: (data: any) => apiService.put<any>('/api/settings/api-keys', data),
    updateLanguage: (data: any) => apiService.put<any>('/api/settings/language', data),
    updateFallback: (data: any) => apiService.put<any>('/api/settings/fallback', data),
    updateProfile: (data: any) => apiService.put<any>('/api/settings/profile', data),
};

export const widgetApi = {
    getConfig: (agentId: string) => apiService.get<any>(`/api/widget/${agentId}/config`),
    updateConfig: (agentId: string, config: any) =>
        apiService.put<any>(`/api/widget/${agentId}/config`, config),
    sendMessage: (agentId: string, message: string) =>
        apiService.post<any>(`/api/widget/${agentId}/message`, { message }),
};

// Message Intake API (for testing message flow)
export const messageApi = {
    send: (data: { agentId: string; platform: string; userId: string; message: string; timestamp?: string }) =>
        apiService.post<any>('/intake', data),
};

/**
 * Mock WebSocket implementation for testing real-time updates
 */

export interface MockWebSocketMessage {
    type: 'agent_update' | 'queue_update' | 'gpu_update' | 'message_processed';
    data: any;
}

export class MockWebSocketServer {
    private connections: MockWebSocket[] = [];

    /**
     * Broadcast message to all connected clients
     */
    broadcast(message: MockWebSocketMessage) {
        this.connections.forEach(conn => {
            if (conn.readyState === MockWebSocket.OPEN && conn.onmessage) {
                conn.onmessage({
                    data: JSON.stringify(message),
                    type: 'message',
                } as MessageEvent);
            }
        });
    }

    /**
     * Send message to specific client
     */
    sendToClient(clientIndex: number, message: MockWebSocketMessage) {
        const conn = this.connections[clientIndex];
        if (conn && conn.readyState === MockWebSocket.OPEN && conn.onmessage) {
            conn.onmessage({
                data: JSON.stringify(message),
                type: 'message',
            } as MessageEvent);
        }
    }

    /**
     * Register a new connection
     */
    registerConnection(connection: MockWebSocket) {
        this.connections.push(connection);
    }

    /**
     * Disconnect all clients
     */
    disconnectAll() {
        this.connections.forEach(conn => conn.close());
        this.connections = [];
    }

    /**
     * Get number of active connections
     */
    getConnectionCount() {
        return this.connections.filter(c => c.readyState === MockWebSocket.OPEN).length;
    }
}

export class MockWebSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    url: string;
    readyState: number = MockWebSocket.CONNECTING;
    onopen: ((event: Event) => void) | null = null;
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    onclose: ((event: CloseEvent) => void) | null = null;

    private server: MockWebSocketServer | null = null;

    constructor(url: string, server?: MockWebSocketServer) {
        this.url = url;
        this.server = server || null;

        // Simulate async connection
        setTimeout(() => {
            this.readyState = MockWebSocket.OPEN;
            if (this.server) {
                this.server.registerConnection(this);
            }
            if (this.onopen) {
                this.onopen(new Event('open'));
            }
        }, 0);
    }

    /**
     * Send message to server (mocked - does nothing)
     */
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
        if (this.readyState !== MockWebSocket.OPEN) {
            throw new Error('WebSocket is not open');
        }
        // In tests, we don't actually send to a server
        // The test can manually trigger onmessage to simulate responses
    }

    /**
     * Close the WebSocket connection
     */
    close(code?: number, reason?: string) {
        if (this.readyState === MockWebSocket.CLOSED || this.readyState === MockWebSocket.CLOSING) {
            return;
        }

        this.readyState = MockWebSocket.CLOSING;

        setTimeout(() => {
            this.readyState = MockWebSocket.CLOSED;
            if (this.onclose) {
                this.onclose(new CloseEvent('close', { code, reason }));
            }
        }, 0);
    }

    /**
     * Helper method for tests to simulate receiving a message
     */
    simulateMessage(data: MockWebSocketMessage) {
        if (this.onmessage && this.readyState === MockWebSocket.OPEN) {
            this.onmessage({
                data: JSON.stringify(data),
                type: 'message',
            } as MessageEvent);
        }
    }

    /**
     * Helper method for tests to simulate an error
     */
    simulateError(error?: string) {
        if (this.onerror) {
            this.onerror(new Event('error'));
        }
    }

    /**
     * Helper method for tests to simulate disconnect
     */
    simulateDisconnect(code = 1000, reason = 'Normal closure') {
        this.close(code, reason);
    }
}

/**
 * Factory to create mock WebSocket with server
 */
export const createMockWebSocketWithServer = () => {
    const server = new MockWebSocketServer();

    const MockWSWithServer = class extends MockWebSocket {
        constructor(url: string) {
            super(url, server);
        }
    };

    return { MockWSWithServer, server };
};

/**
 * Mock WebSocket data generators for testing
 */
export const mockWebSocketData = {
    /**
     * Agent status update
     */
    agentUpdate: (agentId: string, status: 'active' | 'inactive') => ({
        type: 'agent_update' as const,
        data: {
            agentId,
            status,
            timestamp: new Date().toISOString(),
        },
    }),

    /**
     * Queue length update
     */
    queueUpdate: (agentId: string, queueLength: number) => ({
        type: 'queue_update' as const,
        data: {
            agentId,
            queueLength,
            timestamp: new Date().toISOString(),
        },
    }),

    /**
     * GPU usage update
     */
    gpuUpdate: (usage: number) => ({
        type: 'gpu_update' as const,
        data: {
            usage,
            timestamp: new Date().toISOString(),
        },
    }),

    /**
     * Message processed event
     */
    messageProcessed: (agentId: string, messageId: string, responseTime: number) => ({
        type: 'message_processed' as const,
        data: {
            agentId,
            messageId,
            responseTime,
            timestamp: new Date().toISOString(),
        },
    }),
};

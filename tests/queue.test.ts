import { addMessage, createWorker, getQueue } from '../queue';
import { Queue, Worker } from 'bullmq';

const mockAdd = jest.fn();
const mockOn = jest.fn();

// Mock BullMQ
jest.mock('bullmq', () => {
    return {
        Queue: jest.fn().mockImplementation(() => ({
            add: mockAdd,
        })),
        Worker: jest.fn().mockImplementation(() => ({
            on: mockOn,
        })),
    };
});

describe('Queue Module', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should add a message to the queue', async () => {
        const agentId = 'agent-test';
        const message = {
            agent_id: agentId,
            user_id: 'user-1',
            text: 'Test message',
            timestamp: new Date().toISOString(),
        };

        await addMessage(agentId, message);

        // Check if Queue was instantiated
        expect(Queue).toHaveBeenCalledWith(`agent-queue-${agentId}`, expect.any(Object));

        // Check if add was called
        expect(mockAdd).toHaveBeenCalledWith('chat-message', message, expect.any(Object));
    });

    it('should create a worker', () => {
        const agentId = 'agent-test';
        const processor = jest.fn();

        createWorker(agentId, processor);

        expect(Worker).toHaveBeenCalledWith(`agent-queue-${agentId}`, processor, expect.any(Object));
    });
});

import request from 'supertest';
import { app } from '../server';
import * as queue from '../queue';

// Mock the queue module
jest.mock('../queue', () => ({
    addMessage: jest.fn(),
    createWorker: jest.fn(),
}));

describe('Intake Module', () => {
    it('should accept a valid message', async () => {
        const payload = {
            agent_id: 'agent-1',
            user_id: 'user-1',
            text: 'Hello',
            timestamp: new Date().toISOString(),
        };

        const res = await request(app).post('/intake').send(payload);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', 'queued');
        expect(queue.addMessage).toHaveBeenCalled();
    });

    it('should reject a message with missing fields', async () => {
        const payload = {
            agent_id: 'agent-1',
            // Missing user_id
            text: 'Hello',
            timestamp: new Date().toISOString(),
        };

        const res = await request(app).post('/intake').send(payload);
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });
});

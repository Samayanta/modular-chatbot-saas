import { processMessage } from '../llm_worker';
import { Job } from 'bullmq';

describe('LLM Worker Module', () => {
    it('should process a message and return a response', async () => {
        const mockJob = {
            data: {
                agent_id: 'agent-1',
                user_id: 'user-1',
                text: 'Hello',
                timestamp: new Date().toISOString(),
            },
        } as Job;

        const result = await processMessage(mockJob);

        expect(result).not.toBeNull();
        expect(result?.language).toBe('English');
        expect(result?.intent).toBe('general_chat');
        expect(result?.response).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
        const mockJob = {
            data: {
                // Missing agent_id to trigger error if accessed
            },
        } as unknown as Job;

        const result = await processMessage(mockJob);
        expect(result).toBeNull();
    });
});

import { processMessage } from './llm_worker/index';
import { NormalizedMessage } from './queue/index';
import { Job } from 'bullmq';

// Mock Job object
const mockJob = {
    id: 'mock-job-1',
    data: {
        agent_id: 'agent-123',
        user_id: 'user-456',
        text: 'What are your business hours?',
        timestamp: new Date().toISOString(),
    } as NormalizedMessage,
} as Job<NormalizedMessage>;

async function runTest() {
    console.log('Starting LLM Worker Logic Test...');

    await processMessage(mockJob);

    console.log('Test finished.');
}

runTest().catch(console.error);

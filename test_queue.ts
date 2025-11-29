import { addMessage, createWorker, NormalizedMessage } from './queue/index';

const TEST_AGENT_ID = 'test-agent-123';

const testMessage: NormalizedMessage = {
    agent_id: TEST_AGENT_ID,
    user_id: 'user-456',
    text: 'Hello from queue test',
    timestamp: new Date().toISOString(),
};

async function runTest() {
    console.log('Starting Queue Test...');

    // 1. Create a worker
    const worker = createWorker(TEST_AGENT_ID, async (job) => {
        console.log('---------------------------------------------------');
        console.log(`[Test Worker] Processing job ${job.id}`);
        console.log(`[Test Worker] Data:`, job.data);
        console.log('---------------------------------------------------');
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));
    });

    // 2. Add a message
    await addMessage(TEST_AGENT_ID, testMessage);

    // 3. Wait for processing (simple timeout for test)
    setTimeout(async () => {
        console.log('Test finished. Closing worker...');
        await worker.close();
        process.exit(0);
    }, 3000);
}

runTest().catch(console.error);

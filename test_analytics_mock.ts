import { initAnalyticsDB, logMetric, getAgentMetrics, setPool } from './analytics/index';

// Mock Pool and Client
const mockQuery = (query: string, params?: any[]) => {
    console.log(`[MockDB] Query: ${query.trim().split('\n')[0]}... Params: ${JSON.stringify(params)}`);
    if (query.includes('SELECT * FROM analytics_metrics')) {
        return Promise.resolve({ rows: [{ metric_type: 'response_time', value: 100 }] });
    }
    return Promise.resolve({ rows: [] });
};

const mockClient = {
    query: mockQuery,
    release: () => console.log('[MockDB] Client released'),
};

const mockPool = {
    connect: () => Promise.resolve(mockClient),
};

async function runTest() {
    console.log('Starting Analytics Module Test (Mocked)...');

    // Inject mock pool
    setPool(mockPool);

    // 1. Test initAnalyticsDB
    console.log('\n--- Testing initAnalyticsDB ---');
    await initAnalyticsDB();

    // 2. Test logMetric
    console.log('\n--- Testing logMetric ---');
    const agentId = 'test-agent';
    await logMetric(agentId, 'response_time', 150, { request_id: 'req-1' });

    // 3. Test getAgentMetrics
    console.log('\n--- Testing getAgentMetrics ---');
    const metrics = await getAgentMetrics(agentId, 'response_time');
    console.log('Retrieved Metrics:', metrics);

    console.log('\nTest finished successfully.');
}

runTest().catch(console.error);

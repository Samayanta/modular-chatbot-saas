import { initVectorDB, loadKB, retrieveTopK, deleteKB, setPool, KBChunk } from './vector/index';

// Mock Pool and Client
const mockQuery = (query: string, params?: any[]) => {
    console.log(`[MockDB] Query: ${query.trim().split('\n')[0]}... Params: ${JSON.stringify(params)}`);
    if (query.includes('SELECT content')) {
        return Promise.resolve({ rows: [{ content: 'Mocked Result' }] });
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
    console.log('Starting Vector Module Test (Mocked)...');

    // Inject mock pool
    setPool(mockPool);

    // 1. Test initVectorDB
    console.log('\n--- Testing initVectorDB ---');
    await initVectorDB();

    // 2. Test loadKB
    console.log('\n--- Testing loadKB ---');
    const agentId = 'test-agent';
    const chunks: KBChunk[] = [
        { content: 'Chunk 1', embedding: new Array(1536).fill(0.1) },
    ];
    await loadKB(agentId, chunks);

    // 3. Test retrieveTopK
    console.log('\n--- Testing retrieveTopK ---');
    const results = await retrieveTopK(agentId, new Array(1536).fill(0.1));
    console.log('Retrieved Results:', results);

    // 4. Test deleteKB
    console.log('\n--- Testing deleteKB ---');
    await deleteKB(agentId);

    console.log('\nTest finished successfully.');
}

runTest().catch(console.error);

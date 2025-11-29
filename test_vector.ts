import { initVectorDB, loadKB, retrieveTopK, deleteKB, KBChunk } from './vector/index';

// Mock pg to avoid needing a real DB connection for this test
jest.mock('pg', () => {
    const mClient = {
        query: jest.fn(),
        release: jest.fn(),
    };
    const mPool = {
        connect: jest.fn(() => Promise.resolve(mClient)),
        on: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

// We need to access the mocked pool to assert calls
const { Pool } = require('pg');

async function runTest() {
    console.log('Starting Vector Module Test (Mocked)...');

    const pool = new Pool();
    const client = await pool.connect();

    // 1. Test initVectorDB
    console.log('Testing initVectorDB...');
    await initVectorDB();
    expect(client.query).toHaveBeenCalledWith('CREATE EXTENSION IF NOT EXISTS vector');
    expect(client.query).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS agent_embeddings'));

    // 2. Test loadKB
    console.log('Testing loadKB...');
    const agentId = 'test-agent';
    const chunks: KBChunk[] = [
        { content: 'Chunk 1', embedding: new Array(1536).fill(0.1) },
        { content: 'Chunk 2', embedding: new Array(1536).fill(0.2) },
    ];
    await loadKB(agentId, chunks);
    expect(client.query).toHaveBeenCalledWith('BEGIN');
    expect(client.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO agent_embeddings'), expect.any(Array));
    expect(client.query).toHaveBeenCalledWith('COMMIT');

    // 3. Test retrieveTopK
    console.log('Testing retrieveTopK...');
    // Mock return value for retrieveTopK
    client.query.mockResolvedValueOnce({ rows: [{ content: 'Chunk 1' }] });
    const results = await retrieveTopK(agentId, new Array(1536).fill(0.1));
    expect(client.query).toHaveBeenCalledWith(expect.stringContaining('SELECT content'), expect.any(Array));
    console.log('Retrieved:', results);

    // 4. Test deleteKB
    console.log('Testing deleteKB...');
    await deleteKB(agentId);
    expect(client.query).toHaveBeenCalledWith('DELETE FROM agent_embeddings WHERE agent_id = $1', [agentId]);

    console.log('Test finished successfully.');
}

// Simple expect helper since we aren't running inside full Jest environment
function expect(actual: any) {
    return {
        toHaveBeenCalledWith: (...args: any[]) => {
            const calls = actual.mock.calls;
            const matched = calls.some((call: any[]) => {
                return args.every((arg, i) => {
                    if (arg && arg.asymmetricMatch) return arg.asymmetricMatch(call[i]);
                    if (typeof arg === 'string' && typeof call[i] === 'string') return call[i].includes(arg); // Loose string match
                    return JSON.stringify(arg) === JSON.stringify(call[i]);
                });
            });
            if (!matched) {
                console.error('Expected call with:', args);
                console.error('Actual calls:', calls);
                throw new Error('Expectation failed');
            }
        },
        stringContaining: (str: string) => ({
            asymmetricMatch: (actualStr: string) => actualStr.includes(str)
        }),
        any: (cls: any) => ({
            asymmetricMatch: (actual: any) => actual.constructor === cls
        })
    };
}

// Simple mock setup for standalone run
const jest = {
    fn: (impl?: Function) => {
        const mock: any = impl ? (...args: any[]) => impl(...args) : () => { };
        mock.mock = { calls: [] };
        mock.mockResolvedValueOnce = (val: any) => {
            mock.mockImplementationOnce(() => Promise.resolve(val));
        };
        mock.mockImplementationOnce = (impl: Function) => {
            const original = mock;
            const newMock: any = (...args: any[]) => {
                mock.mock.calls.push(args);
                return impl(...args);
            };
            // Restore original after one call (simplified)
            return newMock;
        };

        // Wrap to capture calls
        const wrapper: any = (...args: any[]) => {
            wrapper.mock.calls.push(args);
            return mock(...args);
        };
        wrapper.mock = { calls: [] };
        wrapper.mockResolvedValueOnce = (val: any) => {
            // This is getting complicated to implement a full mock framework from scratch.
            // Let's rely on the fact that we can just spy on the real object if we wanted, 
            // but since we are mocking the module require, we need a better approach for a standalone script.
            // 
            // ALTERNATIVE: Just create a script that uses a fake pool object injected via dependency injection 
            // or just trust the code structure and verify syntax.
            // 
            // Let's try to make the test script simpler by NOT using jest.mock which requires a test runner,
            // but instead manually mocking the Pool class by overriding the import or using a different technique.
            //
            // Actually, since I can't easily override 'pg' import in a standalone ts-node script without a lot of hacks,
            // I will modify the vector/index.ts to accept a pool or client for testing, OR I will just write a test 
            // that assumes a DB connection fails and handles it, OR I will just verify the code compiles.
            //
            // Better yet, I will create a `test_vector_mock.ts` that defines a MockPool and passes it to the functions
            // if I refactor `vector/index.ts` to export the pool or allow injection.
            //
            // Let's refactor `vector/index.ts` slightly to allow dependency injection for easier testing.
            return Promise.resolve(val);
        };
        return wrapper;
    },
    mock: (moduleName: string, factory: Function) => {
        // This doesn't work in standalone script
    }
};

// RE-STRATEGY: 
// 1. Refactor `vector/index.ts` to export a `setPool` function or similar.
// 2. Create `test_vector.ts` that sets a mock pool.
// 3. Run `test_vector.ts`.

runTest().catch(console.error);

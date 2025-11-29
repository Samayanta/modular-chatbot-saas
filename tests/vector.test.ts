import { initVectorDB, loadKB, retrieveTopK, deleteKB } from '../vector';
import { Pool } from 'pg';

// Mock pg
jest.mock('pg', () => {
    const mPool = {
        connect: jest.fn(),
        query: jest.fn(),
        release: jest.fn(),
    };
    return {
        Pool: jest.fn(() => mPool),
    };
});

describe('Vector Module', () => {
    let pool: any;
    let client: any;

    beforeEach(() => {
        pool = new Pool();
        client = {
            query: jest.fn(),
            release: jest.fn(),
        };
        pool.connect.mockResolvedValue(client);
        jest.clearAllMocks();
    });

    it('should initialize the vector DB', async () => {
        await initVectorDB();
        expect(pool.connect).toHaveBeenCalled();
        expect(client.query).toHaveBeenCalledTimes(3); // Extension, Table, Index
        expect(client.release).toHaveBeenCalled();
    });

    it('should load KB chunks', async () => {
        const chunks = [{ content: 'test', embedding: [0.1, 0.2] }];
        await loadKB('agent-1', chunks);
        expect(client.query).toHaveBeenCalledWith('BEGIN');
        expect(client.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO'), expect.any(Array));
        expect(client.query).toHaveBeenCalledWith('COMMIT');
        expect(client.release).toHaveBeenCalled();
    });

    it('should retrieve top K chunks', async () => {
        client.query.mockResolvedValue({ rows: [{ content: 'result' }] });
        const results = await retrieveTopK('agent-1', [0.1, 0.2], 1);
        expect(client.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'), expect.any(Array));
        expect(results).toEqual(['result']);
    });

    it('should delete KB', async () => {
        await deleteKB('agent-1');
        expect(client.query).toHaveBeenCalledWith(expect.stringContaining('DELETE'), ['agent-1']);
    });
});

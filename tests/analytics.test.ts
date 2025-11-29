import { initAnalyticsDB, logMetric, getAgentMetrics } from '../analytics';
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

describe('Analytics Module', () => {
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

    it('should initialize the analytics DB', async () => {
        await initAnalyticsDB();
        expect(pool.connect).toHaveBeenCalled();
        expect(client.query).toHaveBeenCalledTimes(3); // Table, Index1, Index2
        expect(client.release).toHaveBeenCalled();
    });

    it('should log a metric', async () => {
        await logMetric('agent-1', 'response_time', 100);
        expect(client.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO'), expect.any(Array));
        expect(client.release).toHaveBeenCalled();
    });

    it('should retrieve agent metrics', async () => {
        const mockRows = [{ metric_type: 'response_time', value: 100 }];
        client.query.mockResolvedValue({ rows: mockRows });

        const metrics = await getAgentMetrics('agent-1', 'response_time');
        expect(client.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'), expect.any(Array));
        expect(metrics).toEqual(mockRows);
    });
});

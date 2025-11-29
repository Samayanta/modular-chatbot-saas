import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Postgres connection pool
let pool = new Pool({
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432'),
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    database: process.env.PG_DATABASE || 'postgres',
});

// Allow injection for testing
export const setPool = (newPool: any) => {
    (pool as any) = newPool;
};

export type MetricType = 'response_time' | 'queue_length' | 'gpu_usage' | 'error' | 'message_count';

export interface MetricLog {
    id?: number;
    agent_id: string;
    metric_type: MetricType;
    value: number;
    details?: any;
    timestamp?: Date;
}

/**
 * Initialize the analytics database.
 * Creates the analytics_metrics table if it doesn't exist.
 */
export const initAnalyticsDB = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
      CREATE TABLE IF NOT EXISTS analytics_metrics (
        id SERIAL PRIMARY KEY,
        agent_id TEXT NOT NULL,
        metric_type TEXT NOT NULL,
        value NUMERIC,
        details JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_agent_id ON analytics_metrics(agent_id)
    `);

        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_metrics(timestamp)
    `);

        console.log('[AnalyticsDB] Initialized successfully');
    } catch (error) {
        console.error('[AnalyticsDB] Initialization failed:', error);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Log a metric to the database.
 */
export const logMetric = async (agentId: string, type: MetricType, value: number, details?: any) => {
    const client = await pool.connect();
    try {
        const query = `
      INSERT INTO analytics_metrics (agent_id, metric_type, value, details)
      VALUES ($1, $2, $3, $4)
    `;
        await client.query(query, [agentId, type, value, details ? JSON.stringify(details) : null]);
        console.log(`[AnalyticsDB] Logged metric ${type} for agent ${agentId}`);
    } catch (error) {
        console.error(`[AnalyticsDB] Failed to log metric for agent ${agentId}:`, error);
        // Don't throw here to avoid disrupting the main flow
    } finally {
        client.release();
    }
};

/**
 * Retrieve recent metrics for a specific agent.
 */
export const getAgentMetrics = async (agentId: string, type?: MetricType, limit: number = 50): Promise<MetricLog[]> => {
    const client = await pool.connect();
    try {
        let query = `
      SELECT * FROM analytics_metrics
      WHERE agent_id = $1
    `;
        const params: any[] = [agentId];

        if (type) {
            query += ` AND metric_type = $2`;
            params.push(type);
        }

        query += ` ORDER BY timestamp DESC LIMIT $${params.length + 1}`;
        params.push(limit);

        const res = await client.query(query, params);
        return res.rows;
    } catch (error) {
        console.error(`[AnalyticsDB] Failed to retrieve metrics for agent ${agentId}:`, error);
        return [];
    } finally {
        client.release();
    }
};

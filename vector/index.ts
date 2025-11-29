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

export interface KBChunk {
    content: string;
    embedding: number[];
}

/**
 * Initialize the vector database.
 * Enables the pgvector extension and creates the agent_embeddings table.
 */
export const initVectorDB = async () => {
    const client = await pool.connect();
    try {
        // Enable pgvector extension
        await client.query('CREATE EXTENSION IF NOT EXISTS vector');

        // Create table
        await client.query(`
      CREATE TABLE IF NOT EXISTS agent_embeddings (
        id SERIAL PRIMARY KEY,
        agent_id TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding vector(1536)
      )
    `);

        // Create index for faster retrieval by agent_id
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_embeddings_agent_id ON agent_embeddings(agent_id)
    `);

        // Create HNSW index for vector similarity search (optional, but good for performance)
        // await client.query(`
        //   CREATE INDEX IF NOT EXISTS idx_agent_embeddings_embedding ON agent_embeddings 
        //   USING hnsw (embedding vector_cosine_ops)
        // `);

        console.log('[VectorDB] Initialized successfully');
    } catch (error) {
        console.error('[VectorDB] Initialization failed:', error);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Load Knowledge Base chunks for a specific agent.
 * This is typically called at the start of a session.
 */
export const loadKB = async (agentId: string, chunks: KBChunk[]) => {
    const client = await pool.connect();
    try {
        // Use a transaction for bulk insert
        await client.query('BEGIN');

        const insertQuery = `
      INSERT INTO agent_embeddings (agent_id, content, embedding)
      VALUES ($1, $2, $3)
    `;

        for (const chunk of chunks) {
            // Format embedding array as a string for pgvector: "[0.1, 0.2, ...]"
            const embeddingStr = `[${chunk.embedding.join(',')}]`;
            await client.query(insertQuery, [agentId, chunk.content, embeddingStr]);
        }

        await client.query('COMMIT');
        console.log(`[VectorDB] Loaded ${chunks.length} chunks for agent ${agentId}`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`[VectorDB] Failed to load KB for agent ${agentId}:`, error);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Retrieve top K most similar chunks for a given query embedding.
 * Uses Cosine Distance (<=>) operator provided by pgvector.
 */
export const retrieveTopK = async (agentId: string, queryEmbedding: number[], k: number = 3): Promise<string[]> => {
    const client = await pool.connect();
    try {
        const embeddingStr = `[${queryEmbedding.join(',')}]`;

        // Select content, order by cosine distance
        const query = `
      SELECT content
      FROM agent_embeddings
      WHERE agent_id = $1
      ORDER BY embedding <=> $2
      LIMIT $3
    `;

        const res = await client.query(query, [agentId, embeddingStr, k]);
        return res.rows.map((row: any) => row.content);
    } catch (error) {
        console.error(`[VectorDB] Failed to retrieve chunks for agent ${agentId}:`, error);
        return [];
    } finally {
        client.release();
    }
};

/**
 * Delete Knowledge Base for a specific agent.
 * Called after session inactivity to keep the DB ephemeral.
 */
export const deleteKB = async (agentId: string) => {
    const client = await pool.connect();
    try {
        await client.query('DELETE FROM agent_embeddings WHERE agent_id = $1', [agentId]);
        console.log(`[VectorDB] Deleted KB for agent ${agentId}`);
    } catch (error) {
        console.error(`[VectorDB] Failed to delete KB for agent ${agentId}:`, error);
        throw error;
    } finally {
        client.release();
    }
};

import { Queue, Worker, Job, ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Redis connection details
const redisOptions: ConnectionOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

// Interface for the normalized message (should match Intake module)
export interface NormalizedMessage {
    agent_id: string;
    user_id: string;
    text: string;
    media?: string[];
    timestamp: string;
}

// Map to store active queues per agent to avoid recreating them
const agentQueues = new Map<string, Queue>();

/**
 * Get or create a queue for a specific agent.
 * Each agent has its own queue to ensure isolation and independent scaling/rate limiting.
 */
export const getQueue = (agentId: string): Queue => {
    if (!agentQueues.has(agentId)) {
        const queueName = `agent-queue-${agentId}`;
        const queue = new Queue(queueName, { connection: redisOptions });
        agentQueues.set(agentId, queue);
        console.log(`[Queue] Created queue for agent: ${agentId}`);
    }
    return agentQueues.get(agentId)!;
};

/**
 * Add a message to the agent's queue.
 */
export const addMessage = async (agentId: string, message: NormalizedMessage) => {
    const queue = getQueue(agentId);
    // We can add options here like priority, delay, etc.
    await queue.add('chat-message', message, {
        removeOnComplete: true, // Keep Redis clean
        removeOnFail: 100,      // Keep last 100 failed jobs for debugging
    });
    console.log(`[Queue] Added message to queue for agent: ${agentId}`);
};

/**
 * Create a worker to consume messages for a specific agent.
 * 
 * BATCHING STRATEGY FOR GPU EFFICIENCY:
 * Standard BullMQ workers process jobs one by one. To support batching for the LLM:
 * 1. The worker can pull multiple jobs using `queue.getJobs()` manually if not using the standard process loop.
 * 2. OR, better for BullMQ: The worker processes one job, but pushes it to a local buffer. 
 *    When the buffer fills or a timeout is reached, the batch is sent to the LLM.
 * 
 * Below is a standard worker skeleton. The actual LLM worker will implement the processor.
 */
export const createWorker = (agentId: string, processor: (job: Job<NormalizedMessage>) => Promise<void>) => {
    const queueName = `agent-queue-${agentId}`;

    const worker = new Worker(queueName, processor, {
        connection: redisOptions,
        concurrency: 1, // Process one by one (or increase if batching logic handles concurrency)
        // limiter: { max: 10, duration: 1000 } // Optional: Rate limit per agent
    });

    worker.on('completed', (job) => {
        console.log(`[Worker] Job ${job.id} completed for agent ${agentId}`);
    });

    worker.on('failed', (job, err) => {
        console.error(`[Worker] Job ${job?.id} failed for agent ${agentId}: ${err.message}`);
    });

    console.log(`[Worker] Started worker for agent: ${agentId}`);
    return worker;
};

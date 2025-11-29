import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

const connection = new IORedis({ host: redisHost, port: redisPort, maxRetriesPerRequest: null });

export const messageQueue = new Queue('messages', { connection });

// Simple worker that logs jobs
export const worker = new Worker(
  'messages',
  async (job) => {
    console.log('[worker] processing job', job.id, job.name, job.data);
    return { processed: true };
  },
  { connection }
);

// If run directly, enqueue a test job
if (require.main === module) {
  (async () => {
    console.log('Enqueuing test job to messages queue');
    await messageQueue.add('test', { text: 'hello from dev' });
    // allow some time for worker to pick up
    setTimeout(() => process.exit(0), 1500);
  })();
}

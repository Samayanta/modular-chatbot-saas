
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { initVectorDB } from './vector';
import { initAnalyticsDB, logMetric } from './analytics';
import { addMessage, createWorker, NormalizedMessage } from './queue';
import { processMessage, LLMResponse } from './llm_worker';
import { sendReply } from './reply';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- Intake Logic ---

// Validation helper (copied from intake/index.ts for now)
const validateMessage = (body: any): string | null => {
    if (!body.agent_id || typeof body.agent_id !== 'string') return 'Missing or invalid agent_id';
    if (!body.user_id || typeof body.user_id !== 'string') return 'Missing or invalid user_id';
    if (!body.text || typeof body.text !== 'string') return 'Missing or invalid text';
    if (!body.timestamp || typeof body.timestamp !== 'string') return 'Missing or invalid timestamp';
    if (body.media && (!Array.isArray(body.media) || !body.media.every((m: any) => typeof m === 'string'))) {
        return 'Invalid media format';
    }
    return null;
};

app.post('/intake', async (req: Request, res: Response) => {
    const validationError = validateMessage(req.body);

    if (validationError) {
        console.error(`[Intake] Validation Error: ${validationError}`, req.body);
        return res.status(400).json({ error: validationError });
    }

    const normalizedMessage: NormalizedMessage = {
        agent_id: req.body.agent_id,
        user_id: req.body.user_id,
        text: req.body.text,
        media: req.body.media || [],
        timestamp: req.body.timestamp,
    };

    console.log('[Intake] Received valid message:', JSON.stringify(normalizedMessage, null, 2));

    // Add to Queue
    try {
        await addMessage(normalizedMessage.agent_id, normalizedMessage);
        // Ensure worker exists for this agent (Lazy creation for MVP)
        ensureWorker(normalizedMessage.agent_id);

        return res.status(200).json({ status: 'queued', messageId: Date.now().toString() });
    } catch (error: any) {
        console.error(`[Intake] Failed to queue message: ${error.message}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- Worker Management ---

const activeWorkers = new Set<string>();

const ensureWorker = (agentId: string) => {
    if (activeWorkers.has(agentId)) return;

    console.log(`[Server] Initializing worker for agent ${agentId}`);
    createWorker(agentId, async (job) => {
        const startTime = Date.now();
        const message = job.data;

        try {
            // Process Message via LLM Worker
            const result: LLMResponse | null = await processMessage(job);

            if (result) {
                // Send Reply
                await sendReply({
                    agent_id: agentId,
                    user_id: message.user_id,
                    platform: 'whatsapp', // Defaulting to whatsapp for MVP, could be derived from user_id or message
                    text: result.response
                });

                // Log Analytics
                const duration = Date.now() - startTime;
                await logMetric(agentId, 'response_time', duration);
                await logMetric(agentId, 'message_count', 1);
            } else {
                throw new Error('LLM processing returned null');
            }

        } catch (error: any) {
            console.error(`[Worker] Error processing job ${job.id}: ${error.message}`);

            // Send Fallback Reply
            await sendReply({
                agent_id: agentId,
                user_id: message.user_id,
                platform: 'whatsapp',
                text: "I'm sorry, I'm having trouble processing your request right now."
            });

            // Log Error
            await logMetric(agentId, 'error', 1, { message: error.message });
        }
    });

    activeWorkers.add(agentId);
};

// --- Initialization ---

const startServer = async () => {
    try {
        // Initialize DBs
        await initVectorDB();
        await initAnalyticsDB();

        // Start Express Server
        app.listen(PORT, () => {
            console.log(`SaaS MVP Server listening on port ${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

export { app };

if (require.main === module) {
    startServer();
}

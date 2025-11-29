import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Interface for the normalized message format
interface NormalizedMessage {
    agent_id: string;
    user_id: string;
    text: string;
    media?: string[];
    timestamp: string;
}

// Validation helper
const validateMessage = (body: any): string | null => {
    if (!body.agent_id || typeof body.agent_id !== 'string') return 'Missing or invalid agent_id';
    if (!body.user_id || typeof body.user_id !== 'string') return 'Missing or invalid user_id';
    if (!body.text || typeof body.text !== 'string') return 'Missing or invalid text';
    if (!body.timestamp || typeof body.timestamp !== 'string') return 'Missing or invalid timestamp';
    // media is optional, but if present should be an array of strings
    if (body.media && (!Array.isArray(body.media) || !body.media.every((m: any) => typeof m === 'string'))) {
        return 'Invalid media format';
    }
    return null;
};

app.post('/intake', (req: Request, res: Response) => {
    const validationError = validateMessage(req.body);

    if (validationError) {
        console.error(`[Intake] Validation Error: ${validationError}`, req.body);
        return res.status(400).json({ error: validationError });
    }

    // Normalize the message (in this case, we're assuming the input matches the structure or is a superset)
    // In a real scenario, we might map different webhook formats here.
    const normalizedMessage: NormalizedMessage = {
        agent_id: req.body.agent_id,
        user_id: req.body.user_id,
        text: req.body.text,
        media: req.body.media || [],
        timestamp: req.body.timestamp,
    };

    // Log receipt for testing
    console.log('[Intake] Received valid message:', JSON.stringify(normalizedMessage, null, 2));

    // TODO: Push to Async Queue (Redis/BullMQ)

    return res.status(200).json({ status: 'received', messageId: Date.now().toString() });
});

app.listen(PORT, () => {
    console.log(`Intake module listening on port ${PORT}`);
});

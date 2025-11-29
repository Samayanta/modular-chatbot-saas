export interface ReplyPayload {
    agent_id: string;
    user_id: string;
    platform: 'whatsapp' | 'instagram' | 'website';
    text: string;
    media?: string[];
}

/**
 * Mock function to send message to WhatsApp API.
 */
async function sendToWhatsApp(payload: ReplyPayload) {
    console.log(`[Reply] Sending to WhatsApp (User: ${payload.user_id}): "${payload.text}"`);
    if (payload.media && payload.media.length > 0) {
        console.log(`[Reply] Attaching media to WhatsApp: ${payload.media.join(', ')}`);
    }
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Mock function to send message to Instagram API.
 */
async function sendToInstagram(payload: ReplyPayload) {
    console.log(`[Reply] Sending to Instagram (User: ${payload.user_id}): "${payload.text}"`);
    if (payload.media && payload.media.length > 0) {
        console.log(`[Reply] Attaching media to Instagram: ${payload.media.join(', ')}`);
    }
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Mock function to send message to Website API.
 */
async function sendToWebsite(payload: ReplyPayload) {
    console.log(`[Reply] Sending to Website (User: ${payload.user_id}): "${payload.text}"`);
    if (payload.media && payload.media.length > 0) {
        console.log(`[Reply] Attaching media to Website: ${payload.media.join(', ')}`);
    }
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Main function to send a reply.
 * Routes the message to the appropriate platform handler.
 */
export const sendReply = async (payload: ReplyPayload) => {
    console.log(`[Reply Module] Processing reply for agent ${payload.agent_id}`);

    try {
        switch (payload.platform) {
            case 'whatsapp':
                await sendToWhatsApp(payload);
                break;
            case 'instagram':
                await sendToInstagram(payload);
                break;
            case 'website':
                await sendToWebsite(payload);
                break;
            default:
                console.error(`[Reply Module] Unknown platform: ${payload.platform}`);
        }
    } catch (error: any) {
        console.error(`[Reply Module] Failed to send reply: ${error.message}`);
        // In a real app, we might retry or log to a dead-letter queue
    }
};

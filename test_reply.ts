import { sendReply, ReplyPayload } from './reply/index';

async function runTest() {
    console.log('Starting Reply Module Test...');

    // 1. Test WhatsApp
    const whatsappPayload: ReplyPayload = {
        agent_id: 'agent-1',
        user_id: 'user-wa-1',
        platform: 'whatsapp',
        text: 'Hello on WhatsApp!',
    };
    await sendReply(whatsappPayload);

    // 2. Test Instagram with Media
    const instagramPayload: ReplyPayload = {
        agent_id: 'agent-1',
        user_id: 'user-ig-1',
        platform: 'instagram',
        text: 'Check this out!',
        media: ['https://example.com/image.jpg'],
    };
    await sendReply(instagramPayload);

    // 3. Test Website
    const websitePayload: ReplyPayload = {
        agent_id: 'agent-1',
        user_id: 'user-web-1',
        platform: 'website',
        text: 'Welcome to our site.',
    };
    await sendReply(websitePayload);

    // 4. Test Unknown Platform (Error Handling)
    const unknownPayload: any = {
        agent_id: 'agent-1',
        user_id: 'user-unknown',
        platform: 'tiktok',
        text: 'This should fail gracefully.',
    };
    await sendReply(unknownPayload);

    console.log('Test finished.');
}

runTest().catch(console.error);

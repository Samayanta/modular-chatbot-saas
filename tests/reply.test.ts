import { sendReply, ReplyPayload } from '../reply';

describe('Reply Module', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it('should send to WhatsApp', async () => {
        const payload: ReplyPayload = {
            agent_id: 'agent-1',
            user_id: 'user-1',
            platform: 'whatsapp',
            text: 'Hello',
        };

        await sendReply(payload);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Sending to WhatsApp'));
    });

    it('should send to Instagram', async () => {
        const payload: ReplyPayload = {
            agent_id: 'agent-1',
            user_id: 'user-1',
            platform: 'instagram',
            text: 'Hello',
        };

        await sendReply(payload);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Sending to Instagram'));
    });

    it('should send to Website', async () => {
        const payload: ReplyPayload = {
            agent_id: 'agent-1',
            user_id: 'user-1',
            platform: 'website',
            text: 'Hello',
        };

        await sendReply(payload);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Sending to Website'));
    });
});

import { Job } from 'bullmq';
import { NormalizedMessage } from '../queue/index';

// Interface for RAG Context
interface RAGContext {
    chunks: string[];
}

// Interface for LLM Response
export interface LLMResponse {
    language: string;
    intent: string;
    response: string;
}

/**
 * Mock function to simulate RAG retrieval from Postgres + pgvector.
 * In a real implementation, this would query the vector DB using embeddings.
 */
async function retrieveContext(agentId: string, query: string): Promise<RAGContext> {
    console.log(`[RAG] Retrieving context for agent ${agentId} query: "${query}"`);
    // Mock context
    return {
        chunks: [
            "Our business hours are 9 AM to 5 PM, Sunday to Friday.",
            "We offer a 30-day money-back guarantee on all products.",
        ],
    };
}

/**
 * Constructs the structured prompt for Gemma 4b.
 */
function buildPrompt(message: NormalizedMessage, context: RAGContext): string {
    const contextText = context.chunks.map((c, i) => `${i + 1}. ${c}`).join('\n');

    return `
You are a helpful AI assistant for a Nepalese business.
Context:
${contextText}

User Message: "${message.text}"

Instructions:
1. Detect the language of the user's message (Nepali, English, or Mixed).
2. Classify the intent.
3. Answer the user's question using the provided Context. If the answer is not in the context, politely say you don't know.
4. Reply in the SAME language as the user.

Output Format (JSON):
{
  "language": "Detected Language",
  "intent": "Classified Intent",
  "response": "Your response here"
}
`;
}

/**
 * Call Ollama API with Gemma model
 */
async function callLLM(prompt: string): Promise<LLMResponse> {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'gemma2:2b';

    console.log(`[LLM] Calling Ollama (${ollamaModel}) at ${ollamaUrl}`);

    try {
        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: ollamaModel,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    max_tokens: 500
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        const responseText = data.response || '';

        // Try to parse JSON response
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    language: parsed.language || 'English',
                    intent: parsed.intent || 'general',
                    response: parsed.response || responseText
                };
            }
        } catch (e) {
            console.log('[LLM] Failed to parse JSON, using raw response');
        }

        // Fallback if JSON parsing fails
        return {
            language: "English",
            intent: "general_chat",
            response: responseText || "I'm here to help! How can I assist you?"
        };
    } catch (error) {
        console.error('[LLM] Ollama API error:', error);
        // Return fallback response on error
        return {
            language: "English",
            intent: "error",
            response: "I'm having trouble processing your request right now. Please try again."
        };
    }
}

/**
 * Main processor function for the worker.
 */
export const processMessage = async (job: Job<NormalizedMessage>): Promise<LLMResponse | null> => {
    const message = job.data;
    const agentId = message.agent_id;

    if (!agentId) {
        console.error('[LLM Worker] Missing agent_id');
        return null;
    }

    console.log(`[LLM Worker] Processing message for agent ${agentId}: "${message.text}"`);

    try {
        // 1. Retrieve Context (RAG)
        const context = await retrieveContext(agentId, message.text);

        // 2. Build Prompt
        const prompt = buildPrompt(message, context);

        // 3. Call LLM
        const llmResult = await callLLM(prompt);

        // 4. Return Result
        return llmResult;

    } catch (error: any) {
        console.error(`[LLM Worker] Error processing message: ${error.message}`);
        return null;
    }
};

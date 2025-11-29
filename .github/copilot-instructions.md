# Copilot Instructions - Modular Chatbot SaaS

## Project Overview
Multi-language (Nepali/English/mixed) chatbot SaaS for WhatsApp, Instagram, and website widgets. Built on async message processing with RAG-enabled knowledge bases and LLM inference (Gemma 4b).

## Architecture - Message Flow
```
Intake → Queue (per-agent BullMQ) → LLM Worker → Reply + Analytics
                                    ↓
                              Vector DB (RAG)
```

### Core Modules (Root Level)
- **`intake/`**: Validates & normalizes incoming messages to `NormalizedMessage` interface
- **`queue/`**: BullMQ per-agent queues; creates workers lazily via `ensureWorker()`
- **`llm_worker/`**: Processes jobs via `processMessage()` - RAG retrieval → prompt building → LLM call
- **`vector/`**: Postgres + pgvector for ephemeral KB storage (1536-dim embeddings)
- **`reply/`**: Platform-specific message dispatch (WhatsApp/Instagram/website)
- **`analytics/`**: Metrics-only logging (no user messages stored) - response_time, queue_length, error, message_count
- **`server.ts`**: Main orchestrator - initializes DBs, handles `/intake` endpoint, manages workers

### Module Dependencies
All modules are independent and testable. Key interfaces:
- `NormalizedMessage` (queue/index.ts): Standard message format across system
- `LLMResponse` (llm_worker/index.ts): Structured LLM output with language, intent, response
- `ReplyPayload` (reply/index.ts): Cross-platform reply format
- `MetricLog` (analytics/index.ts): Analytics data structure

## Critical Patterns

### 1. Ephemeral Knowledge Base Strategy
KB is loaded per agent session and deleted on inactivity:
```typescript
// Load at session start
await loadKB(agentId, chunks);

// Clean up after session
await deleteKB(agentId);
```
**Why**: Minimize memory footprint for multi-tenant system with burst traffic patterns.

### 2. Per-Agent Queue Isolation
Each agent gets its own BullMQ queue (`agent-queue-{agentId}`):
```typescript
const queue = getQueue(agentId);  // Creates if not exists
await addMessage(agentId, message);
```
**Why**: Independent rate limiting, scaling, and failure isolation per agent.

### 3. Lazy Worker Initialization
Workers are created on first message for an agent (see `ensureWorker()` in server.ts):
```typescript
if (!activeWorkers.has(agentId)) {
  createWorker(agentId, jobProcessor);
  activeWorkers.add(agentId);
}
```
**Why**: Avoid idle GPU usage; scale workers dynamically.

### 4. Structured Prompting
Single prompt per message to Gemma 4b with:
- RAG context chunks
- Language detection instruction
- Intent classification
- JSON output format (language, intent, response)

See `buildPrompt()` in `llm_worker/index.ts` for template.

### 5. Pool Injection for Testing
All DB modules use `setPool()` for mock injection:
```typescript
export const setPool = (newPool: any) => { pool = newPool; };
```
Tests in `tests/` extensively mock `pg` and `bullmq`.

## Development Workflow

### Running the System
```bash
# Start infrastructure (Postgres with pgvector + Redis)
cd modular-chatbot-saas && docker-compose up -d

# Run main server (initializes DBs + handles intake)
npm start  # Runs: ts-node server.ts

# Run tests
npm test   # Uses jest.config.js: ts-jest preset, tests/**/*.test.ts
```

### Environment Setup
Copy `.env.example` from `modular-chatbot-saas/` and configure:
- `POSTGRES_*`: Postgres connection (default: localhost:5432)
- `REDIS_*`: Redis connection (default: localhost:6379)
- `PORT`: Server port (default: 3000)

**Docker Compose**: Runs Postgres (with pgvector), Redis, and optional app container on port 3001.

### Testing Conventions
- **Mock external dependencies**: BullMQ, pg Pool (see `tests/queue.test.ts`, `tests/vector.test.ts`)
- **Use supertest for HTTP**: `tests/intake.test.ts` mocks queue module, tests validation
- **Mock files**: `test_*.ts` at root provide standalone mock implementations (e.g., `test_vector_mock.ts`)

## Tech Stack Specifics

### Database Operations
- **pgvector**: 1536-dimensional embeddings, cosine distance operator (`<=>`)
- **Transactions**: Use BEGIN/COMMIT for bulk inserts (see `loadKB()`)
- **Indexes**: Always create on `agent_id` for multi-tenant queries

### BullMQ Queue Configuration
```typescript
await queue.add('chat-message', message, {
  removeOnComplete: true,  // Keep Redis clean
  removeOnFail: 100        // Debug last 100 failures
});
```

### TypeScript Config
- Target: ES2020, CommonJS modules
- Strict mode enabled
- All `.ts` files compiled to `dist/` (not used in dev with ts-node)

## Adding New Features

### New Module Checklist
1. Create `module/index.ts` with exported interface
2. Add initialization in `server.ts` if needed (see `initVectorDB()`, `initAnalyticsDB()`)
3. Create `tests/module.test.ts` with mocked dependencies
4. Update `NormalizedMessage` or add new interface if data flow changes
5. Document in `context.md` for project overview

### New Platform Integration (e.g., Telegram)
1. Add `platform: 'telegram'` to `ReplyPayload` union type in `reply/index.ts`
2. Implement `sendToTelegram()` function
3. Update switch case in `sendReply()`
4. Add platform detection logic in `server.ts` worker processor (currently defaults to 'whatsapp')

### RAG Improvements
- Embeddings generated externally (not in codebase yet)
- `retrieveTopK()` uses cosine distance - adjust `k` parameter in `llm_worker/index.ts`
- Consider HNSW index for large KBs (commented out in `initVectorDB()`)

## Language & Multi-tenancy

### Language Detection
LLM handles Nepali/English/mixed detection. Always respond in detected language:
```typescript
// LLM returns: { language: "Nepali", intent: "...", response: "..." }
```

### Agent Isolation
- Each agent has separate queue, KB, and metrics
- No cross-agent data sharing
- Use `agent_id` as primary partition key in all operations

## Common Pitfalls

1. **Forgetting to initialize DBs**: `server.ts` calls `initVectorDB()` and `initAnalyticsDB()` before accepting requests
2. **Not handling null LLM responses**: Worker sends fallback message and logs error metric
3. **Vector embedding format**: Must be string `"[0.1,0.2,...]"` for pgvector, not JSON array
4. **Queue naming**: Always use `agent-queue-{agentId}` format to avoid collisions
5. **Test isolation**: Clear mocks with `jest.clearAllMocks()` in `beforeEach()`

## Future Context

- `modular-chatbot-saas/` subdirectory is a separate dev scaffold (minimal setup)
- Frontend dashboard planned but not implemented
- Website scraping for KB auto-generation mentioned in `context.md`
- GPU usage metrics logged but no actual GPU integration yet (LLM is mocked)

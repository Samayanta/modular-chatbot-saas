# Modular Chatbot Platform SaaS

## Overview
We are building a modular SaaS chatbot platform for Nepalese businesses. The platform allows agents to create AI-powered chatbots for WhatsApp, Instagram, and website widgets.

## Key Features
- **Multi-language handling**: Nepali, English, and mixed (code-switching).
- **Ephemeral Knowledge Base (KB)**: Loaded per agent session, stored in Postgres + pgvector, deleted after inactivity.
- **Async Queue**: Handles bursts of messages (5–15 messages per 1–2 min interval per agent).
- **LLM Integration**: Uses Gemma 4b (local or via API) for language detection, intent classification, RAG reasoning, and response generation.
- **RAG**: Retrieval-Augmented Generation with SQL vector database per agent.
- **Reply Module**: Sends responses back to WhatsApp, Instagram, and website APIs.
- **Analytics Module**: Stores only metrics (response time, queue length, failures). No user messages are stored.

## Architecture Modules
1. **Intake Module**: Normalize JSON messages, extract agent_id, user_id, text, media, timestamp.
2. **Async Queue**: Redis/BullMQ or RabbitMQ; per-agent queue.
3. **LLM Worker**: Gemma 4b, structured prompt template.
4. **Vector Storage / RAG Module**: Postgres + pgvector, ephemeral KB per session.
5. **Reply Module**: Send responses via platform APIs.
6. **Analytics Module**: Store metrics only.

## Tech Stack
- **Backend**: Node.js + TypeScript
- **Async Queue**: Redis / BullMQ
- **LLM**: Gemma 4b
- **Vector DB**: Postgres + pgvector
- **Infrastructure**: Docker

## Development Guidelines
- Use modular architecture.
- Store API keys in `.env`.
- Write unit tests for all modules.

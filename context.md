# Context.md for Modular Chatbot SaaS (Frontend + Backend)

## Project Overview

We are building a **modular SaaS chatbot platform** for Nepalese businesses. The platform allows agents to create AI-powered chatbots for WhatsApp, Instagram, and website widgets. The platform supports multi-language interactions (Nepali, English, and mixed) and modular RAG-enabled knowledge bases.

## Key Features

1. **Multi-language handling**: Nepali, English, and mixed.
2. **Ephemeral Knowledge Base (KB)**:

   * Loaded per agent session.
   * Stored in Postgres + pgvector for embeddings.
   * Deleted after agent inactivity.
3. **Async queue** to handle bursts of messages (5–15 messages per 1–2 min interval per agent).
4. **LLM integration** using **Gemma 4b** (local or via API):

   * Handles language detection, intent classification, RAG reasoning, and response generation.
5. **RAG (retrieval-augmented generation)**:

   * SQL vector database per agent.
   * Top-k chunk retrieval for response context.
6. **Reply module**:

   * Sends responses back to WhatsApp, Instagram, and website APIs.
   * Supports text + optional media references.
7. **Analytics module**:

   * Stores only metrics (response time, queue length, failures).
   * No user messages stored.
8. **Frontend dashboard** for agents and admins:

   * Manage agents, knowledge bases, and settings.
   * Monitor real-time analytics, queue, and GPU usage.
   * Upload KB manually or via website scraping.
9. **Website Chatbot Embed / Widget**:

   * Small JS snippet connecting to backend APIs.

## Architecture Modules

1. **Backend Modules**:

   * Intake: normalize JSON messages from WhatsApp/Instagram/website.
   * Queue: async message handling per agent (Redis/BullMQ or RabbitMQ).
   * LLM Worker: Gemma 4b inference, RAG integration.
   * Vector Storage / RAG: Postgres + pgvector, ephemeral per session.
   * Reply: send responses via APIs.
   * Analytics: store metrics only.
2. **Frontend Modules**:

   * Login / Auth (JWT/Supabase Auth or custom)
   * Dashboard overview (agents, queue, GPU usage)
   * Agent management (start/stop agent, assign KB)
   * Knowledge Base management (upload CSV/PDF, website scraping)
   * Web widget management (generate snippet, live chatbot)
   * Settings (API keys, language, fallback responses)

## Constraints & Guidelines

* **Ephemeral KB**: delete when agent session ends or after inactivity.
* **Minimal infrastructure**: GPU idle when no messages; small ephemeral DB.
* **Modular design**: each module independent and scalable.
* **Language handling**: reply in same language as user (Nepali, English, or mixed).
* **Prompting**: single structured prompt per message to Gemma 4b.
* **Error handling**: fallback response logged in analytics.
* **Analytics**: logs response time, messages per agent, queue length, GPU usage, failures/errors.

## Frontend Tech Stack

* Framework: React.js or Next.js (TypeScript)
* Styling: Tailwind CSS
* State Management: Zustand or Redux
* Real-time updates: WebSocket / Socket.io
* Charts: Recharts / Chart.js
* Form handling: React Hook Form
* Build tools: Vite or Next.js build system

## Backend Tech Stack

* Node.js + TypeScript
* Async Queue: Redis/BullMQ or RabbitMQ
* LLM: Gemma 4b (local GPU 16GB or API)
* Vector DB: Postgres + pgvector
* Caching: Redis for ephemeral session data
* Docker: for Postgres, Redis, optional Gemma 4b container
* Testing: Jest + TypeScript

## Performance & Scaling

* Multiple agents run concurrently.
* Each agent may receive bursts of messages.
* Async queue prevents GPU overload.
* Ephemeral KB keeps memory footprint small.

## Development Guidelines

* Use modular architecture.
* Secret management: .env or secret manager.
* Testing: unit + integration tests.
* CI/CD recommended.
* Google Antigravity: use for AI-assisted code scaffolding, testing, iterative development.

## Future Enhancements

* Website scraping to auto-generate knowledge base.
* Media embedding for RAG reasoning.
* Frequently asked question cache.
* Multi-language fallback handling for typos or mixed-language input.

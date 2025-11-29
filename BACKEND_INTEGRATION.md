# Backend Integration Guide

## Overview

The backend consists of two servers:
1. **Message Processing Server** (port 3000) - Handles incoming messages, queue, LLM processing
2. **REST API Server** (port 3001) - Provides REST APIs for frontend (agents, KB, analytics, auth)

## Setup Instructions

### 1. Install Dependencies

```bash
cd /Users/samayantaghimire/Desktop/Project
npm install bcrypt cors jsonwebtoken concurrently @types/bcrypt @types/cors @types/jsonwebtoken
```

### 2. Database Setup

Create the database:
```bash
psql -U postgres
CREATE DATABASE chatbot_saas;
\q
```

Run the schema:
```bash
npm run db:setup
```

Or manually:
```bash
psql -U postgres -d chatbot_saas -f database/schema.sql
```

### 3. Environment Variables

Create/update `.env` file:

```env
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=chatbot_saas
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Servers
PORT=3000              # Message processing server
API_PORT=3001          # REST API server

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# LLM (optional)
GEMMA_API_KEY=your-gemma-api-key
```

### 4. Start Servers

**Option A: Start both servers together**
```bash
npm run start:both
```

**Option B: Start individually**
```bash
# Terminal 1: Message processing server
npm start

# Terminal 2: REST API server
npm run start:api
```

## API Endpoints

### Authentication

#### POST `/api/auth/signup`
Register a new user.
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

Response:
```json
{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "agent"
  }
}
```

#### POST `/api/auth/login`
Login existing user.
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### GET `/api/auth/me`
Get current user (requires auth header).
```
Authorization: Bearer <token>
```

### Agents

#### GET `/api/agents`
Get all agents for current user.

#### POST `/api/agents`
Create new agent.
```json
{
  "name": "WhatsApp Bot",
  "platform": "whatsapp",
  "api_credentials": {
    "api_key": "..."
  }
}
```

#### PUT `/api/agents/:id`
Update agent.

#### DELETE `/api/agents/:id`
Delete agent.

#### POST `/api/agents/:id/start`
Start agent (set status to active).

#### POST `/api/agents/:id/stop`
Stop agent (set status to inactive).

### Knowledge Bases

#### GET `/api/knowledge-bases`
Get all knowledge bases.

#### POST `/api/knowledge-bases`
Create knowledge base.
```json
{
  "agent_id": "uuid",
  "name": "Product KB",
  "description": "Product information",
  "source_type": "file",
  "source_url": "https://example.com/data.pdf"
}
```

#### DELETE `/api/knowledge-bases/:id`
Delete knowledge base.

#### GET `/api/knowledge-bases/:id/chunks`
Get KB chunks (paginated).
Query params: `page=1&limit=20`

### Analytics

#### GET `/api/analytics/dashboard`
Get dashboard statistics.

Response:
```json
{
  "totalAgents": 5,
  "activeAgents": 3,
  "totalMessages": 1234,
  "avgResponseTime": 1.2,
  "queueLength": 5,
  "errorRate": 2.3
}
```

#### GET `/api/analytics/metrics`
Get historical metrics for charts.

### Settings

#### GET `/api/settings`
Get user settings.

#### PUT `/api/settings`
Update settings.
```json
{
  "openai_api_key": "sk-...",
  "default_language": "en",
  "fallback_response": "Sorry, I didn't understand",
  "webhook_url": "https://webhook.site/...",
  "notification_preferences": {
    "email": true,
    "sms": false
  }
}
```

## Frontend Configuration

Update the frontend's API service to point to the correct URL.

In `modular-chatbot-saas/src/services/api.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
```

Add to `modular-chatbot-saas/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Testing the Integration

### 1. Start the backend
```bash
cd /Users/samayantaghimire/Desktop/Project
npm run start:both
```

### 2. Start the frontend
```bash
cd /Users/samayantaghimire/Desktop/Project/modular-chatbot-saas
npm run dev
```

### 3. Test the flow
1. Visit http://localhost:3001
2. Sign up / Log in
3. Create an agent
4. Upload knowledge base
5. Start agent
6. Send test message to `/intake` endpoint

## Database Schema

### Tables

- **users**: User accounts (email, password, name, role)
- **agents**: Chatbot agents (name, platform, status, credentials)
- **knowledge_bases**: KB metadata (name, source, embedding status)
- **kb_chunks**: KB text chunks for RAG retrieval
- **settings**: User-specific settings

### Relationships

```
users (1) → (many) agents
agents (1) → (many) knowledge_bases
knowledge_bases (1) → (many) kb_chunks
users (1) → (1) settings
```

## Architecture Flow

```
Frontend (Next.js:3001)
    ↓ HTTP requests
REST API Server (Express:3001)
    ↓ Database operations
PostgreSQL (5432)
    
Incoming Messages (WhatsApp/Instagram/Website)
    ↓ POST /intake
Message Processing Server (Express:3000)
    ↓ Add to queue
Redis + BullMQ (6379)
    ↓ Process job
LLM Worker (Gemma 4b)
    ↓ RAG retrieval
Vector DB (pgvector)
    ↓ Send response
Reply Module → Platform APIs
```

## Next Steps

1. **Implement file upload**: Add multer for PDF/CSV uploads
2. **Website scraping**: Add puppeteer for website KB generation
3. **Real LLM integration**: Connect to Gemma 4b API
4. **WebSocket**: Add Socket.io for real-time updates
5. **Platform integrations**: Add WhatsApp/Instagram webhook handlers
6. **Analytics tracking**: Store metrics in analytics DB
7. **Queue monitoring**: Expose queue stats through API

## Security Notes

- ⚠️ Change `JWT_SECRET` in production
- ⚠️ Use HTTPS in production
- ⚠️ Add rate limiting (express-rate-limit)
- ⚠️ Sanitize user inputs
- ⚠️ Store API keys encrypted in database
- ⚠️ Use environment-specific configs

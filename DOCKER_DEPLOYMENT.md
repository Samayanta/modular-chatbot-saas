# 🐳 Docker Deployment Guide

## 🚀 Quick Start (Local)

### Option 1: Full Stack with Docker Compose

```bash
cd /Users/samayantaghimire/Desktop/Project

# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

**Services will be available at:**
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Message Processor: http://localhost:4000
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Ollama: http://localhost:11434

### Option 2: Individual Services

```bash
# Build images
docker build -f Dockerfile.api -t chatbot-api .
docker build -f Dockerfile.processor -t chatbot-processor .
docker build -f Dockerfile.frontend -t chatbot-frontend .

# Run individually
docker run -p 3001:3001 chatbot-api
docker run -p 4000:4000 chatbot-processor
docker run -p 3000:3000 chatbot-frontend
```

---

## 📦 What's Included

### Services:

1. **PostgreSQL with pgvector** (Port 5432)
   - Automatic schema initialization
   - Vector embeddings support
   - Persistent data volume

2. **Redis** (Port 6379)
   - BullMQ message queues
   - Persistent data volume

3. **Ollama with Gemma 2 2b** (Port 11434)
   - Automatic model download on first start
   - GPU support (if available)
   - Persistent model cache

4. **REST API Server** (Port 3001)
   - Authentication endpoints
   - Agent management
   - Knowledge base APIs
   - Analytics

5. **Message Processor** (Port 4000)
   - Queue worker
   - RAG integration
   - LLM calls to Ollama
   - Reply handling

6. **Frontend Dashboard** (Port 3000)
   - Next.js production build
   - Optimized for performance
   - Standalone output

---

## 🌐 Render.com Deployment (Free Tier)

### Step 1: Prepare Repository

```bash
cd /Users/samayantaghimire/Desktop/Project

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - Chatbot SaaS"

# Push to GitHub
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy to Render

1. **Go to [render.com](https://render.com)**
2. **Click "New +"** → **"Blueprint"**
3. **Connect your GitHub repository**
4. **Render will detect `render.yaml`** and create all services

### Step 3: Configure Environment Variables

Render will auto-generate:
- `POSTGRES_PASSWORD`
- `JWT_SECRET`

Manual configuration needed:
- Set `NEXT_PUBLIC_API_URL` to your API service URL
- Confirm all service connections

### Step 4: Deploy

- Click "Apply" to deploy all services
- Wait for builds to complete (5-10 minutes)
- Frontend will be available at your Render URL

---

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)
```env
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=chatbot_saas
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

REDIS_HOST=redis
REDIS_PORT=6379

PORT=4000
API_PORT=3001

OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=gemma2:2b

JWT_SECRET=your-secret-key
NODE_ENV=production
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🔧 Docker Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f processor
docker-compose logs -f ollama
docker-compose logs -f frontend
```

### Stop Services
```bash
# Stop all
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart api
```

### Check Status
```bash
docker-compose ps
```

### Access Container Shell
```bash
# API container
docker-compose exec api sh

# Processor container
docker-compose exec processor sh

# Database
docker-compose exec postgres psql -U postgres -d chatbot_saas
```

---

## 🧪 Testing Ollama

### Test Ollama API
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Test model generation
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemma2:2b",
    "prompt": "What are the business hours?",
    "stream": false
  }'
```

### Pull Different Models
```bash
# Access Ollama container
docker-compose exec ollama sh

# Pull a different model
ollama pull mistral:7b
ollama pull llama2:7b

# List models
ollama list
```

---

## 📊 Resource Usage

### Docker Compose (Free Tier Compatible)

| Service | Memory | CPU | Storage |
|---------|--------|-----|---------|
| PostgreSQL | 256MB | 0.5 | 1GB |
| Redis | 128MB | 0.25 | 500MB |
| Ollama (CPU) | 512MB | 1.0 | 2GB |
| API | 256MB | 0.5 | - |
| Processor | 256MB | 0.5 | - |
| Frontend | 256MB | 0.5 | - |
| **Total** | **~1.6GB** | **3.25** | **3.5GB** |

**Note:** Ollama with Gemma 2b (2B parameters) can run on CPU but will be slow. For production, consider:
- Using Render paid tier with GPU
- Using external LLM API (OpenAI, Anthropic)
- Switching to lighter model

---

## 🚨 Troubleshooting

### Ollama Model Not Downloading
```bash
# Check Ollama logs
docker-compose logs ollama

# Manually pull model
docker-compose exec ollama ollama pull gemma2:2b
```

### Database Connection Issues
```bash
# Check if database is ready
docker-compose exec postgres pg_isready

# View database logs
docker-compose logs postgres

# Recreate database
docker-compose down -v
docker-compose up -d postgres
```

### Frontend Not Loading
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up -d --build frontend
```

### Port Conflicts
```bash
# Check what's using ports
lsof -i :3000 -i :3001 -i :4000

# Kill processes
pkill -f "node"
pkill -f "ts-node"

# Restart Docker
docker-compose down
docker-compose up -d
```

---

## 🎯 Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Use secure `POSTGRES_PASSWORD`
- [ ] Enable HTTPS/SSL
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Configure backups for PostgreSQL
- [ ] Set up CDN for frontend
- [ ] Enable Redis persistence
- [ ] Configure log aggregation
- [ ] Set resource limits per container
- [ ] Use production-grade LLM API or GPU

---

## 📚 Additional Resources

- **Render Docs**: https://render.com/docs
- **Ollama Docs**: https://ollama.ai/docs
- **Docker Compose**: https://docs.docker.com/compose/
- **pgvector**: https://github.com/pgvector/pgvector

---

## 🎉 Success!

Your chatbot SaaS platform is now fully containerized and ready to deploy!

**Local**: `docker-compose up -d`  
**Production**: Push to GitHub → Deploy on Render

All dependencies (PostgreSQL, Redis, Ollama) are managed automatically! 🚀

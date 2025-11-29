# 🐳 Docker Quick Start

## 🚀 One Command Deploy

```bash
cd /Users/samayantaghimire/Desktop/Project
./docker-start.sh
```

This will:
1. ✅ Build all Docker images
2. ✅ Start PostgreSQL with pgvector
3. ✅ Start Redis for queues
4. ✅ Download and start Ollama with Gemma 2 2b
5. ✅ Start REST API server
6. ✅ Start Message Processor
7. ✅ Start Frontend dashboard
8. ✅ Initialize database schema

**Access your app at: http://localhost:3000**

---

## 📦 What's Running

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| API Server | 3001 | http://localhost:3001 |
| Message Processor | 4000 | http://localhost:4000 |
| Ollama (LLM) | 11434 | http://localhost:11434 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |

---

## 🎯 For Render.com Free Tier

### Prerequisites
- GitHub account
- Render.com account (free)

### Deploy Steps

1. **Push to GitHub:**
```bash
cd /Users/samayantaghimire/Desktop/Project
git init
git add .
git commit -m "Chatbot SaaS with Docker & Ollama"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **On Render.com:**
   - Click "New" → "Blueprint"
   - Connect your GitHub repo
   - Render will use `render.yaml` to create all services
   - Wait 10-15 minutes for deployment

3. **Access:**
   - Frontend will be at: `https://your-app.onrender.com`
   - API at: `https://your-app-api.onrender.com`

**Note:** Ollama with Gemma 2b will run on CPU (slow). For production:
- Upgrade to paid tier with GPU
- Or use external LLM API (OpenAI, Anthropic)

---

## 🛠️ Common Commands

```bash
# Start everything
./docker-start.sh

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f processor
docker-compose logs -f ollama
docker-compose logs -f frontend

# Stop everything
docker-compose down

# Restart a service
docker-compose restart api

# Check status
docker-compose ps

# Rebuild after code changes
docker-compose up -d --build

# Clean everything (removes volumes)
docker-compose down -v
```

---

## 🧪 Test Ollama

```bash
# Check if model is loaded
curl http://localhost:11434/api/tags

# Test generation
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemma2:2b",
    "prompt": "Hello, how are you?",
    "stream": false
  }'
```

---

## 📊 Resource Requirements

**Minimum (CPU only):**
- RAM: 4GB
- Disk: 10GB
- CPU: 2 cores

**Recommended:**
- RAM: 8GB
- Disk: 20GB
- CPU: 4 cores
- GPU: Optional (much faster LLM)

---

## 🔧 Troubleshooting

### Ollama not responding
```bash
docker-compose logs ollama
docker-compose restart ollama
```

### Database connection failed
```bash
docker-compose logs postgres
docker-compose restart postgres
```

### Rebuild after changes
```bash
docker-compose down
docker-compose up -d --build
```

---

## 📚 Full Documentation

- **DOCKER_DEPLOYMENT.md** - Complete deployment guide
- **render.yaml** - Render.com configuration
- **docker-compose.yml** - Local development
- **docker-compose.prod.yml** - Production setup

---

## ✨ Features

✅ Complete containerization  
✅ Automatic database initialization  
✅ Ollama with Gemma 2 2b auto-download  
✅ Production-ready configuration  
✅ Render.com free tier compatible  
✅ PostgreSQL with pgvector  
✅ Redis message queues  
✅ Health checks for all services  

**Your fullstack chatbot SaaS is now Docker-ready!** 🎉

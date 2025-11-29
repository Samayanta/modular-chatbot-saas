# Quick Start Guide

## Install and Run (5 minutes)

### Step 1: Install Dependencies
```bash
cd /Users/samayantaghimire/Desktop/Project/modular-chatbot-saas
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```

The default `.env` settings will work for local development.

### Step 3: Start Backend Infrastructure
```bash
docker-compose up -d
```

This starts:
- Postgres with pgvector (port 5432)
- Redis (port 6379)
- Optional backend app (port 3001)

### Step 4: Start Frontend
```bash
npm run dev
```

Frontend will be available at: **http://localhost:3001**

### Step 5: Open in Browser
Navigate to http://localhost:3001

You should see:
- Dashboard with metrics (all zeros initially)
- Sidebar navigation
- Connection status indicator

## Verify Setup

### Check Frontend
- Open http://localhost:3001
- Should see dashboard with sidebar

### Check Backend Services
```bash
# Check Postgres
docker exec -it modular_chatbot_postgres psql -U postgres -c "SELECT version();"

# Check Redis
docker exec -it modular_chatbot_redis redis-cli ping
# Should return: PONG
```

### Check Backend API (if running separately)
```bash
curl http://localhost:3000/health
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server (port 3001)
npm run backend          # Start backend server (port 3000)

# Build
npm run build            # Production build
npm start                # Start production server

# Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript validation

# Docker
docker-compose up -d     # Start services
docker-compose down      # Stop services
docker-compose logs -f   # View logs
```

## Project Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend (Next.js) | 3001 | http://localhost:3001 |
| Backend API | 3000 | http://localhost:3000 |
| Postgres | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |

## Next Steps

1. **Explore the Dashboard**: Navigate through pages using sidebar
2. **Create an Agent**: Click "Create Agent" button (implementation pending)
3. **Upload Knowledge Base**: Navigate to KB page (implementation pending)
4. **View Analytics**: Navigate to Analytics page (implementation pending)

## Troubleshooting

### "Port already in use"
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### "Cannot connect to backend"
Check that backend is running on port 3000:
```bash
curl http://localhost:3000/health
```

If not running, start it:
```bash
cd /Users/samayantaghimire/Desktop/Project
npm start
```

### "Database connection failed"
Ensure Docker services are running:
```bash
docker-compose ps
```

If not running:
```bash
docker-compose up -d
```

## File Locations

- Frontend code: `modular-chatbot-saas/src/`
- Configuration: `modular-chatbot-saas/*.config.js`
- Backend code: `../` (parent directory)
- Documentation: `modular-chatbot-saas/*.md`

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/pages/index.tsx` | Dashboard homepage |
| `src/components/layout/Layout.tsx` | Main layout |
| `src/state/store.ts` | Global state |
| `src/services/api.ts` | API client |
| `tailwind.config.js` | Styling config |
| `package.json` | Dependencies |

## Development Workflow

1. **Make changes** in `src/` directory
2. **Hot reload** will update browser automatically
3. **Check console** for errors
4. **Test API calls** using browser DevTools

## Resources

- [Full Documentation](./README.md)
- [Project Structure](./FOLDER_STRUCTURE.md)
- [Setup Details](./SETUP_COMPLETE.md)
- [Context](../context.md)

---

**Ready to build!** 🚀

# 🚀 DEPLOY NOW - Quick Start Guide

## ✅ Your App is Production-Ready!

**GitHub Repository**: https://github.com/Samayanta/modular-chatbot-saas

---

## 🎯 Deploy to Render (5 Minutes)

### Option 1: Automatic Blueprint Deployment (Recommended)

1. **Open Render Dashboard**
   ```
   https://dashboard.render.com/blueprints
   ```

2. **Click "New Blueprint Instance"**

3. **Connect GitHub Repository**
   - Repository: `Samayanta/modular-chatbot-saas`
   - Branch: `master`
   - Blueprint: `render.yaml` (auto-detected)

4. **Click "Apply"**

Render will automatically:
- ✅ Create PostgreSQL database (with pgvector)
- ✅ Create Redis instance
- ✅ Deploy API server
- ✅ Deploy message processor worker
- ✅ Deploy Next.js frontend
- ✅ Configure all environment variables
- ✅ Set up HTTPS for all services

**⏱️ Deployment Time**: 10-15 minutes

---

### Option 2: Manual Service Creation

If Blueprint doesn't work, create services manually:

#### Step 1: PostgreSQL Database
```
Service Type: PostgreSQL
Name: chatbot-postgres
Plan: Free
Region: Oregon (or nearest)
PostgreSQL Version: 17
Database: chatbot_saas
User: postgres
```

After creation, run this SQL to enable pgvector:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Then run the schema from `database/schema.sql`

#### Step 2: Redis
```
Service Type: Redis
Name: chatbot-redis
Plan: Free
Region: Oregon (same as Postgres)
```

#### Step 3: API Server
```
Service Type: Web Service
Name: chatbot-api
Runtime: Docker
Dockerfile: Dockerfile.api
Plan: Free
Region: Oregon
Health Check Path: /health

Environment Variables:
POSTGRES_HOST: [Internal URL from chatbot-postgres]
POSTGRES_PORT: 5432
POSTGRES_DB: chatbot_saas
POSTGRES_USER: postgres
POSTGRES_PASSWORD: [Auto from postgres service]
REDIS_HOST: [Internal URL from chatbot-redis]
REDIS_PORT: 6379
API_PORT: 3001
JWT_SECRET: [Generate random 32-char string]
NODE_ENV: production
```

#### Step 4: Message Processor
```
Service Type: Background Worker
Name: chatbot-processor
Runtime: Docker
Dockerfile: Dockerfile.processor
Plan: Free
Region: Oregon

Environment Variables: [Same as API Server]
```

#### Step 5: Frontend
```
Service Type: Web Service
Name: chatbot-frontend
Runtime: Docker
Dockerfile: Dockerfile.frontend
Plan: Free
Region: Oregon

Environment Variables:
NEXT_PUBLIC_API_URL: https://chatbot-api.onrender.com
```

---

## 🔗 Your Live URLs (After Deployment)

| Service | URL |
|---------|-----|
| **Frontend** | https://chatbot-frontend.onrender.com |
| **API** | https://chatbot-api.onrender.com |
| **Health Check** | https://chatbot-api.onrender.com/health |

---

## 🧪 Test Your Deployment

### 1. Check Health
```bash
curl https://chatbot-api.onrender.com/health
# Expected: {"status":"ok","timestamp":"..."}
```

### 2. Test End-to-End Flow

**A. Sign Up**
```bash
curl -X POST https://chatbot-api.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

**B. Login**
```bash
curl -X POST https://chatbot-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
# Save the token from response
```

**C. Create Agent**
```bash
curl -X POST https://chatbot-api.onrender.com/api/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Bot","description":"My first agent","platform":"whatsapp"}'
```

**D. Visit Frontend**
```
https://chatbot-frontend.onrender.com
```

---

## 📊 Monitor Your App

### Render Dashboard
```
https://dashboard.render.com
```

View:
- Service status (Live/Building/Failed)
- Logs for each service
- Resource usage
- Build history

### View Logs
```bash
# Using Render CLI
render logs chatbot-api
render logs chatbot-processor
render logs chatbot-frontend

# Or visit Dashboard > Service > Logs tab
```

---

## 🔧 Update Deployment

### Push Changes to GitHub
```bash
cd /Users/samayantaghimire/Desktop/Project
git add .
git commit -m "Your update message"
git push
```

Render auto-deploys on every push to master! 🎉

---

## ⚙️ Environment Variables to Set

After deployment, verify these in Render Dashboard:

### API Server
- ✅ `POSTGRES_HOST` - Auto-configured
- ✅ `POSTGRES_PASSWORD` - Auto-generated
- ✅ `REDIS_HOST` - Auto-configured
- ✅ `JWT_SECRET` - Auto-generated
- ⚠️  **If signup fails**: Generate new JWT_SECRET (32+ chars random string)

### Frontend
- ⚠️  **Critical**: `NEXT_PUBLIC_API_URL` must be `https://chatbot-api.onrender.com`
  - NOT `http://localhost:3001`
  - Must use HTTPS
  - No trailing slash

---

## 🐛 Troubleshooting

### Service Won't Start
```bash
# Check build logs
render logs chatbot-api --tail 100

# Common fixes:
# 1. Verify Docker builds locally: docker build -f Dockerfile.api .
# 2. Check all environment variables are set
# 3. Ensure PostgreSQL service is running first
```

### Frontend Can't Connect to API
```bash
# Check frontend environment
render services get chatbot-frontend

# Verify NEXT_PUBLIC_API_URL is correct
# Should be: https://chatbot-api.onrender.com
```

### Database Errors
```bash
# Connect to database
render psql chatbot-postgres

# Check if pgvector extension exists
SELECT * FROM pg_extension WHERE extname = 'vector';

# If missing, create it:
CREATE EXTENSION IF NOT EXISTS vector;
```

### Services Keep Sleeping
This is normal on free tier! Services sleep after 15 min of inactivity.
- First request wakes them up (~30 seconds)
- Upgrade to Starter plan ($7/mo) to keep services awake 24/7

---

## 💰 Cost Breakdown

### Free Tier (Current)
- **Monthly Cost**: $0
- **Compute**: 750 hours/month per service
- **Storage**: 1GB PostgreSQL + 1GB Redis
- **Bandwidth**: 100GB/month
- **Limitations**: Services sleep after 15 min inactivity

### Starter Tier (Recommended for Production)
- **Monthly Cost**: ~$35/month
  - API Server: $7/mo
  - Processor: $7/mo
  - Frontend: $7/mo
  - PostgreSQL: $7/mo
  - Redis: $7/mo
- **Benefits**:
  - No sleep time (24/7 uptime)
  - Better performance
  - More storage
  - Priority support

---

## 🎯 Next Steps After Deployment

1. **Add Custom Domain**
   - Go to Service Settings > Custom Domain
   - Add your domain (e.g., `chatbot.yourcompany.com`)
   - Update DNS records as shown

2. **Enable Auto-Deploy**
   - Already enabled by default!
   - Every push to GitHub auto-deploys

3. **Set Up Monitoring**
   - Add Sentry for error tracking
   - Set up uptime monitoring (UptimeRobot, Pingdom)

4. **Add Real LLM**
   - Currently using mock LLM
   - Integrate OpenAI API, Anthropic Claude, or Cohere
   - Or self-host Ollama on separate GPU instance

5. **Configure Backups**
   - Render automatically backs up PostgreSQL
   - Configure backup retention in settings

6. **Add Analytics**
   - Integrate PostHog, Mixpanel, or Google Analytics
   - Track user behavior and conversions

---

## 🆘 Need Help?

- **Documentation**: See `PRODUCTION_DEPLOY.md`
- **Render Docs**: https://render.com/docs
- **Render Status**: https://status.render.com
- **Support**: https://community.render.com

---

## ✅ Deployment Checklist

- [x] Code pushed to GitHub ✓
- [x] render.yaml configured ✓
- [x] All Dockerfiles ready ✓
- [x] .env files created ✓
- [x] Health checks implemented ✓
- [ ] Render Blueprint deployed
- [ ] All services running (green status)
- [ ] Environment variables verified
- [ ] End-to-end test passed
- [ ] Custom domain added (optional)

---

**🎉 You're ready to deploy! Click the link below:**

👉 **[Deploy Now on Render](https://dashboard.render.com/blueprints)**

Select: `Samayanta/modular-chatbot-saas` → `master` → Apply

---

*Generated: 2025-11-29*
*Version: 1.0.0*

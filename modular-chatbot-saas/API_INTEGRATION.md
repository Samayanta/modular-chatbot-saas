# API Integration Guide

This document explains how the frontend integrates with the backend APIs.

## Architecture Overview

```
Frontend (Next.js)
    ↓
API Service Layer (src/services/api.ts)
    ↓
Axios HTTP Client
    ↓
Backend REST API (Node.js + Express)
    ↓
Database (Postgres + Redis)
```

## API Service Structure

### Base Configuration

**File**: `src/services/api.ts`

```typescript
class ApiService {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000',
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### Interceptors

#### Request Interceptor
- Adds JWT token to `Authorization` header
- Reads token from `localStorage.getItem('auth_token')`
- Applied to all outgoing requests

#### Response Interceptor
- Handles 401 Unauthorized responses
- Redirects to `/login` on auth failure
- Extracts data from response automatically

## Endpoint Categories

### 1. Authentication API (`authApi`)

**Login**
```typescript
authApi.login(email: string, password: string)
// POST /api/auth/login
// Returns: { token: string, user: User }
```

**Signup**
```typescript
authApi.signup(data: SignupData)
// POST /api/auth/signup
// Returns: { token: string, user: User }
```

**Get Current User**
```typescript
authApi.getCurrentUser()
// GET /api/auth/me
// Returns: User
```

**Logout**
```typescript
authApi.logout()
// POST /api/auth/logout
// Returns: void
```

**Refresh Token**
```typescript
authApi.refreshToken()
// POST /api/auth/refresh
// Returns: { token: string }
```

---

### 2. Agent API (`agentApi`)

**List All Agents**
```typescript
agentApi.getAll()
// GET /api/agents
// Returns: Agent[]
```

**Get Agent by ID**
```typescript
agentApi.getById(id: string)
// GET /api/agents/:id
// Returns: Agent
```

**Create Agent**
```typescript
agentApi.create(data: { name: string, platform: string, language: string })
// POST /api/agents
// Returns: Agent
```

**Update Agent**
```typescript
agentApi.update(id: string, data: Partial<Agent>)
// PUT /api/agents/:id
// Returns: Agent
```

**Delete Agent**
```typescript
agentApi.delete(id: string)
// DELETE /api/agents/:id
// Returns: { success: boolean }
```

**Start Agent**
```typescript
agentApi.start(id: string)
// POST /api/agents/:id/start
// Returns: { status: 'active' }
```

**Stop Agent**
```typescript
agentApi.stop(id: string)
// POST /api/agents/:id/stop
// Returns: { status: 'inactive' }
```

---

### 3. Knowledge Base API (`kbApi`)

**List KBs for Agent**
```typescript
kbApi.getAll(agentId: string)
// GET /api/agents/:agentId/kb
// Returns: KnowledgeBase[]
```

**Get KB by ID**
```typescript
kbApi.getById(kbId: string)
// GET /api/kb/:kbId
// Returns: KnowledgeBase
```

**Upload File**
```typescript
kbApi.upload(agentId: string, formData: FormData)
// POST /api/agents/:agentId/kb/upload
// FormData contains: file, name, description
// Returns: KnowledgeBase
```

**Scrape Website**
```typescript
kbApi.scrape(agentId: string, {
  url: string,
  name: string,
  maxPages: number,
  followLinks: boolean
})
// POST /api/agents/:agentId/kb/scrape
// Returns: KnowledgeBase
```

**Delete KB**
```typescript
kbApi.delete(kbId: string)
// DELETE /api/kb/:kbId
// Returns: { success: boolean }
```

**Generate Embeddings**
```typescript
kbApi.generateEmbeddings(kbId: string)
// POST /api/kb/:kbId/embeddings
// Returns: { status: 'processing' }
```

**Get KB Chunks**
```typescript
kbApi.getChunks(kbId: string, page?: number, limit?: number)
// GET /api/kb/:kbId/chunks?page=1&limit=20
// Returns: { chunks: ChunkData[], total: number }
```

---

### 4. Analytics API (`analyticsApi`)

**Dashboard Stats**
```typescript
analyticsApi.getDashboard()
// GET /api/analytics/dashboard
// Returns: DashboardStats
```

**Agent Metrics**
```typescript
analyticsApi.getAgentMetrics(agentId: string, type?: string)
// GET /api/analytics/agents/:agentId?type=response_time
// Returns: Metric[]
```

**Query Metrics**
```typescript
analyticsApi.getMetrics({
  agentId?: string,
  type?: string,
  startDate?: string,
  endDate?: string
})
// GET /api/analytics/metrics?agentId=xxx&type=response_time
// Returns: Metric[]
```

---

### 5. Settings API (`settingsApi`)

**Get All Settings**
```typescript
settingsApi.get()
// GET /api/settings
// Returns: Settings
```

**Update All Settings**
```typescript
settingsApi.update(data: Partial<Settings>)
// PUT /api/settings
// Returns: Settings
```

**Update API Keys**
```typescript
settingsApi.updateApiKeys(data: Settings['apiKeys'])
// PUT /api/settings/api-keys
// Returns: Settings
```

**Update Language Settings**
```typescript
settingsApi.updateLanguage(data: Settings['language'])
// PUT /api/settings/language
// Returns: Settings
```

**Update Fallback Messages**
```typescript
settingsApi.updateFallback(data: Settings['fallback'])
// PUT /api/settings/fallback
// Returns: Settings
```

**Update Profile**
```typescript
settingsApi.updateProfile(data: Settings['profile'])
// PUT /api/settings/profile
// Returns: Settings
```

---

### 6. Widget API (`widgetApi`)

**Get Widget Config**
```typescript
widgetApi.getConfig(agentId: string)
// GET /api/widget/:agentId/config
// Returns: WidgetConfig
```

**Update Widget Config**
```typescript
widgetApi.updateConfig(agentId: string, config: WidgetConfig)
// PUT /api/widget/:agentId/config
// Returns: WidgetConfig
```

**Send Message**
```typescript
widgetApi.sendMessage(agentId: string, message: string)
// POST /api/widget/:agentId/message
// Returns: { response: string, language: string }
```

---

## WebSocket Integration

### Setup

**File**: `src/hooks/useSocket.ts`

```typescript
const { socket, isConnected } = useSocket();

useEffect(() => {
  if (!socket) return;
  
  // Subscribe to events
  socket.on('dashboard:update', (data) => {
    console.log('Dashboard updated:', data);
  });
  
  // Cleanup
  return () => {
    socket.off('dashboard:update');
  };
}, [socket]);
```

### Events

#### Client → Server (Emit)

```typescript
// Subscribe to agent updates
socket.emit('subscribe:agent', { agentId: 'xxx' });

// Subscribe to dashboard
socket.emit('subscribe:dashboard');

// Unsubscribe
socket.emit('unsubscribe:agent', { agentId: 'xxx' });
```

#### Server → Client (Listen)

```typescript
// Dashboard stats updated
socket.on('dashboard:update', (stats: DashboardStats) => {
  setDashboardStats(stats);
});

// Agent status changed
socket.on('agent:status', ({ agentId, status }) => {
  updateAgentStatus(agentId, status);
});

// Queue length updated
socket.on('queue:update', ({ agentId, length }) => {
  updateQueueLength(agentId, length);
});

// New message received
socket.on('message:new', (message: Message) => {
  addMessage(message);
});

// New metric logged
socket.on('analytics:metric', (metric: Metric) => {
  addMetric(metric);
});
```

---

## Error Handling

### API Errors

All API calls should be wrapped in try-catch:

```typescript
const loadAgents = async () => {
  try {
    setIsLoading(true);
    const data = await agentApi.getAll();
    setAgents(data);
  } catch (error) {
    console.error('Failed to load agents:', error);
    addNotification('Failed to load agents', 'error');
  } finally {
    setIsLoading(false);
  }
};
```

### Error Response Format

Backend should return errors in this format:

```json
{
  "error": {
    "message": "Agent not found",
    "code": "AGENT_NOT_FOUND",
    "status": 404
  }
}
```

### Handling Specific Errors

```typescript
catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) {
      addNotification('Resource not found', 'error');
    } else if (error.response?.status === 401) {
      // Handled by interceptor - redirects to login
    } else {
      addNotification(error.response?.data?.error?.message || 'An error occurred', 'error');
    }
  }
}
```

---

## Loading States

### Pattern

```typescript
const [isLoading, setIsLoading] = useState(false);

const fetchData = async () => {
  setIsLoading(true);
  try {
    const data = await api.getData();
    setData(data);
  } finally {
    setIsLoading(false);
  }
};
```

### UI Examples

```tsx
{isLoading ? (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
  </div>
) : (
  <DataDisplay data={data} />
)}
```

---

## Type Safety

### Response Types

All API responses are typed:

```typescript
interface Agent {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  platform: 'whatsapp' | 'instagram' | 'website';
  language: 'nepali' | 'english' | 'mixed';
  createdAt: string;
  lastActive?: string;
}

// Usage
const agents = await agentApi.getAll(); // Agent[]
const agent = await agentApi.getById('xxx'); // Agent
```

### Generic API Service

```typescript
async get<T>(url: string): Promise<T> {
  const response = await this.client.get<T>(url);
  return response.data;
}
```

---

## Authentication Flow

### Login Process

1. User submits login form
2. Call `authApi.login(email, password)`
3. Backend validates credentials
4. Backend returns JWT token + user data
5. Frontend stores token in `localStorage`
6. Axios interceptor adds token to all requests
7. Redirect to dashboard

### Token Refresh

- Tokens expire after 24 hours
- Call `authApi.refreshToken()` before expiration
- Can implement auto-refresh with interceptor

### Logout Process

1. Call `authApi.logout()`
2. Clear token from `localStorage`
3. Redirect to `/login`

---

## Testing API Integration

### Mock API Responses

```typescript
// __mocks__/api.ts
export const agentApi = {
  getAll: jest.fn(() => Promise.resolve([
    { id: '1', name: 'Test Agent', status: 'active', ... }
  ])),
  // ... other mocked methods
};
```

### Testing Components

```typescript
import { agentApi } from '@/services/api';

jest.mock('@/services/api');

test('loads agents', async () => {
  (agentApi.getAll as jest.Mock).mockResolvedValue([...mockAgents]);
  
  render(<AgentsPage />);
  
  await waitFor(() => {
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
  });
});
```

---

## Best Practices

1. **Always handle errors** - Wrap API calls in try-catch
2. **Use loading states** - Show spinners during requests
3. **Type everything** - Leverage TypeScript for safety
4. **Centralize API calls** - Keep all endpoints in `api.ts`
5. **Use interceptors** - Handle auth and errors globally
6. **Validate responses** - Check data before using
7. **Cache when appropriate** - Use React Query or SWR for caching
8. **Retry failed requests** - Implement exponential backoff
9. **Log errors** - Send to error tracking service
10. **Document endpoints** - Keep this file updated

---

## Production Considerations

### Environment Variables

```env
# Development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Production
NEXT_PUBLIC_API_URL=https://api.chatbot-saas.com
```

### CORS Configuration

Backend must allow requests from frontend domain:

```typescript
// backend/server.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
```

### Rate Limiting

Implement rate limiting on both frontend and backend:

```typescript
// Frontend - debounce search
const debouncedSearch = debounce((query) => {
  searchApi.search(query);
}, 500);
```

### Security

- Use HTTPS in production
- Implement CSRF protection
- Sanitize user inputs
- Validate file uploads
- Rate limit API endpoints
- Use secure JWT algorithms

---

## Troubleshooting

### Issue: API calls failing

**Check:**
1. Backend server is running
2. `NEXT_PUBLIC_API_URL` is correct
3. CORS is configured properly
4. Network tab in browser DevTools

### Issue: 401 Unauthorized

**Check:**
1. Token is present in localStorage
2. Token hasn't expired
3. Interceptor is adding Authorization header
4. Backend JWT validation is correct

### Issue: WebSocket not connecting

**Check:**
1. Socket.io server is running
2. WebSocket port is open
3. Firewall isn't blocking
4. URL is correct (ws:// or wss://)

---

## Future Enhancements

- [ ] Implement request caching with React Query
- [ ] Add retry logic with exponential backoff
- [ ] Implement optimistic updates
- [ ] Add request cancellation
- [ ] Implement pagination helpers
- [ ] Add file upload progress tracking
- [ ] Implement batch API requests
- [ ] Add GraphQL support option

---

**Last Updated**: November 26, 2025  
**Maintained By**: Development Team

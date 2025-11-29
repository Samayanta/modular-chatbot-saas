# Chatbot SaaS Platform - Frontend

A comprehensive **multi-language chatbot SaaS platform** for Nepalese businesses, built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Multi-Platform Support**: WhatsApp, Instagram, and Website widgets
- **Multi-Language**: Nepali, English, and mixed language support
- **Real-Time Updates**: Socket.io for live metrics and queue monitoring
- **RAG-Enabled**: Knowledge base management with vector embeddings
- **Analytics Dashboard**: Charts, metrics, and activity monitoring
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 📦 Tech Stack

- **Framework**: Next.js 14.0.4 with TypeScript
- **Styling**: Tailwind CSS 3.4.0
- **State Management**: Zustand 4.4.7
- **Forms**: React Hook Form 7.49.2
- **Charts**: Chart.js 4.4.1 + react-chartjs-2 5.2.0
- **Real-Time**: Socket.io-client 4.6.1
- **HTTP Client**: Axios 1.6.2

## 🛠️ Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running (see main project README)

### Setup Steps

1. **Clone and navigate to frontend directory**:
   ```bash
   cd modular-chatbot-saas
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your backend URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3001`

5. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── auth/           # Authentication components
│   │   └── ProtectedRoute.tsx
│   └── layout/         # Layout components
│       └── Layout.tsx
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication hook
│   ├── useDashboard.ts # Dashboard data hook
│   └── useSocket.ts    # WebSocket hook
├── pages/              # Next.js pages (routes)
│   ├── _app.tsx        # App wrapper
│   ├── _document.tsx   # HTML document
│   ├── index.tsx       # Home/Dashboard
│   ├── login.tsx       # Login page
│   ├── signup.tsx      # Signup page
│   ├── agents.tsx      # Agent management
│   ├── knowledge-base.tsx  # KB management
│   ├── web-widget.tsx  # Widget configuration
│   └── settings.tsx    # Settings page
├── services/           # API services
│   ├── api.ts          # API client & endpoints
│   └── auth.ts         # Auth service
├── state/              # State management
│   └── store.ts        # Zustand store
├── styles/             # Global styles
│   └── globals.css     # Tailwind + custom styles
└── types/              # TypeScript types
    └── index.ts        # Shared interfaces
```

## 🔌 API Integration

### Backend Endpoints

All API calls are configured in `src/services/api.ts`:

#### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

#### **Agents**
- `GET /api/agents` - List all agents
- `GET /api/agents/:id` - Get agent by ID
- `POST /api/agents` - Create agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `POST /api/agents/:id/start` - Start agent
- `POST /api/agents/:id/stop` - Stop agent

#### **Knowledge Base**
- `GET /api/agents/:agentId/kb` - List KBs for agent
- `GET /api/kb/:kbId` - Get KB by ID
- `POST /api/agents/:agentId/kb/upload` - Upload KB file
- `POST /api/agents/:agentId/kb/scrape` - Scrape website
- `DELETE /api/kb/:kbId` - Delete KB
- `POST /api/kb/:kbId/embeddings` - Generate embeddings
- `GET /api/kb/:kbId/chunks` - Get KB chunks

#### **Analytics**
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/agents/:agentId` - Agent metrics
- `GET /api/analytics/metrics` - Query metrics

#### **Settings**
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update settings
- `PUT /api/settings/api-keys` - Update API keys
- `PUT /api/settings/language` - Update language settings
- `PUT /api/settings/fallback` - Update fallback messages
- `PUT /api/settings/profile` - Update profile

#### **Widget**
- `GET /api/widget/:agentId/config` - Get widget config
- `PUT /api/widget/:agentId/config` - Update widget config
- `POST /api/widget/:agentId/message` - Send message to widget

### WebSocket Events

Socket.io connection configured in `src/hooks/useSocket.ts`:

#### **Emitted Events**
- `subscribe:agent` - Subscribe to agent updates
- `subscribe:dashboard` - Subscribe to dashboard updates

#### **Listened Events**
- `dashboard:update` - Dashboard stats updated
- `agent:status` - Agent status changed
- `queue:update` - Queue length changed
- `message:new` - New message received
- `analytics:metric` - New metric logged

## 🎨 Key Pages

### 1. **Login/Signup** (`/login`, `/signup`)
- JWT-based authentication
- Form validation with React Hook Form
- Demo credentials for testing
- Responsive design

### 2. **Dashboard** (`/`)
- Overview metrics (agents, messages, response time)
- Real-time charts (Line, Bar, Doughnut)
- Active agents table
- Recent activity feed
- Socket.io real-time updates

### 3. **Agent Management** (`/agents`)
- Create, edit, delete agents
- Start/stop agents
- Assign knowledge bases
- View queue length per agent
- Grid and table views

### 4. **Knowledge Base** (`/knowledge-base`)
- Upload files (CSV, PDF, TXT)
- Website scraping
- View KB chunks
- Generate embeddings
- Delete KBs

### 5. **Web Widget** (`/web-widget`)
- Widget customization (colors, position, messages)
- Live preview with functional chat
- Copy-to-clipboard embed code
- Installation guide

### 6. **Settings** (`/settings`)
- API keys (WhatsApp, Instagram, OpenAI)
- Language preferences
- Fallback messages (English & Nepali)
- Profile settings
- Notifications

## 🔐 Authentication Flow

1. User logs in via `/login`
2. JWT token stored in `localStorage`
3. Token sent in `Authorization` header for all requests
4. `ProtectedRoute` HOC guards authenticated pages
5. Auto-redirect to `/login` on 401 responses

## 🌐 Environment Variables

Create `.env.local` with:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

# Optional: Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS=G-XXXXXXXXXX
```

## 🧪 Development

### Demo Credentials

For testing without backend:
- **Email**: demo@example.com
- **Password**: demo123

### Running Tests

```bash
npm run test
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run type-check
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Docker

```bash
docker build -t chatbot-frontend .
docker run -p 3001:3001 chatbot-frontend
```

### Manual Build

```bash
npm run build
npm start
```

## 📊 State Management

### Zustand Store (`src/state/store.ts`)

```typescript
interface AppState {
  // Agents
  agents: Agent[];
  selectedAgent: Agent | null;
  
  // Dashboard
  dashboardStats: DashboardStats | null;
  
  // UI State
  sidebarOpen: boolean;
  
  // Notifications
  notifications: Notification[];
  
  // Actions
  setAgents: (agents: Agent[]) => void;
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  // ... more actions
}
```

## 🎯 TypeScript Types

All types defined in `src/types/index.ts`:

- `Agent` - Chatbot agent
- `KnowledgeBase` - KB with chunks
- `Message` - Chat message
- `Metric` - Analytics metric
- `DashboardStats` - Dashboard data
- `User` - User profile
- `Settings` - App settings

## 🐛 Common Issues

### 1. **API Connection Error**
   - Ensure backend is running on correct port
   - Check `NEXT_PUBLIC_API_URL` in `.env.local`
   - Verify CORS settings on backend

### 2. **WebSocket Not Connecting**
   - Check `NEXT_PUBLIC_BACKEND_URL` matches backend
   - Ensure Socket.io enabled on backend
   - Check browser console for errors

### 3. **Authentication Issues**
   - Clear localStorage and re-login
   - Check JWT token expiration
   - Verify backend auth endpoints

### 4. **TypeScript Errors**
   - Run `npm install` to ensure all types installed
   - Check `@types/*` packages in `package.json`

## 📝 TODO

- [ ] Implement forgot password flow
- [ ] Add unit tests for components
- [ ] Add E2E tests with Cypress
- [ ] Implement i18n for Nepali language
- [ ] Add dark mode support
- [ ] Optimize chart rendering performance
- [ ] Add service worker for PWA

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙋 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Email: support@chatbot-saas.com
- Documentation: [Full Docs](https://docs.chatbot-saas.com)

---

Built with ❤️ for Nepalese businesses

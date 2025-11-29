# Modular Chatbot SaaS - Frontend Dashboard

A comprehensive frontend dashboard for the **Modular Chatbot SaaS** platform, built for Nepalese businesses to manage AI-powered chatbots across WhatsApp, Instagram, and website widgets.

## 🚀 Features

- **Multi-language Support**: Nepali, English, and mixed language handling
- **Real-time Dashboard**: Live monitoring of agents, queues, and GPU usage via WebSocket
- **Agent Management**: Create, configure, start/stop chatbot agents
- **Knowledge Base Management**: Upload and manage knowledge bases (CSV, PDF, website scraping)
- **Analytics Dashboard**: Real-time metrics visualization with charts
- **Platform Integration**: Unified interface for WhatsApp, Instagram, and website chatbots
- **Responsive Design**: Mobile-first design with Tailwind CSS

## 🛠 Tech Stack

- **Framework**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Real-time Updates**: Socket.io-client
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Charts**: Recharts + Chart.js
- **Build Tool**: Next.js built-in SWC compiler

## 📁 Project Structure

```
modular-chatbot-saas/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components (Sidebar, Header)
│   │   ├── dashboard/       # Dashboard widgets
│   │   ├── agents/          # Agent management components
│   │   ├── kb/              # Knowledge base components
│   │   └── analytics/       # Analytics charts and metrics
│   ├── pages/
│   │   ├── _app.tsx         # Next.js app wrapper
│   │   ├── _document.tsx    # HTML document structure
│   │   ├── index.tsx        # Dashboard home page
│   │   ├── agents.tsx       # Agents management page
│   │   ├── kb.tsx           # Knowledge base page
│   │   ├── analytics.tsx    # Analytics page
│   │   ├── settings.tsx     # Settings page
│   │   └── api/             # API routes (Next.js API)
│   ├── hooks/
│   │   ├── useSocket.ts     # WebSocket connection hook
│   │   ├── useDashboard.ts  # Dashboard data hook
│   │   └── useAgents.ts     # Agent management hook
│   ├── state/
│   │   └── store.ts         # Zustand global state
│   ├── services/
│   │   ├── api.ts           # API service layer
│   │   └── socket.ts        # Socket.io connection
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   └── styles/
│       └── globals.css      # Global styles + Tailwind
├── public/                   # Static assets
├── .env.example             # Environment variables template
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── next.config.js           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running (see main project README)
- Postgres + Redis via Docker (for backend)

### Installation

1. **Clone and navigate to project**:
```bash
cd modular-chatbot-saas
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
```bash
cp .env.example .env
```

Edit `.env` and set:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

4. **Start the development server**:
```bash
npm run dev
```

The frontend will be available at [http://localhost:3001](http://localhost:3001)

### Start Backend Infrastructure

In a separate terminal, start Postgres and Redis:
```bash
docker-compose up -d
```

## 📜 Available Scripts

- `npm run dev` - Start Next.js development server (port 3001)
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## 🏗 Development Guide

### Adding a New Page

1. Create page in `src/pages/`:
```typescript
// src/pages/new-page.tsx
export default function NewPage() {
  return <div>New Page</div>;
}
```

2. Add navigation in `src/components/layout/Layout.tsx`

### Creating a Component

```typescript
// src/components/dashboard/MetricCard.tsx
interface MetricCardProps {
  label: string;
  value: number;
  icon: string;
}

export default function MetricCard({ label, value, icon }: MetricCardProps) {
  return (
    <div className="card">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      <span className="text-4xl">{icon}</span>
    </div>
  );
}
```

### Using Zustand Store

```typescript
import { useAppStore } from '@/state/store';

function MyComponent() {
  const { agents, setAgents, addNotification } = useAppStore();
  
  const handleUpdate = () => {
    addNotification('Update successful', 'success');
  };
  
  return <div>{/* component */}</div>;
}
```

### API Integration

```typescript
import { agentApi } from '@/services/api';

async function loadAgents() {
  try {
    const agents = await agentApi.getAll();
    console.log(agents);
  } catch (error) {
    console.error('Failed to load agents:', error);
  }
}
```

### Real-time Updates with Socket.io

```typescript
import { useSocket } from '@/hooks/useSocket';

function LiveMetrics() {
  const { socket, isConnected } = useSocket();
  
  useEffect(() => {
    if (!socket) return;
    
    socket.on('metrics:update', (data) => {
      console.log('New metrics:', data);
    });
    
    return () => {
      socket.off('metrics:update');
    };
  }, [socket]);
  
  return <div>Connected: {isConnected ? 'Yes' : 'No'}</div>;
}
```

## 🎨 Styling with Tailwind

Use predefined component classes:

```html
<button className="btn-primary">Primary Button</button>
<button className="btn-secondary">Secondary Button</button>
<div className="card">Card content</div>
<input className="input" />
<label className="label">Label text</label>
```

Custom colors defined in `tailwind.config.js`:
- `primary-*` (blue shades)
- `secondary-*` (purple shades)

## 🔗 API Endpoints (Backend)

The frontend connects to these backend endpoints:

- `GET /api/agents` - List all agents
- `POST /api/agents` - Create new agent
- `POST /api/agents/:id/start` - Start agent
- `POST /api/agents/:id/stop` - Stop agent
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/agents/:id` - Agent-specific metrics
- `POST /api/agents/:id/kb` - Upload knowledge base

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker build -t chatbot-saas-frontend .
docker run -p 3001:3000 chatbot-saas-frontend
```

### Environment Variables (Production)

```env
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
NODE_ENV=production
```

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## 📚 Key Dependencies

- **next**: 14.0.4 - React framework with SSR/SSG
- **react**: 18.2.0 - UI library
- **zustand**: 4.4.7 - Lightweight state management
- **axios**: 1.6.2 - HTTP client
- **socket.io-client**: 4.6.1 - Real-time communication
- **tailwindcss**: 3.4.0 - Utility-first CSS framework
- **recharts**: 2.10.3 - Composable charting library
- **react-hook-form**: 7.49.2 - Form validation

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all new files
3. Follow Tailwind CSS utility-first approach
4. Test components before committing
5. Update types in `src/types/index.ts`

## 📄 License

ISC

## 🔗 Related

- [Backend Server](../README.md)
- [Context Documentation](../context.md)
- [Copilot Instructions](../.github/copilot-instructions.md)

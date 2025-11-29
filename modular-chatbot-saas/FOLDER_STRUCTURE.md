# Frontend Project Structure

## Overview
This document provides a complete overview of the frontend project structure for the Modular Chatbot SaaS platform.

## Directory Tree

```
modular-chatbot-saas/
│
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Environment variables template
├── .eslintrc.js                  # ESLint configuration
├── .gitignore                    # Git ignore rules
├── docker-compose.yml            # Docker services (Postgres, Redis, App)
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies and scripts
├── postcss.config.js             # PostCSS configuration
├── README.md                     # Project documentation
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
│
├── public/                       # Static assets (images, fonts, etc.)
│
└── src/                          # Source code
    │
    ├── components/               # React components
    │   ├── layout/
    │   │   └── Layout.tsx        # Main layout with sidebar and header
    │   ├── dashboard/            # Dashboard-specific components
    │   ├── agents/               # Agent management components
    │   ├── kb/                   # Knowledge base components
    │   └── analytics/            # Analytics and charts components
    │
    ├── pages/                    # Next.js pages (routes)
    │   ├── _app.tsx              # Custom App component (global wrapper)
    │   ├── _document.tsx         # Custom Document (HTML structure)
    │   ├── index.tsx             # Dashboard home page (/)
    │   ├── agents.tsx            # Agents management page (/agents)
    │   ├── kb.tsx                # Knowledge base page (/kb)
    │   ├── analytics.tsx         # Analytics page (/analytics)
    │   ├── settings.tsx          # Settings page (/settings)
    │   └── api/                  # API routes (backend-for-frontend)
    │
    ├── hooks/                    # Custom React hooks
    │   ├── useSocket.ts          # WebSocket connection management
    │   ├── useDashboard.ts       # Dashboard data fetching
    │   └── useAgents.ts          # Agent management operations
    │
    ├── state/                    # Global state management
    │   └── store.ts              # Zustand store (agents, stats, UI state)
    │
    ├── services/                 # API and external services
    │   ├── api.ts                # Axios-based API client
    │   └── socket.ts             # Socket.io connection setup
    │
    ├── types/                    # TypeScript type definitions
    │   └── index.ts              # Shared interfaces (Agent, KB, Metric, etc.)
    │
    ├── styles/                   # Global styles
    │   └── globals.css           # Tailwind directives + custom styles
    │
    ├── index.ts                  # Legacy backend entry (dev scaffold)
    └── worker.ts                 # Legacy worker process (dev scaffold)
```

## File Descriptions

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Project metadata, dependencies, and npm scripts |
| `tsconfig.json` | TypeScript compiler configuration for Next.js |
| `next.config.js` | Next.js framework configuration |
| `tailwind.config.js` | Tailwind CSS theme and content paths |
| `postcss.config.js` | PostCSS plugins configuration |
| `.eslintrc.js` | ESLint rules for code quality |
| `.env.example` | Environment variables template |
| `docker-compose.yml` | Docker services for development |

### Core Application Files

#### Pages (`src/pages/`)
- `_app.tsx` - Wraps all pages with Layout and global providers
- `_document.tsx` - Custom HTML document structure (fonts, meta tags)
- `index.tsx` - Dashboard homepage with metrics and quick actions
- `agents.tsx` - Agent management interface (create, start, stop, edit)
- `kb.tsx` - Knowledge base upload and management
- `analytics.tsx` - Real-time analytics and charts
- `settings.tsx` - Application settings and configuration

#### Components (`src/components/`)
- `layout/Layout.tsx` - Main layout with responsive sidebar, header, notifications
- `dashboard/*` - Dashboard-specific widgets and cards
- `agents/*` - Agent cards, forms, status indicators
- `kb/*` - KB upload forms, file lists
- `analytics/*` - Charts, metrics visualizations

#### Hooks (`src/hooks/`)
- `useSocket.ts` - Manages WebSocket connection lifecycle
- `useDashboard.ts` - Fetches and auto-refreshes dashboard statistics
- `useAgents.ts` - Agent CRUD operations and state management

#### State Management (`src/state/`)
- `store.ts` - Zustand global store
  - Agents list and selected agent
  - Dashboard statistics
  - UI state (sidebar open/close)
  - Notifications queue

#### Services (`src/services/`)
- `api.ts` - Centralized API client with interceptors
  - Auth token injection
  - Error handling
  - Typed API endpoints (agentApi, kbApi, analyticsApi)

#### Types (`src/types/`)
- `index.ts` - TypeScript interfaces
  - `Agent` - Chatbot agent structure
  - `KnowledgeBase` - KB metadata
  - `Message` - Chat message format
  - `Metric` - Analytics metric
  - `DashboardStats` - Dashboard statistics

#### Styles (`src/styles/`)
- `globals.css` - Tailwind directives and custom utility classes
  - `.btn-primary`, `.btn-secondary` - Button styles
  - `.card` - Card component base
  - `.input`, `.label` - Form elements

## Key Patterns

### 1. Page Structure Pattern
```typescript
// src/pages/example.tsx
export default function ExamplePage() {
  // Fetch data
  useEffect(() => { /* load data */ }, []);
  
  // Render UI
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2>Page Title</h2>
        <button className="btn-primary">Action</button>
      </div>
      {/* Content */}
    </div>
  );
}
```

### 2. Component Pattern
```typescript
// src/components/dashboard/MetricCard.tsx
interface MetricCardProps {
  label: string;
  value: number | string;
  icon: string;
}

export default function MetricCard({ label, value, icon }: MetricCardProps) {
  return <div className="card">{/* content */}</div>;
}
```

### 3. Hook Pattern
```typescript
// src/hooks/useExample.ts
export const useExample = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Fetch or subscribe
  }, []);
  
  return { data, refresh: () => {} };
};
```

### 4. API Service Pattern
```typescript
// src/services/api.ts
export const exampleApi = {
  getAll: () => apiService.get<Type[]>('/api/examples'),
  getById: (id: string) => apiService.get<Type>(`/api/examples/${id}`),
  create: (data: Type) => apiService.post<Type>('/api/examples', data),
};
```

## Routing

Next.js file-based routing:
- `/` → `src/pages/index.tsx` (Dashboard)
- `/agents` → `src/pages/agents.tsx` (Agents)
- `/kb` → `src/pages/kb.tsx` (Knowledge Base)
- `/analytics` → `src/pages/analytics.tsx` (Analytics)
- `/settings` → `src/pages/settings.tsx` (Settings)

## State Flow

```
User Action → Component
              ↓
          API Service (axios)
              ↓
          Backend API
              ↓
          Response → Zustand Store → UI Update
```

Real-time updates:
```
Backend Event → Socket.io → useSocket Hook → Store Update → UI Update
```

## Development Workflow

1. **Add a new page**: Create file in `src/pages/`
2. **Add a component**: Create file in `src/components/[category]/`
3. **Add API endpoint**: Extend `src/services/api.ts`
4. **Add state**: Extend `src/state/store.ts`
5. **Add types**: Define in `src/types/index.ts`

## Best Practices

1. **Component Organization**: Group by feature (dashboard, agents, kb, analytics)
2. **Type Safety**: Always define TypeScript interfaces in `src/types/`
3. **API Calls**: Use centralized `api.ts` service, never direct axios calls
4. **State Management**: Use Zustand for global state, useState for local
5. **Styling**: Prefer Tailwind utilities, extract to components for reuse
6. **Hooks**: Custom hooks for data fetching and side effects
7. **File Naming**: 
   - Components: PascalCase (e.g., `MetricCard.tsx`)
   - Hooks: camelCase with `use` prefix (e.g., `useDashboard.ts`)
   - Pages: kebab-case or camelCase (e.g., `agents.tsx`)

## Legacy Files

- `src/index.ts` - Original backend dev server (kept for backward compatibility)
- `src/worker.ts` - Original worker process (kept for backward compatibility)

These files are retained from the original backend scaffold but are not used by the Next.js frontend.

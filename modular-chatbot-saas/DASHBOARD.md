# Dashboard Overview Documentation

## Overview
The Dashboard page is the main monitoring interface for the Modular Chatbot SaaS platform. It provides real-time visualization of agent status, message metrics, queue lengths, GPU usage, and system health.

## File Location
`src/pages/dashboard.tsx` (679 lines)

## Features

### 1. Real-time Metrics Dashboard
- **6 Key Metrics Cards**:
  - Total Agents
  - Active Agents  
  - Total Messages
  - Average Response Time
  - Queue Length
  - GPU Usage

### 2. Data Visualizations (Charts)
- **Message Volume Chart** (Line): 24-hour message volume trend
- **Response Time Chart** (Line): Average response time over 24 hours
- **Agent Status Distribution** (Doughnut): Active/Inactive/Error agents
- **Queue Length by Agent** (Bar): Current queue length per agent

### 3. Active Agents Table
- Detailed table view with:
  - Agent name
  - Platform (WhatsApp/Instagram/Website)
  - Status indicator
  - Language configuration
  - Last active timestamp

### 4. Recent Activity Feed
- Real-time activity stream
- Last 5 message events
- Agent avatar and platform info
- Timestamps

### 5. Real-time Updates
- **Socket.io Integration**: Live data streaming
- **Auto-refresh**: 30-second polling fallback
- **Connection Status**: Visual indicator

## Technical Implementation

### Dependencies
```json
{
  "chart.js": "^4.4.1",
  "react-chartjs-2": "^5.2.0",
  "socket.io-client": "^4.6.1"
}
```

### Chart.js Components Used
- `Line` - Time series charts
- `Bar` - Queue length visualization
- `Doughnut` - Status distribution
- Registered scales: Category, Linear, Point, Line, Bar, Arc

### State Management
```typescript
// Local component state
const [agents, setAgents] = useState<Agent[]>([]);
const [messageHistory, setMessageHistory] = useState<any[]>([]);
const [responseTimeHistory, setResponseTimeHistory] = useState<any[]>([]);
const [isLoading, setIsLoading] = useState(true);

// Global state via hooks
const { dashboardStats, refresh } = useDashboard();
const { socket, isConnected } = useSocket();
```

### API Integration

#### Initial Data Load
```typescript
// Fetch agents
const agentsData = await agentApi.getAll();

// Fetch dashboard metrics
const metricsData = await analyticsApi.getDashboard();
```

#### Socket.io Event Listeners
```typescript
// Real-time metric updates
socket.on('metrics:update', (data) => {
  refresh(); // Refresh dashboard stats
});

// Agent status changes
socket.on('agent:status', (data) => {
  // Update agent in state
});

// New messages
socket.on('message:received', (data) => {
  // Append to message history
});
```

## Component Breakdown

### Main Component: `DashboardPage`
**Responsibilities:**
- Fetch initial data on mount
- Setup Socket.io listeners
- Auto-refresh every 30 seconds
- Render sub-components

**Lifecycle:**
1. Mount → Load data from APIs
2. Setup Socket.io listeners
3. Start auto-refresh interval
4. Cleanup on unmount

### Sub-Components

#### 1. `MetricsGrid`
**Purpose**: Display 6 key metrics in card format

**Props:**
```typescript
interface MetricsGridProps {
  stats: DashboardStats | null;
}
```

**Features:**
- Responsive grid (1/2/3 columns)
- Color-coded metric cards
- Icon indicators
- Hover animations

#### 2. `MessageVolumeChart`
**Purpose**: Line chart showing 24-hour message volume

**Props:**
```typescript
interface MessageVolumeChartProps {
  data: Array<{
    timestamp: string;
    count: number;
  }>;
}
```

**Chart Configuration:**
- Type: Line with area fill
- Color: Blue (rgb(59, 130, 246))
- Tension: 0.4 (smooth curves)
- Height: 300px

#### 3. `ResponseTimeChart`
**Purpose**: Line chart showing average response time

**Props:**
```typescript
interface ResponseTimeChartProps {
  data: Array<{
    timestamp: string;
    avgTime: number;
  }>;
}
```

**Chart Configuration:**
- Type: Line with area fill
- Color: Green (rgb(16, 185, 129))
- Y-axis: Milliseconds
- Height: 300px

#### 4. `AgentStatusChart`
**Purpose**: Doughnut chart for agent status distribution

**Props:**
```typescript
interface AgentStatusChartProps {
  agents: Agent[];
}
```

**Chart Configuration:**
- Type: Doughnut
- Categories: Active, Inactive, Error
- Colors: Green, Gray, Red
- Legend: Bottom position

#### 5. `QueueLengthChart`
**Purpose**: Bar chart showing queue length per agent

**Props:**
```typescript
interface QueueLengthChartProps {
  agents: Agent[];
}
```

**Chart Configuration:**
- Type: Bar
- X-axis: Agent names
- Y-axis: Queue length
- Color: Blue

#### 6. `ActiveAgentsTable`
**Purpose**: Detailed agent information table

**Props:**
```typescript
interface ActiveAgentsTableProps {
  agents: Agent[];
}
```

**Columns:**
- Agent name
- Platform
- Status badge
- Language
- Last active timestamp

**Features:**
- Hover row highlighting
- Status color coding
- Responsive overflow

#### 7. `RecentActivity`
**Purpose**: Activity feed showing recent messages

**Props:**
```typescript
interface RecentActivityProps {
  messageHistory: Array<{
    agentName: string;
    platform: string;
    timestamp: string;
  }>;
}
```

**Features:**
- Last 5 messages
- Agent avatar (initial letter)
- Platform indicator
- Relative timestamps

## Data Flow

### Initial Load
```
Component Mount
  ↓
Fetch APIs (agentApi.getAll, analyticsApi.getDashboard)
  ↓
Set Local State (agents, messageHistory, responseTimeHistory)
  ↓
Render Components
```

### Real-time Updates
```
Socket.io Event Received
  ↓
Event Handler Processes Data
  ↓
Update Local State
  ↓
React Re-renders Affected Components
```

### Auto-refresh
```
30-second Interval Timer
  ↓
Call refresh() from useDashboard hook
  ↓
Fetch Latest Dashboard Stats
  ↓
Update Global State (Zustand)
  ↓
Components Re-render
```

## Backend API Requirements

### GET `/api/agents`
**Response:**
```json
[
  {
    "id": "agent-1",
    "name": "WhatsApp Bot",
    "status": "active",
    "platform": "whatsapp",
    "language": "nepali",
    "lastActive": "2025-11-26T12:00:00Z"
  }
]
```

### GET `/api/analytics/dashboard`
**Response:**
```json
{
  "totalAgents": 5,
  "activeAgents": 3,
  "totalMessages": 1250,
  "avgResponseTime": 450,
  "queueLength": 12,
  "gpuUsage": 35,
  "messageHistory": [
    {
      "timestamp": "2025-11-26T11:00:00Z",
      "count": 45
    }
  ],
  "responseTimeHistory": [
    {
      "timestamp": "2025-11-26T11:00:00Z",
      "avgTime": 420
    }
  ]
}
```

### Socket.io Events

#### Server → Client Events

**`metrics:update`**
```typescript
{
  type: 'metrics',
  data: {
    totalMessages: number;
    avgResponseTime: number;
    queueLength: number;
    gpuUsage: number;
  }
}
```

**`agent:status`**
```typescript
{
  agentId: string;
  status: 'active' | 'inactive' | 'error';
}
```

**`message:received`**
```typescript
{
  agentId: string;
  agentName: string;
  platform: string;
  timestamp: string;
  count: number;
}
```

## Styling

### Tailwind Classes Used
- **Layout**: `space-y-6`, `grid`, `gap-6`
- **Cards**: `card` (custom class), `rounded-lg`, `shadow-lg`
- **Typography**: `text-3xl`, `font-bold`, `text-gray-900`
- **Status Badges**: `bg-green-100`, `text-green-800`
- **Hover Effects**: `hover:shadow-lg`, `hover:bg-gray-50`

### Custom Classes (from globals.css)
```css
.card {
  @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
}
```

### Responsive Breakpoints
- Mobile: 1 column
- Tablet (md): 2 columns
- Desktop (lg): 3 columns for metrics, 2 for charts

## Performance Optimizations

### 1. Data Limiting
```typescript
// Only show last 24 hours of data
const labels = data.map((item) => /* process */);

// Recent activity limited to 5 items
const recentMessages = messageHistory.slice(-5).reverse();
```

### 2. Conditional Rendering
```typescript
// Only render chart if data exists
{data.length > 0 ? (
  <Line data={chartData} options={options} />
) : (
  <div>No data available</div>
)}
```

### 3. Auto-refresh Cleanup
```typescript
useEffect(() => {
  const interval = setInterval(refresh, 30000);
  return () => clearInterval(interval); // Cleanup
}, [refresh]);
```

### 4. Socket Event Cleanup
```typescript
return () => {
  socket.off('metrics:update');
  socket.off('agent:status');
  socket.off('message:received');
};
```

## Usage

### Accessing the Dashboard
Navigate to `/dashboard` or `/` (if set as default route)

### Testing Real-time Updates
```typescript
// In browser console or backend
socket.emit('metrics:update', {
  totalMessages: 1500,
  avgResponseTime: 380
});
```

### Viewing Different Time Periods
Currently fixed to 24 hours. To add time period selector:
```typescript
const [timeRange, setTimeRange] = useState('24h');

// Fetch data based on timeRange
const metricsData = await analyticsApi.getDashboard({ range: timeRange });
```

## Error Handling

### Loading States
- Spinner displayed while fetching initial data
- "No data available" message for empty charts
- "No agents found" message for empty table

### Connection Status
- Visual indicator (green/red dot)
- Text: "Live" or "Disconnected"
- Auto-reconnect via Socket.io

### API Errors
```typescript
try {
  const data = await agentApi.getAll();
} catch (error) {
  console.error('Failed to load:', error);
  // Error handled by global notification system
}
```

## Future Enhancements

### 1. Time Range Selector
Add dropdown to select:
- Last hour
- Last 24 hours (current)
- Last 7 days
- Last 30 days

### 2. Export Functionality
```typescript
const exportData = () => {
  // Export charts as CSV or PNG
};
```

### 3. Custom Metrics
Allow users to add custom metric cards

### 4. Alert Thresholds
Visual warnings when metrics exceed thresholds:
```typescript
{stats.queueLength > 100 && (
  <div className="bg-red-100 border-red-500">
    High queue length!
  </div>
)}
```

### 5. Drill-down Views
Click on chart data points to see detailed breakdown

### 6. Comparison Mode
Compare metrics across different time periods

## Testing Checklist

- [ ] Dashboard loads without errors
- [ ] All 6 metric cards display correctly
- [ ] Charts render with sample data
- [ ] Charts show "No data" when empty
- [ ] Table displays agents correctly
- [ ] Recent activity updates in real-time
- [ ] Socket.io connection indicator works
- [ ] Auto-refresh every 30 seconds
- [ ] Responsive layout on mobile/tablet/desktop
- [ ] Loading state displays on initial load
- [ ] Hover effects work on cards and table rows

## Dependencies Summary

```json
{
  "chart.js": "^4.4.1",           // Chart library
  "react-chartjs-2": "^5.2.0",    // React wrapper for Chart.js
  "socket.io-client": "^4.6.1"     // Real-time updates
}
```

## Files Summary

```
src/
├── pages/
│   └── dashboard.tsx           ✅ Main dashboard (679 lines)
├── hooks/
│   ├── useDashboard.ts         ✅ Dashboard data hook
│   └── useSocket.ts            ✅ Socket.io connection
├── services/
│   └── api.ts                  ✅ API client (agentApi, analyticsApi)
└── types/
    └── index.ts                ✅ TypeScript interfaces
```

---

**Dashboard is complete and ready for real-time monitoring!** 📊

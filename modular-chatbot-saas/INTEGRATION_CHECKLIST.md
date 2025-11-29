# Frontend Integration Checklist

Complete checklist for verifying frontend-backend integration.

## ✅ Setup Verification

### Environment Configuration
- [ ] `.env.local` file created with correct `NEXT_PUBLIC_API_URL`
- [ ] Backend URL matches running backend server
- [ ] Environment variables loaded correctly (`console.log(process.env.NEXT_PUBLIC_API_URL)`)

### Dependencies
- [ ] All npm packages installed (`npm install` completed)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)

### Development Server
- [ ] Frontend runs on `http://localhost:3001` (`npm run dev`)
- [ ] Backend runs on `http://localhost:3000`
- [ ] No CORS errors in browser console
- [ ] Can access login page

---

## 🔐 Authentication Integration

### Login Page (`/login`)
- [ ] Form renders correctly
- [ ] Email/password validation works
- [ ] API call to `/api/auth/login` succeeds
- [ ] JWT token stored in `localStorage`
- [ ] User data stored in `localStorage`
- [ ] Redirects to dashboard after login
- [ ] Error messages display on failure
- [ ] "Demo Login" button works

### Signup Page (`/signup`)
- [ ] Form renders correctly
- [ ] All fields validate properly
- [ ] Password strength indicator works
- [ ] API call to `/api/auth/signup` succeeds
- [ ] Auto-login after signup
- [ ] Redirects to dashboard
- [ ] Error handling works

### Protected Routes
- [ ] `ProtectedRoute` HOC works
- [ ] Unauthenticated users redirect to `/login`
- [ ] Authenticated users can access protected pages
- [ ] 401 responses trigger logout and redirect

### Auth Service
- [ ] `authService.login()` stores token
- [ ] `authService.logout()` clears token
- [ ] `authService.getCurrentUser()` fetches user
- [ ] `authService.isAuthenticated()` checks token
- [ ] Token persists across page reloads

---

## 📊 Dashboard Integration (`/`)

### Page Rendering
- [ ] Dashboard page loads without errors
- [ ] Layout renders correctly
- [ ] Sidebar navigation works
- [ ] Header displays user info

### Stats Cards
- [ ] Total Agents displays
- [ ] Active Agents displays
- [ ] Today's Messages displays
- [ ] Avg Response Time displays
- [ ] Queue Length displays
- [ ] Error Rate displays

### Charts
- [ ] Message Volume chart renders (Line chart)
- [ ] Response Time chart renders (Line chart)
- [ ] Agents Status chart renders (Bar chart)
- [ ] Platform Distribution chart renders (Doughnut chart)
- [ ] Charts update with real data

### Agents Table
- [ ] Active agents list displays
- [ ] Agent status badges show correct colors
- [ ] Platform names display correctly
- [ ] Actions buttons render

### Activity Feed
- [ ] Recent activity list displays
- [ ] Activity types show correct icons
- [ ] Timestamps format correctly
- [ ] Real-time updates work (if Socket.io connected)

### API Integration
- [ ] `analyticsApi.getDashboard()` called on mount
- [ ] Dashboard stats update every 30 seconds
- [ ] Loading state shows during fetch
- [ ] Error handling works on API failure

### WebSocket (Real-time)
- [ ] Socket.io connects successfully
- [ ] `dashboard:update` event received
- [ ] Stats update in real-time
- [ ] Connection status indicator works
- [ ] Reconnection works after disconnect

---

## 🤖 Agents Page Integration (`/agents`)

### Page Rendering
- [ ] Agents page loads
- [ ] Stats cards display (Total, Active, Inactive, Queue)
- [ ] Grid/Table view toggle works
- [ ] Agent cards render in grid view
- [ ] Agent table renders in table view

### Agent List
- [ ] `agentApi.getAll()` fetches agents
- [ ] Agents display with correct data
- [ ] Status badges show correct colors
- [ ] Queue lengths display
- [ ] Empty state shows when no agents

### Create Agent
- [ ] "Create Agent" button opens modal
- [ ] Form validates inputs
- [ ] `agentApi.create()` called on submit
- [ ] New agent appears in list
- [ ] Success notification shows
- [ ] Modal closes after creation

### Edit Agent
- [ ] "Edit" button opens modal
- [ ] Form pre-fills with agent data
- [ ] `agentApi.update()` called on save
- [ ] Agent updates in list
- [ ] Success notification shows

### Delete Agent
- [ ] "Delete" button shows confirmation
- [ ] `agentApi.delete()` called on confirm
- [ ] Agent removes from list
- [ ] Success notification shows

### Start/Stop Agent
- [ ] "Start" button calls `agentApi.start()`
- [ ] "Stop" button calls `agentApi.stop()`
- [ ] Status updates immediately
- [ ] Button text changes (Start ↔ Stop)

### Assign KB Modal
- [ ] "Assign KB" button opens modal
- [ ] KBs list loads for agent
- [ ] Selection dropdown works
- [ ] Assignment saves successfully

### Queue Monitoring
- [ ] Queue lengths display per agent
- [ ] Queue lengths auto-refresh every 10s
- [ ] Numbers update correctly

---

## 📚 Knowledge Base Integration (`/knowledge-base`)

### Page Rendering
- [ ] KB page loads
- [ ] Agent selector works
- [ ] Tab navigation works (View/Upload/Scrape)

### View KBs Tab
- [ ] `kbApi.getAll(agentId)` fetches KBs
- [ ] KB cards display in grid
- [ ] Stats show (total KBs, total chunks)
- [ ] Empty state shows when no KBs
- [ ] Refresh button works

### KB Cards
- [ ] KB name displays
- [ ] Status badges show correct colors
- [ ] Chunk count displays
- [ ] Source type shows (CSV/PDF/website)
- [ ] Created date formats correctly
- [ ] File type/URL shows in metadata

### KB Actions
- [ ] "View Chunks" opens modal
- [ ] Chunks load and display
- [ ] "Generate Embeddings" calls API
- [ ] "Delete" button shows confirmation
- [ ] `kbApi.delete()` removes KB

### Upload File Form
- [ ] Drag-and-drop area works
- [ ] File selection dialog works
- [ ] File validation works (type, size)
- [ ] Form fields validate
- [ ] `kbApi.upload()` sends FormData
- [ ] Progress indication works
- [ ] Success switches to View tab

### Scrape Website Form
- [ ] URL field validates
- [ ] Max pages field validates
- [ ] "Follow Links" checkbox works
- [ ] `kbApi.scrape()` called on submit
- [ ] Progress bar shows during scraping
- [ ] Success switches to View tab

### View Chunks Modal
- [ ] Modal opens with KB data
- [ ] `kbApi.getChunks()` loads chunks
- [ ] Chunks display in list
- [ ] Pagination works (first 20)
- [ ] Chunk text displays correctly
- [ ] Modal closes properly

---

## 💬 Web Widget Integration (`/web-widget`)

### Page Rendering
- [ ] Widget page loads
- [ ] Agent selector works
- [ ] Preview toggle button works

### Customization Panel
- [ ] Position selector works
- [ ] Color picker works
- [ ] Color hex input works
- [ ] Title input updates config
- [ ] Subtitle input updates config
- [ ] Greeting message updates config
- [ ] Placeholder input updates config
- [ ] Avatar URL input works
- [ ] "Show Powered By" checkbox works

### Code Snippet
- [ ] Snippet generates correctly
- [ ] Agent ID included in snippet
- [ ] Config JSON stringified properly
- [ ] "Copy Code" button works
- [ ] Copied confirmation shows
- [ ] Clipboard API works

### Live Preview
- [ ] Preview shows when toggled
- [ ] Widget renders in correct position
- [ ] Chat button appears with correct color
- [ ] Clicking button opens chat window
- [ ] Chat window displays correctly
- [ ] Header shows title/subtitle
- [ ] Greeting message appears
- [ ] Input field has correct placeholder

### Live Chat Functionality
- [ ] Can type message in input
- [ ] "Send" button works
- [ ] Message appears in chat (user bubble)
- [ ] Typing indicator shows
- [ ] Bot response appears (bot bubble)
- [ ] Timestamps display correctly
- [ ] Chat scrolls with new messages
- [ ] Enter key sends message

### API Integration
- [ ] `widgetApi.sendMessage()` called on send
- [ ] Response from backend displays
- [ ] Error handling works

---

## ⚙️ Settings Integration (`/settings`)

### Page Rendering
- [ ] Settings page loads
- [ ] Tab navigation works (API Keys/Language/Fallback/Profile)

### API Keys Tab
- [ ] All input fields render
- [ ] Password toggle buttons work (show/hide)
- [ ] WhatsApp fields save correctly
- [ ] Instagram fields save correctly
- [ ] OpenAI field saves correctly
- [ ] `settingsApi.updateApiKeys()` called
- [ ] Success notification shows

### Language Settings Tab
- [ ] Auto-detect checkbox works
- [ ] Default language dropdown works
- [ ] Supported languages checkboxes work
- [ ] Translation checkbox (disabled) shows
- [ ] `settingsApi.updateLanguage()` called
- [ ] Settings save successfully

### Fallback Responses Tab
- [ ] English fallback textareas render
- [ ] Nepali fallback textareas render
- [ ] All fields validate as required
- [ ] `settingsApi.updateFallback()` called
- [ ] Settings save successfully

### Profile Settings Tab
- [ ] Name field pre-fills
- [ ] Email field pre-fills
- [ ] Company field works
- [ ] Timezone dropdown works
- [ ] Notification checkboxes work
- [ ] Password fields validate (min 8 chars)
- [ ] Password confirmation matches
- [ ] `settingsApi.updateProfile()` called
- [ ] Profile updates successfully

### Settings Persistence
- [ ] Settings load from backend on mount
- [ ] Settings persist after page reload
- [ ] Each tab saves independently

---

## 🎨 UI/UX Verification

### Responsive Design
- [ ] Mobile view works (< 640px)
- [ ] Tablet view works (640px - 1024px)
- [ ] Desktop view works (> 1024px)
- [ ] Sidebar collapses on mobile
- [ ] Tables scroll horizontally on mobile
- [ ] Modals fit on small screens

### Loading States
- [ ] Spinners show during API calls
- [ ] Skeleton screens display (optional)
- [ ] Disabled states work on buttons
- [ ] Loading text shows ("Loading...", "Saving...")

### Error States
- [ ] Form validation errors display
- [ ] API error notifications show
- [ ] Error messages are user-friendly
- [ ] Retry buttons work

### Empty States
- [ ] "No agents" message shows
- [ ] "No KBs" message shows
- [ ] Empty state icons display
- [ ] Call-to-action buttons work

### Notifications
- [ ] Success notifications show (green)
- [ ] Error notifications show (red)
- [ ] Info notifications show (blue)
- [ ] Notifications auto-dismiss
- [ ] Multiple notifications stack

### Accessibility
- [ ] Forms have labels
- [ ] Buttons have aria-labels
- [ ] Colors have sufficient contrast
- [ ] Keyboard navigation works
- [ ] Focus states are visible

---

## 🔧 Technical Verification

### TypeScript
- [ ] No TypeScript errors in console
- [ ] All types imported correctly
- [ ] API responses match type definitions
- [ ] No `any` types used (or minimal)

### Performance
- [ ] Pages load quickly (< 2s)
- [ ] No unnecessary re-renders
- [ ] API calls not duplicated
- [ ] Images optimized (if any)
- [ ] Charts render smoothly

### Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge

### Network
- [ ] API calls succeed
- [ ] Error responses handled
- [ ] Timeouts handled (10s)
- [ ] Retry logic works (if implemented)

### State Management
- [ ] Zustand store works
- [ ] Global state updates correctly
- [ ] State persists where needed
- [ ] No state leaks between pages

---

## 🧪 Testing

### Manual Testing
- [ ] Login → Dashboard flow works
- [ ] Create agent flow works
- [ ] Upload KB flow works
- [ ] Edit settings flow works
- [ ] Logout flow works

### Error Scenarios
- [ ] Invalid login credentials handled
- [ ] Network error handled
- [ ] 404 errors handled
- [ ] 500 errors handled
- [ ] Validation errors shown

### Edge Cases
- [ ] Empty data lists handled
- [ ] Very long text handled
- [ ] Special characters in inputs
- [ ] Large file uploads (size limit)
- [ ] Simultaneous requests

---

## 🚀 Pre-Deployment

### Code Quality
- [ ] No console.errors in production
- [ ] No TODO comments critical for launch
- [ ] Code formatted consistently
- [ ] Comments added for complex logic

### Environment
- [ ] Production API URL configured
- [ ] HTTPS enforced
- [ ] Environment variables secured
- [ ] CORS configured correctly

### Build
- [ ] `npm run build` succeeds
- [ ] Build warnings addressed
- [ ] Bundle size acceptable (< 1MB)
- [ ] Production build tested

### Documentation
- [ ] README updated
- [ ] API integration doc complete
- [ ] Deployment guide created
- [ ] User guide created (optional)

---

## 📋 Post-Deployment

### Monitoring
- [ ] Error tracking set up (Sentry)
- [ ] Analytics configured (Google Analytics)
- [ ] Performance monitoring enabled
- [ ] Logs accessible

### User Testing
- [ ] Beta users can access
- [ ] Feedback collected
- [ ] Critical bugs fixed
- [ ] User guide provided

---

## 🐛 Known Issues

Document any known issues here:

1. **Issue**: [Description]
   - **Workaround**: [Solution]
   - **Status**: [Open/In Progress/Fixed]

2. **Issue**: WebSocket may disconnect on network change
   - **Workaround**: Page refresh reconnects
   - **Status**: Open - investigating reconnection logic

---

## ✨ Future Enhancements

- [ ] Add unit tests for components
- [ ] Add E2E tests with Cypress
- [ ] Implement React Query for caching
- [ ] Add internationalization (i18n)
- [ ] Implement dark mode
- [ ] Add keyboard shortcuts
- [ ] Optimize chart performance
- [ ] Add export functionality for analytics
- [ ] Implement file upload progress
- [ ] Add bulk operations for agents

---

**Checklist Completed By**: ________________  
**Date**: ________________  
**Version**: 1.0.0  
**Ready for Production**: [ ] Yes [ ] No

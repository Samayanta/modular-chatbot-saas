# Frontend Test Suite - Complete Package Installation Guide

## Required Dependencies

Add these dependencies to your `package.json`:

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/jest": "^29.5.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.1.0",
    "msw": "^1.3.0",
    "identity-obj-proxy": "^3.0.0"
  }
}
```

## Installation Commands

```bash
# Install all test dependencies
npm install --save-dev \
  @testing-library/react@^14.0.0 \
  @testing-library/jest-dom@^6.1.0 \
  @testing-library/user-event@^14.5.0 \
  @types/jest@^29.5.0 \
  jest@^29.7.0 \
  jest-environment-jsdom@^29.7.0 \
  ts-jest@^29.1.0 \
  msw@^1.3.0 \
  identity-obj-proxy@^3.0.0

# Or if using Yarn
yarn add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest jest jest-environment-jsdom ts-jest msw identity-obj-proxy
```

## NPM Scripts

Add to `package.json` scripts section:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

## Files Created

### Configuration Files
- ✅ `jest.config.js` - Updated with MSW support and coverage thresholds
- ✅ `src/tests/setup.ts` - Global test setup with MSW server initialization

### Test Utilities
- ✅ `src/tests/test-utils.tsx` - Custom render with providers
- ✅ `src/tests/mocks/apiMockHandlers.ts` - MSW handlers for all API routes
- ✅ `src/tests/mocks/mockWebSocket.ts` - WebSocket mock implementation
- ✅ `src/tests/mocks/data.ts` - Mock data objects
- ✅ `src/tests/mocks/fileMock.ts` - Static asset mock

### Page Tests (New/Enhanced)
- ✅ `src/tests/pages/dashboard-new.test.tsx` - Complete dashboard tests
- ✅ `src/tests/pages/agents-complete.test.tsx` - Complete agents tests
- ✅ `src/tests/pages/knowledge-base-complete.test.tsx` - Complete KB tests
- ✅ `src/tests/pages/web-widget-complete.test.tsx` - Complete widget tests
- ✅ `src/tests/pages/settings-complete.test.tsx` - Complete settings tests

### Component Tests
- ✅ `src/tests/components/shared-components.test.tsx` - Layout, Sidebar, TopBar, Modal, Toast tests

### Documentation
- ✅ `src/tests/TEST_SUITE_README.md` - Comprehensive test suite documentation

## Quick Start

1. **Install dependencies**:
   ```bash
   cd modular-chatbot-saas
   npm install
   ```

2. **Run tests**:
   ```bash
   npm test
   ```

3. **Generate coverage report**:
   ```bash
   npm test -- --coverage
   ```

4. **Watch mode for development**:
   ```bash
   npm test -- --watch
   ```

## Test Coverage Summary

### Pages Tested
1. ✅ Login Page - 11 test cases
2. ✅ Dashboard Page - 15 test cases
3. ✅ Agents Page - 17 test cases
4. ✅ Knowledge Base Page - 18 test cases
5. ✅ Web Widget Page - 17 test cases
6. ✅ Settings Page - 18 test cases

### Components Tested
7. ✅ Shared Components - 25+ test cases

### Total Test Cases: **120+**

## Features Tested

### Authentication & Authorization
- ✅ Login form validation
- ✅ Successful/failed login flows
- ✅ Token storage
- ✅ Logout functionality
- ✅ Password visibility toggle

### Dashboard & Analytics
- ✅ Real-time metrics display
- ✅ GPU usage monitoring
- ✅ Historical charts
- ✅ WebSocket updates
- ✅ Time range selection
- ✅ Error states and retry

### Agent Management
- ✅ Agent CRUD operations
- ✅ Start/stop agents
- ✅ KB assignment
- ✅ Queue monitoring
- ✅ Status updates via WebSocket
- ✅ Search and filtering

### Knowledge Base
- ✅ File upload (CSV/PDF)
- ✅ Drag-and-drop
- ✅ Website scraping
- ✅ File validation
- ✅ Embedding generation progress
- ✅ Chunk viewing

### Web Widget
- ✅ Snippet generation
- ✅ Copy-to-clipboard
- ✅ Live preview
- ✅ Message sending
- ✅ Theme/position customization
- ✅ Multi-language support

### Settings
- ✅ API key management
- ✅ Configuration updates
- ✅ Validation
- ✅ Test connections
- ✅ Export/import settings
- ✅ Reset to defaults

### Shared Components
- ✅ Navigation (Sidebar, TopBar)
- ✅ User menu and logout
- ✅ Notifications
- ✅ Search functionality
- ✅ Modals and toasts
- ✅ Loading states
- ✅ Error boundaries

## API Routes Mocked

All backend API routes are fully mocked using MSW:

### Auth Routes (4)
- POST /api/auth/login
- POST /api/auth/signup
- POST /api/auth/logout
- GET /api/auth/me

### Agent Routes (5)
- GET /api/agents
- POST /api/agents
- PATCH /api/agents/:id/status
- PATCH /api/agents/:id/kb
- DELETE /api/agents/:id

### Knowledge Base Routes (5)
- GET /api/kb
- POST /api/kb/upload
- POST /api/kb/scrape
- GET /api/kb/:id/chunks
- DELETE /api/kb/:id

### Widget Routes (3)
- GET /api/widget/:agentId/config
- POST /api/widget/:agentId/message
- PATCH /api/widget/:agentId/settings

### Settings Routes (2)
- GET /api/settings
- PATCH /api/settings

### Analytics Routes (2)
- GET /api/analytics/overview
- GET /api/analytics/history

**Total API Routes Mocked: 21**

## WebSocket Events Mocked

- ✅ Agent status updates
- ✅ Queue length changes
- ✅ GPU usage updates
- ✅ Message processed events
- ✅ Connection/disconnection handling

## Testing Best Practices Implemented

1. ✅ **Accessibility-first queries** - Using `getByRole`, `getByLabelText`
2. ✅ **User-centric testing** - Testing behavior, not implementation
3. ✅ **Async handling** - Proper `waitFor` usage
4. ✅ **Mock isolation** - Clean mocks between tests
5. ✅ **Error scenarios** - Testing success and failure paths
6. ✅ **Loading states** - Testing skeleton/spinner displays
7. ✅ **Real-time updates** - WebSocket simulation
8. ✅ **Multi-language** - Nepali/English/mixed support
9. ✅ **Form validation** - Client-side validation testing
10. ✅ **Network errors** - Handling connection failures

## Troubleshooting

### MSW Module Not Found
If you see "Cannot find module 'msw'", install it:
```bash
npm install --save-dev msw@^1.3.0
```

### TypeScript Errors
Ensure you have the latest type definitions:
```bash
npm install --save-dev @types/jest @types/node
```

### Test Timeouts
For slow tests, increase timeout in jest.config.js:
```javascript
module.exports = {
  testTimeout: 10000, // 10 seconds
  // ...
};
```

### React 18 Warnings
Use `@testing-library/react` v14+ for React 18 compatibility.

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Frontend Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --ci --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Next Steps

1. **Run the tests**: `npm test`
2. **Review coverage**: `npm test -- --coverage`
3. **Fix any failing tests** in your actual components to match the test expectations
4. **Integrate with CI/CD** for automated testing
5. **Add more tests** as you add new features

## Notes

- All test files use TypeScript for type safety
- MSW handlers can be easily extended for new API routes
- WebSocket mock supports multiple simultaneous connections
- Test data is centralized in `mocks/data.ts` for consistency
- Custom render function ensures all components have required providers

## Support

For issues or questions:
1. Check `TEST_SUITE_README.md` for detailed documentation
2. Review individual test files for examples
3. Consult React Testing Library docs: https://testing-library.com/react
4. MSW documentation: https://mswjs.io/docs/

---

**Test suite created for**: Modular Chatbot SaaS Platform
**Coverage target**: 70%+ (branches, functions, lines, statements)
**Total test files**: 11+
**Total test cases**: 120+

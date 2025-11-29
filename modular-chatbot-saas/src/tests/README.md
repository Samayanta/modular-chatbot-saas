# Frontend Test Suite Documentation

This directory contains comprehensive unit and integration tests for the chatbot SaaS frontend built with React, Next.js, and TypeScript.

## Test Structure

```
src/tests/
├── setup.ts                    # Jest setup and global mocks
├── mocks/
│   ├── data.ts                # Mock data (agents, KB, stats, settings)
│   └── api.ts                 # Mock API services and hooks
└── pages/
    ├── login.test.tsx         # Login page tests
    ├── dashboard.test.tsx     # Dashboard page tests
    ├── agents.test.tsx        # Agent management tests
    ├── knowledge-base.test.tsx # KB management tests
    ├── web-widget.test.tsx    # Widget configuration tests
    └── settings.test.tsx      # Settings page tests
```

## Technologies Used

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **ts-jest**: TypeScript support for Jest
- **jest-dom**: Custom DOM matchers

## Installation

Install required dependencies:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest ts-jest
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- login.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="validates email"
```

## Test Coverage Goals

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Test Categories

### 1. Login Tests (`login.test.tsx`)
Tests the authentication flow and form validation:
- ✅ Renders login form with all elements
- ✅ Email validation (required, format)
- ✅ Password validation (required, minimum length)
- ✅ Successful login and redirect
- ✅ Failed login error handling
- ✅ Demo login functionality
- ✅ Remember me checkbox
- ✅ Password visibility toggle
- ✅ Loading state during login
- ✅ Signup link navigation

**Total: 12 tests**

### 2. Dashboard Tests (`dashboard.test.tsx`)
Tests dashboard rendering, charts, and real-time updates:
- ✅ Renders stats cards with correct values
- ✅ Fetches dashboard data on mount
- ✅ Message volume chart renders
- ✅ Response time chart renders
- ✅ Agent status distribution chart
- ✅ Platform distribution chart
- ✅ Recent activity feed displays
- ✅ Active agents table displays
- ✅ WebSocket real-time updates
- ✅ Auto-refresh every 30 seconds
- ✅ Loading state
- ✅ Error state
- ✅ Refresh button functionality
- ✅ Empty state (no agents)
- ✅ GPU usage indicator with color coding
- ✅ Error rate indicator

**Total: 16 tests**

### 3. Agent Management Tests (`agents.test.tsx`)
Tests CRUD operations, filtering, and agent control:
- ✅ Renders agents list
- ✅ Opens create agent modal
- ✅ Validates agent creation form
- ✅ Successfully creates new agent
- ✅ Edits existing agent
- ✅ Deletes agent with confirmation
- ✅ Starts inactive agent
- ✅ Stops active agent
- ✅ Filters agents by status
- ✅ Filters agents by platform
- ✅ Searches agents by name
- ✅ Assigns knowledge base to agent
- ✅ Displays agent queue length
- ✅ Loading state
- ✅ Empty state
- ✅ Error handling

**Total: 16 tests**

### 4. Knowledge Base Tests (`knowledge-base.test.tsx`)
Tests KB upload, scraping, and chunk viewing:
- ✅ Renders knowledge bases list
- ✅ Opens upload modal
- ✅ Validates file upload form
- ✅ Uploads PDF successfully
- ✅ Uploads CSV successfully
- ✅ Rejects invalid file types
- ✅ Opens website scraping modal
- ✅ Validates website URL
- ✅ Scrapes website successfully
- ✅ Views KB chunks
- ✅ Paginates through chunks
- ✅ Deletes KB with confirmation
- ✅ Generates embeddings
- ✅ Displays correct status badges
- ✅ Filters by agent
- ✅ Searches knowledge bases
- ✅ Empty state
- ✅ Loading state
- ✅ Error handling

**Total: 19 tests**

### 5. Web Widget Tests (`web-widget.test.tsx`)
Tests widget customization and preview:
- ✅ Renders widget configuration panel
- ✅ Selects agent and loads config
- ✅ Updates primary color
- ✅ Changes widget position
- ✅ Updates greeting message (with Nepali support)
- ✅ Saves widget configuration
- ✅ Updates live preview in real-time
- ✅ Generates embed code snippet
- ✅ Copies embed code to clipboard
- ✅ Tests widget chat functionality
- ✅ Changes widget size
- ✅ Toggles widget features (sound, emoji)
- ✅ Validates color format
- ✅ Previews in light/dark themes
- ✅ Shows responsive preview for mobile
- ✅ Empty state without agent selection
- ✅ Error handling
- ✅ Unsaved changes warning

**Total: 18 tests**

### 6. Settings Tests (`settings.test.tsx`)
Tests all settings sections and updates:
- ✅ Renders all settings sections
- ✅ Loads settings on mount
- ✅ Displays and updates API keys
- ✅ Toggles API key visibility
- ✅ Updates language settings
- ✅ Updates fallback responses (English + Nepali)
- ✅ Updates profile settings
- ✅ Toggles email notifications
- ✅ Updates timezone
- ✅ Validates profile form
- ✅ Validates email format
- ✅ Warns about unsaved changes
- ✅ Resets to defaults
- ✅ Shows success notifications
- ✅ Error handling
- ✅ Loading state
- ✅ Tab navigation

**Total: 17 tests**

## Grand Total: **98 Tests**

## Mock Data

All mock data is centralized in `mocks/data.ts`:

- **mockAgents**: 3 sample agents (WhatsApp, Instagram, Website)
- **mockKnowledgeBases**: 3 KBs with different sources (PDF, CSV, website)
- **mockDashboardStats**: Complete dashboard metrics with activity feed
- **mockUser**: Test user for authentication
- **mockSettings**: All settings with API keys, language, fallback, profile
- **mockChunks**: Sample KB chunks for testing
- **mockChartData**: Chart datasets for dashboard
- **mockApiResponses**: All API endpoint responses

## Mock APIs

All API services are mocked in `mocks/api.ts`:

- `mockAgentApi`: Agent CRUD operations
- `mockKbApi`: KB upload, scraping, chunks
- `mockAnalyticsApi`: Dashboard stats and metrics
- `mockAuthApi`: Login, signup, authentication
- `mockSettingsApi`: Settings management
- `mockWidgetApi`: Widget configuration
- `mockUseAppStore`: Zustand store mock
- `mockUseSocket`: Socket.io hook mock
- `mockAuthService`: Auth service mock

## Writing New Tests

### Test Structure Template

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import YourComponent from '@/pages/your-component';
import { mockApi } from '../mocks/api';

describe('YourComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: Brief description of what is being tested
   */
  it('should do something', async () => {
    const user = userEvent.setup();
    render(<YourComponent />);

    // Arrange: Set up test data and mocks
    mockApi.someMethod.mockResolvedValue(mockData);

    // Act: Perform user interactions
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    // Assert: Verify expected outcomes
    await waitFor(() => {
      expect(mockApi.someMethod).toHaveBeenCalled();
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });
});
```

### Best Practices

1. **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
2. **Wait for async operations**: Always use `waitFor` for API calls
3. **User-centric tests**: Simulate real user interactions with `userEvent`
4. **Clear mocks**: Reset all mocks in `beforeEach` hook
5. **Descriptive test names**: Use clear, action-oriented test descriptions
6. **Comments**: Add JSDoc-style comments explaining test purpose
7. **Arrange-Act-Assert**: Follow AAA pattern for test structure
8. **Mock at boundaries**: Mock external dependencies (API, router, storage)

### Common Patterns

#### Testing Form Validation
```typescript
// Empty field
await user.click(submitButton);
expect(screen.getByText(/field is required/i)).toBeInTheDocument();

// Invalid format
await user.type(input, 'invalid-value');
expect(screen.getByText(/invalid format/i)).toBeInTheDocument();
```

#### Testing API Calls
```typescript
await user.click(button);
await waitFor(() => {
  expect(mockApi.method).toHaveBeenCalledWith(expectedData);
});
```

#### Testing Loading States
```typescript
mockApi.method.mockImplementationOnce(
  () => new Promise(resolve => setTimeout(resolve, 100))
);
expect(screen.getByText(/loading/i)).toBeInTheDocument();
await waitFor(() => {
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

#### Testing Error States
```typescript
mockApi.method.mockRejectedValueOnce(new Error('Failed'));
await waitFor(() => {
  expect(screen.getByText(/error/i)).toBeInTheDocument();
});
```

## Accessibility Testing

All tests use accessible queries:
- `getByRole`: Buttons, links, inputs
- `getByLabelText`: Form fields
- `getByText`: Content verification
- Avoid `getByTestId` unless necessary

## Continuous Integration

Tests are run automatically on:
- Every commit (pre-commit hook)
- Pull requests
- Before deployment

## Debugging Tests

```bash
# Run with verbose output
npm test -- --verbose

# Run in debug mode (Chrome DevTools)
node --inspect-brk node_modules/.bin/jest --runInBand

# Run single test file with logs
npm test -- login.test.tsx --verbose
```

## Known Limitations

1. Chart.js canvas rendering cannot be fully tested (requires visual snapshot testing)
2. WebSocket real-time updates are mocked (not testing actual socket connection)
3. File upload testing uses mock File objects (not real file I/O)
4. Router navigation is mocked (not testing actual Next.js routing)

## Future Improvements

- [ ] Add E2E tests with Cypress or Playwright
- [ ] Add visual regression tests with Percy or Chromatic
- [ ] Add performance tests (Lighthouse CI)
- [ ] Add accessibility audits (axe-core)
- [ ] Increase coverage to 80%+
- [ ] Add mutation testing (Stryker)

## Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [User Event API](https://testing-library.com/docs/user-event/intro)

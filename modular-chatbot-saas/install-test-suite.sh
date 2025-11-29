#!/bin/bash

# Frontend Test Suite - Installation Script
# Run this to set up the complete test suite

echo "================================================"
echo "Frontend Test Suite Installation"
echo "Modular Chatbot SaaS Platform"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from project root."
    exit 1
fi

echo "📦 Installing test dependencies..."
echo ""

# Install all required dependencies
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

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installed successfully!"
else
    echo ""
    echo "❌ Dependency installation failed. Please check errors above."
    exit 1
fi

echo ""
echo "================================================"
echo "Installation Complete!"
echo "================================================"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Review the test suite:"
echo "   - Read: FRONTEND_TEST_SUITE_COMPLETE.md"
echo "   - Read: src/tests/TEST_SUITE_README.md"
echo ""
echo "2. Run tests:"
echo "   npm test"
echo ""
echo "3. View coverage:"
echo "   npm test -- --coverage"
echo ""
echo "4. Watch mode:"
echo "   npm test -- --watch"
echo ""
echo "================================================"
echo "Test Files Created:"
echo "================================================"
echo ""
echo "📁 Configuration (3 files)"
echo "   ✅ jest.config.js (updated)"
echo "   ✅ src/tests/setup.ts (updated)"
echo "   ✅ src/tests/test-utils.tsx (new)"
echo ""
echo "📁 Mocks (4 files)"
echo "   ✅ src/tests/mocks/apiMockHandlers.ts (new)"
echo "   ✅ src/tests/mocks/mockWebSocket.ts (new)"
echo "   ✅ src/tests/mocks/data.ts (new)"
echo "   ✅ src/tests/mocks/fileMock.ts (new)"
echo ""
echo "📁 Page Tests (5 new files)"
echo "   ✅ src/tests/pages/dashboard-new.test.tsx"
echo "   ✅ src/tests/pages/agents-complete.test.tsx"
echo "   ✅ src/tests/pages/knowledge-base-complete.test.tsx"
echo "   ✅ src/tests/pages/web-widget-complete.test.tsx"
echo "   ✅ src/tests/pages/settings-complete.test.tsx"
echo ""
echo "📁 Component Tests (1 new file)"
echo "   ✅ src/tests/components/shared-components.test.tsx"
echo ""
echo "📁 Documentation (3 files)"
echo "   ✅ FRONTEND_TEST_SUITE_COMPLETE.md"
echo "   ✅ src/tests/TEST_SUITE_README.md"
echo "   ✅ FOLDER_STRUCTURE_TESTS.md"
echo "   ✅ QUICK_REFERENCE.md"
echo ""
echo "================================================"
echo "Test Coverage:"
echo "================================================"
echo ""
echo "✅ 120+ test cases"
echo "✅ 21 API routes mocked"
echo "✅ 4 WebSocket event types"
echo "✅ 70%+ coverage target"
echo ""
echo "Happy Testing! 🚀"
echo ""

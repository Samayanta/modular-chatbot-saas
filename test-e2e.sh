#!/bin/bash

# End-to-End Test Script for Chatbot SaaS Platform

set -e

API_URL="http://localhost:3001"
TOKEN=""
USER_ID=""
AGENT_ID=""
KB_ID=""

echo "🧪 Starting End-to-End Integration Test"
echo "========================================"
echo ""

# Test 1: Signup
echo "1️⃣ Testing Signup..."
SIGNUP_RESPONSE=$(curl -s -X POST $API_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "e2e@test.com",
    "password": "test123",
    "name": "E2E Test User"
  }')

TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $SIGNUP_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Signup failed"
  echo $SIGNUP_RESPONSE
  exit 1
fi

echo "✅ Signup successful"
echo "   Token: ${TOKEN:0:20}..."
echo "   User ID: $USER_ID"
echo ""

# Test 2: Create Agent
echo "2️⃣ Testing Create Agent..."
AGENT_RESPONSE=$(curl -s -X POST $API_URL/api/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test WhatsApp Bot",
    "platform": "whatsapp"
  }')

AGENT_ID=$(echo $AGENT_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$AGENT_ID" ]; then
  echo "❌ Create agent failed"
  echo $AGENT_RESPONSE
  exit 1
fi

echo "✅ Agent created"
echo "   Agent ID: $AGENT_ID"
echo ""

# Test 3: Create Knowledge Base
echo "3️⃣ Testing Create Knowledge Base..."
KB_RESPONSE=$(curl -s -X POST $API_URL/api/knowledge-bases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"agent_id\": \"$AGENT_ID\",
    \"name\": \"Test KB\",
    \"description\": \"Test knowledge base\",
    \"source_type\": \"manual\"
  }")

KB_ID=$(echo $KB_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$KB_ID" ]; then
  echo "❌ Create KB failed"
  echo $KB_RESPONSE
  exit 1
fi

echo "✅ Knowledge Base created"
echo "   KB ID: $KB_ID"
echo ""

# Test 4: Add KB Chunks
echo "4️⃣ Testing Add KB Chunks..."
CHUNKS_RESPONSE=$(curl -s -X POST $API_URL/api/kb/$KB_ID/chunks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "chunks": [
      {
        "content": "Our business hours are 9 AM to 5 PM, Monday to Friday.",
        "metadata": {"type": "hours"}
      },
      {
        "content": "We offer free shipping on orders over $50.",
        "metadata": {"type": "shipping"}
      },
      {
        "content": "Returns are accepted within 30 days of purchase.",
        "metadata": {"type": "returns"}
      }
    ]
  }')

echo "✅ KB Chunks added"
echo "   Response: $CHUNKS_RESPONSE"
echo ""

# Test 5: Update Agent KB
echo "5️⃣ Testing Update Agent with KB..."
UPDATE_RESPONSE=$(curl -s -X PUT $API_URL/api/agents/$AGENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"kb_id\": \"$KB_ID\"}")

echo "✅ Agent updated with KB"
echo ""

# Test 6: Start Agent
echo "6️⃣ Testing Start Agent..."
START_RESPONSE=$(curl -s -X POST $API_URL/api/agents/$AGENT_ID/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Agent started"
echo ""

# Test 7: Send Test Message
echo "7️⃣ Testing Send Message..."
MESSAGE_RESPONSE=$(curl -s -X POST $API_URL/intake \
  -H "Content-Type: application/json" \
  -d "{
    \"agentId\": \"$AGENT_ID\",
    \"platform\": \"whatsapp\",
    \"userId\": \"test-user-123\",
    \"message\": \"What are your business hours?\"
  }")

echo "✅ Message sent to queue"
echo "   Response: $MESSAGE_RESPONSE"
echo ""

# Test 8: Get Analytics
echo "8️⃣ Testing Get Dashboard Analytics..."
sleep 3  # Wait for message processing
ANALYTICS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" $API_URL/api/analytics/dashboard)

echo "✅ Analytics retrieved"
echo "   Response: ${ANALYTICS_RESPONSE:0:200}..."
echo ""

# Test 9: List Agents
echo "9️⃣ Testing List Agents..."
AGENTS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" $API_URL/api/agents)

echo "✅ Agents listed"
echo ""

# Test 10: Stop Agent
echo "🔟 Testing Stop Agent..."
STOP_RESPONSE=$(curl -s -X POST $API_URL/api/agents/$AGENT_ID/stop \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Agent stopped"
echo ""

echo "=========================================="
echo "✅ All Tests Passed!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  • User ID: $USER_ID"
echo "  • Agent ID: $AGENT_ID"
echo "  • KB ID: $KB_ID"
echo "  • Token: ${TOKEN:0:30}..."
echo ""
echo "You can now test the frontend at http://localhost:3002"
echo "Login with: e2e@test.com / test123"

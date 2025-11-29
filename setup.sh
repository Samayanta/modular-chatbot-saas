#!/bin/bash

# Quick Setup Script for Chatbot SaaS Platform
# Run with: bash setup.sh

set -e

echo "🚀 Chatbot SaaS Platform - Quick Setup"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo -n "📦 Checking PostgreSQL... "
if pg_isready -q; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "Please start PostgreSQL first"
    exit 1
fi

# Check if Redis is running
echo -n "📦 Checking Redis... "
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC} Redis not running (optional for now)"
fi

# Install backend dependencies
echo ""
echo "📥 Installing backend dependencies..."
npm install

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=chatbot_saas
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Servers
PORT=3000
API_PORT=3001

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=dev-secret-key-$(openssl rand -hex 16)
EOF
    echo -e "${GREEN}✓${NC} Created .env file"
else
    echo -e "${YELLOW}⚠${NC} .env file already exists, skipping"
fi

# Setup database
echo ""
echo "🗄️  Setting up database..."
echo -n "Creating database... "
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw chatbot_saas; then
    echo -e "${YELLOW}already exists${NC}"
else
    psql -U postgres -c "CREATE DATABASE chatbot_saas;" > /dev/null 2>&1
    echo -e "${GREEN}✓${NC}"
fi

echo -n "Running migrations... "
psql -U postgres -d chatbot_saas -f database/schema.sql > /dev/null 2>&1
echo -e "${GREEN}✓${NC}"

# Install frontend dependencies
echo ""
echo "📥 Installing frontend dependencies..."
cd modular-chatbot-saas
npm install

# Create frontend .env.local
if [ ! -f .env.local ]; then
    echo ""
    echo "📝 Creating frontend .env.local..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001/api
EOF
    echo -e "${GREEN}✓${NC} Created .env.local"
fi

cd ..

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "📚 Next Steps:"
echo ""
echo "1. Start the backend servers:"
echo -e "   ${YELLOW}npm run start:both${NC}"
echo ""
echo "2. In another terminal, start the frontend:"
echo -e "   ${YELLOW}cd modular-chatbot-saas && npm run dev${NC}"
echo ""
echo "3. Visit http://localhost:3001 (or the port Next.js shows)"
echo ""
echo "4. Create an account and start using the platform!"
echo ""
echo "📖 Documentation:"
echo "   - INTEGRATION_COMPLETE.md - Full overview"
echo "   - BACKEND_INTEGRATION.md - API documentation"
echo ""

#!/bin/bash

# Render Deployment Script
# This script deploys the chatbot SaaS to Render.com using their Blueprint

set -e

echo "🚀 Deploying Chatbot SaaS to Render.com"
echo "========================================"
echo ""

# Check if logged in to Render
echo "✓ Checking Render authentication..."
render whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Render. Please run: render login"
    exit 1
fi
echo "✓ Authenticated with Render"
echo ""

# Check if git repository exists
echo "✓ Checking git repository..."
if [ ! -d .git ]; then
    echo "❌ No git repository found. Please initialize git first."
    exit 1
fi
echo "✓ Git repository exists"
echo ""

# Check if GitHub remote exists
echo "✓ Checking GitHub remote..."
GITHUB_REPO=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$GITHUB_REPO" ]; then
    echo "❌ No GitHub remote found. Please push to GitHub first."
    exit 1
fi
echo "✓ GitHub remote: $GITHUB_REPO"
echo ""

echo "📋 Deployment Plan:"
echo "-------------------"
echo "The following services will be deployed:"
echo ""
echo "1. PostgreSQL (pgvector) - Database with vector search"
echo "2. Redis - Queue storage for BullMQ"
echo "3. API Server - Express REST API (port 3001)"
echo "4. Message Processor - BullMQ worker with LLM"
echo "5. Frontend - Next.js web app (port 3000)"
echo ""

echo "💡 Important Notes:"
echo "-------------------"
echo "• First deployment takes ~10-15 minutes"
echo "• Free tier services sleep after 15 min inactivity"
echo "• PostgreSQL gets 1GB storage"
echo "• Redis gets 1GB storage"
echo "• All services get HTTPS automatically"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLYY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "🔧 Manual Deployment Steps:"
echo "============================"
echo ""
echo "Since Render CLI doesn't support Blueprint deployment directly,"
echo "please follow these steps:"
echo ""
echo "1. Go to: https://dashboard.render.com/blueprints"
echo "2. Click 'New Blueprint Instance'"
echo "3. Connect your GitHub repository:"
echo "   Repository: $GITHUB_REPO"
echo "4. Select branch: master"
echo "5. Blueprint file: render.yaml (auto-detected)"
echo "6. Click 'Apply'"
echo ""
echo "Render will automatically:"
echo "  ✓ Create all 5 services"
echo "  ✓ Set up environment variables"
echo "  ✓ Link services together"
echo "  ✓ Start building and deploying"
echo ""
echo "📊 Monitor deployment at:"
echo "https://dashboard.render.com"
echo ""
echo "⏱️  Expected completion: 10-15 minutes"
echo ""

# Open dashboard
read -p "Open Render Dashboard now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open "https://dashboard.render.com/blueprints" 2>/dev/null || \
    xdg-open "https://dashboard.render.com/blueprints" 2>/dev/null || \
    echo "Please visit: https://dashboard.render.com/blueprints"
fi

echo ""
echo "✅ Repository ready for deployment!"
echo ""
echo "📖 For detailed instructions, see: PRODUCTION_DEPLOY.md"
echo ""

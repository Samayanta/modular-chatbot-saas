#!/bin/bash

echo "🚀 Starting Chatbot SaaS Platform with Docker"
echo "=============================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.docker .env
    echo "⚠️  Please edit .env file and update:"
    echo "   - POSTGRES_PASSWORD"
    echo "   - JWT_SECRET"
    echo ""
    read -p "Press Enter to continue with default values or Ctrl+C to exit and edit .env..."
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Build and start services
echo ""
echo "🔨 Building Docker images (this may take a few minutes)..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
echo ""

# Wait for PostgreSQL
echo -n "Waiting for PostgreSQL..."
until docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo -n "."
    sleep 2
done
echo " ✅"

# Wait for Redis
echo -n "Waiting for Redis..."
until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
    echo -n "."
    sleep 2
done
echo " ✅"

# Wait for Ollama
echo -n "Waiting for Ollama..."
until curl -s http://localhost:11434/api/tags > /dev/null 2>&1; do
    echo -n "."
    sleep 2
done
echo " ✅"

# Wait for API
echo -n "Waiting for API Server..."
until curl -s http://localhost:3001/health > /dev/null 2>&1; do
    echo -n "."
    sleep 2
done
echo " ✅"

# Wait for Frontend
echo -n "Waiting for Frontend..."
until curl -s http://localhost:3000 > /dev/null 2>&1; do
    echo -n "."
    sleep 2
done
echo " ✅"

echo ""
echo "=============================================="
echo "✅ All services are running!"
echo "=============================================="
echo ""
echo "🌐 Access your application:"
echo "   Frontend:  http://localhost:3000"
echo "   API:       http://localhost:3001"
echo "   Processor: http://localhost:4000"
echo "   Ollama:    http://localhost:11434"
echo ""
echo "📝 Test credentials:"
echo "   Email:    e2e@test.com"
echo "   Password: test123"
echo ""
echo "📊 Useful commands:"
echo "   View logs:        docker-compose logs -f"
echo "   Stop services:    docker-compose down"
echo "   Restart:          docker-compose restart"
echo "   Check status:     docker-compose ps"
echo ""
echo "📚 Documentation:"
echo "   DOCKER_DEPLOYMENT.md - Full deployment guide"
echo "   START_HERE.md        - Usage guide"
echo ""
echo "🎉 Happy chatbot building!"

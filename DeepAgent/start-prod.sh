#!/bin/bash

# Production start script using Docker

echo "🚀 Starting Multi-Agent Business Website Generator (Production Mode)"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found. Please create one from .env.example"
    exit 1
fi

# Build and start containers
echo "📦 Building and starting Docker containers..."
docker-compose up -d --build

echo ""
echo "✅ Services started!"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"

#!/bin/bash

# Start script for development mode

echo "🚀 Starting Multi-Agent Business Website Generator"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Please create one from .env.example"
    echo ""
fi

# Start backend in background
echo "📦 Starting backend API..."
python -m uvicorn api.main:app --reload --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Check if frontend dependencies are installed
echo "🎨 Checking frontend dependencies..."
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies (this may take a minute)..."
    cd frontend || exit
    npm install
    cd ..
    echo "✅ Frontend dependencies installed!"
    echo ""
fi

# Start frontend
echo "🎨 Starting frontend..."
cd frontend || exit
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Services started!"
echo "   Backend API: http://localhost:8000"
echo "   Frontend UI: http://localhost:5173"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait

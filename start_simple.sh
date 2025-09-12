#!/bin/bash

echo "🚀 Starting Agentic Clubs Backend (Simplified Version)"
echo "=================================================="

# Check if Redis is running
echo "🔍 Checking Redis..."
if ! redis-cli ping > /dev/null 2>&1; then
    echo "⚠️  Redis is not running. Starting Redis..."
    brew services start redis
    sleep 2
fi

# Check if Redis is now accessible
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is running"
else
    echo "❌ Failed to start Redis. Please start it manually: brew services start redis"
    exit 1
fi

# Navigate to backend directory
cd backend

echo "🐍 Starting Python backend..."
echo "📡 Backend will be available at: http://localhost:5000"
echo "💡 This is a simplified version for demonstration purposes"
echo ""

# Run the simplified backend directly
python app_simple.py

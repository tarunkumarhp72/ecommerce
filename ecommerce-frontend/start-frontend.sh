#!/bin/bash

# React Frontend Startup Script for ShopEase

echo "🚀 Starting ShopEase React Frontend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if backend is running
echo "🔍 Checking if Django backend is running..."
if curl -s http://localhost:8000/api/products/ > /dev/null; then
    echo "✅ Backend is running on http://localhost:8000"
else
    echo "⚠️  Warning: Backend doesn't seem to be running on http://localhost:8000"
    echo "   Please make sure to start the Django backend first:"
    echo "   cd ../ecommerce_project && ./start_server.sh"
    echo ""
fi

# Start the React development server
echo "🌐 Starting React development server..."
echo "📱 Frontend will be available at: http://localhost:3000"
echo "🔗 Backend API should be at: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"

npm start

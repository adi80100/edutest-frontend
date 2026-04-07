#!/bin/bash

echo "🚀 Starting EduTest Application..."
echo ""

# Function to kill background processes on script exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set trap to call cleanup function on script exit
trap cleanup SIGINT SIGTERM EXIT

# Start Backend
echo "📊 Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start Frontend
echo "🎨 Starting Frontend Server..."
cd ../edutest-frontend-vite
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting up!"
echo ""
echo "📊 Backend running on: http://localhost:5001"
echo "🎨 Frontend running on: http://localhost:5173"
echo ""
echo "👤 Demo Accounts:"
echo "📧 Admin: admin@edutest.com / admin123"
echo "📧 Student: student@edutest.com / student123"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for background processes
wait
#!/bin/bash
echo "============================================"
echo "  A320 MaintSys - Starting Up"
echo "============================================"

# Install if needed
if [ ! -d "node_modules" ]; then
  echo "[1/3] Installing dependencies..."
  npm install --legacy-peer-deps
fi

# Start dev server in background
echo "[2/3] Starting dev server..."
npm run dev &
DEV_PID=$!
sleep 3

# Start tunnel
echo "[3/3] Starting tunnel..."
npx localtunnel --port 5173 --print-requests &
TUNNEL_PID=$!

echo ""
echo "============================================"
echo "  Dev:    http://localhost:5173"
echo "  Check terminal for public tunnel URL"
echo "============================================"

# Wait for Ctrl+C
trap "kill $DEV_PID $TUNNEL_PID 2>/dev/null; exit" SIGINT SIGTERM
wait

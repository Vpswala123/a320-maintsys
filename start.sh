#!/bin/bash
echo ""
echo "╔════════════════════════════════════════╗"
echo "║       A320 MaintSys — Starting...      ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "⚠️  .env file not found. Copying from .env.example..."
  cp .env.example .env
  echo "📝 Please fill in your Supabase credentials in .env"
fi

# Start dev server
echo "🚀 Starting Vite dev server..."
npm run dev &
DEV_PID=$!
sleep 3

# Start tunnel
echo "🌐 Creating public tunnel for mobile/AR access..."
npx localtunnel --port 5173 2>&1 | tee /tmp/tunnel.log &
TUNNEL_PID=$!
sleep 3

# Extract and display tunnel URL
TUNNEL_URL=$(grep -o 'https://[^[:space:]]*' /tmp/tunnel.log | head -1)
echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║  ✅ A320 MaintSys is RUNNING                      ║"
echo "║                                                    ║"
echo "║  Local:   http://localhost:5173                   ║"
echo "║  Public:  $TUNNEL_URL"
echo "║                                                    ║"
echo "║  📱 Share public URL for mobile + AR access       ║"
echo "║  📡 GitHub Pages: https://YOUR_USER.github.io/... ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Start auto git push
bash scripts/git_auto_push.sh &

wait $DEV_PID

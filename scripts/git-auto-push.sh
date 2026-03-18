#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "=== A320 MaintSys — Git Auto Push ==="
echo "Watching for file changes..."

while true; do
  # Check for changes
  if [ -n "$(git status --porcelain)" ]; then
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    git add -A
    git commit -m "auto: changes at $TIMESTAMP"
    git push origin main 2>/dev/null || git push origin master 2>/dev/null
    echo "[$TIMESTAMP] Pushed changes"
  fi
  sleep 30
done

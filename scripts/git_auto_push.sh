#!/bin/bash
echo "👀 Watching for file changes..."
while inotifywait -r -e modify,create,delete ./src ./public ./manuals 2>/dev/null; do
  sleep 2  # debounce
  CHANGED=$(git diff --name-only)
  if [ -n "$CHANGED" ]; then
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    git add .
    git commit -m "auto: changes at $TIMESTAMP"
    git push origin main
    echo "✅ Pushed to GitHub at $TIMESTAMP"
  fi
done

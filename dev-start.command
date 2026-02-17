#!/bin/bash
cd "$(dirname "$0")"

# Kill any existing dev processes on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Build core first, then start web dev server
npm run --workspace @color-tool/core build && \
npm run --workspace @color-tool/web dev &

# Wait for server to start
sleep 3

# Open in browser
open http://localhost:3000

wait

#!/bin/bash

# Kill all processes on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo "Dev server stopped."

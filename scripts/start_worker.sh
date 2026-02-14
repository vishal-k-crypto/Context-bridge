#!/bin/bash
# ===========================================
# MCP Worker Startup Script (Claude CLI Mode)
# ===========================================
# This script starts the MCP Worker with Claude CLI

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "╭──────────────────────────────────────────────────────────────────╮"
echo "│                                                                  │"
echo "│  🏭 MCP Worker - Claude CLI Mode                                │"
echo "│                                                                  │"
echo "╰──────────────────────────────────────────────────────────────────╯"
echo ""

# Navigate to project root
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)
echo "📁 Project root: $PROJECT_ROOT"

# Check for .env.local and load it
if [ -f ".env.local" ]; then
    echo "✅ Loading .env.local..."
    export $(grep -v '^#' .env.local | xargs)
else
    echo -e "${YELLOW}⚠️  No .env.local found. Create one from .env.example${NC}"
fi

# Check required environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL not set!${NC}"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo -e "${RED}❌ SUPABASE_SERVICE_KEY not set!${NC}"
    exit 1
fi

# Export for the worker
export SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"

# Check Claude CLI
if command -v claude &> /dev/null; then
    echo "✅ Claude CLI found"
else
    echo -e "${RED}❌ Claude CLI not found. Install it from: https://github.com/anthropics/claude-cli${NC}"
    exit 1
fi

echo ""
echo "🔧 Configuration:"
echo "   LLM: Claude CLI"
echo "   Supabase: ${SUPABASE_URL:0:40}..."
echo ""

# Activate virtual environment if exists (for supabase-py)
if [ -d "venv" ]; then
    echo "✅ Activating virtual environment..."
    source venv/bin/activate
elif [ -d "mcp/.venv" ]; then
    source mcp/.venv/bin/activate
fi

echo ""
echo "🚀 Starting MCP Worker..."
echo "   Press Ctrl+C to stop"
echo ""

# Run the worker
python scripts/mcp_worker.py

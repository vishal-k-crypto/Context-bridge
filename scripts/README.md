# MCP Worker Scripts

This directory contains scripts for running the MCP generation backend worker.

## Quick Start

### 1. Setup Supabase Database

Run the SQL schema in your Supabase project:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Open the SQL Editor
3. Copy and paste the contents of `supabase_schema.sql`
4. Click "Run"

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` in the project root and fill in:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. Install Dependencies

```bash
# Navigate to mcp folder and create virtual environment
cd mcp
python3 -m venv .venv
source .venv/bin/activate

# Install helpermcp with anthropic and supabase extras
pip install -e ".[anthropic,supabase]"
```

### 4. Start Docker (Required for Sandbox)

Make sure Docker Desktop is running. The worker uses Docker to verify generated MCP servers.

### 5. Run the Worker

```bash
# From project root
./scripts/start_worker.sh

# Or manually:
cd mcp && source .venv/bin/activate
cd ..
python scripts/mcp_worker.py
```

## Files

| File | Description |
|------|-------------|
| `mcp_worker.py` | Main worker that polls Supabase and processes requests |
| `start_worker.sh` | Startup script with environment setup |
| `supabase_schema.sql` | Database schema for Supabase |

## How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend UI   │────▶│    Supabase     │◀────│   MCP Worker    │
│  MCPBuilderUI   │     │  (PostgreSQL)   │     │  (Python)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │                        │
                                │    ┌───────────────────┘
                                │    │
                                ▼    ▼
                        ┌─────────────────┐
                        │   HelperMCP     │
                        │   Pipeline      │
                        │                 │
                        │ Scout ──────────│──▶ Discovery
                        │ Architect ──────│──▶ Scoring
                        │ Coder ──────────│──▶ Generation
                        │ Sandbox ────────│──▶ Verification
                        └─────────────────┘
```

1. **User submits request** via the website's Live Demo
2. **Frontend** validates coupon and creates `mcp_requests` entry in Supabase
3. **Worker** polls for pending requests
4. **Worker** runs HelperMCP Pipeline:
   - Scout discovers SDK/docs
   - Architect scores and filters tools
   - Coder generates FastMCP-compliant Python
   - Sandbox verifies in Docker container
5. **Worker** saves result to `mcp_results` and updates status
6. **Frontend** receives real-time updates via Supabase subscription

## Troubleshooting

### "No module named supabase"
```bash
pip install supabase
```

### "No module named helpermcp"
```bash
cd mcp && pip install -e .
```

### "Docker not running"
Start Docker Desktop and wait for it to fully load.

### "ANTHROPIC_API_KEY not set"
Add your Claude API key to `.env.local`

### Worker not picking up requests
1. Check Supabase connection in worker logs
2. Verify `mcp_requests` table exists
3. Check if there are pending requests with `status = 'pending'`

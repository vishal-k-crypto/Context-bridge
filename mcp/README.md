# 🏭 HelperMCP - The Autonomous MCP Server Factory

<div align="center">

**Transform Your Goals Into Production-Ready AI Tools**

*Give it a goal → Get certified, LLM-steerable MCP tools*

[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![FastMCP](https://img.shields.io/badge/FastMCP-2.0+-green.svg)](https://github.com/jlowin/fastmcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 📖 Table of Contents

1. [What is HelperMCP?](#-what-is-helpermcp)
2. [Why HelperMCP?](#-why-helpermcp)
3. [How It Works (The Simple Version)](#-how-it-works-the-simple-version)
4. [Prerequisites](#-prerequisites)
5. [Installation (Step-by-Step)](#-installation-step-by-step)
6. [Your First Run (Complete Walkthrough)](#-your-first-run-complete-walkthrough)
7. [Understanding the Output](#-understanding-the-output)
8. [All CLI Commands Explained](#-all-cli-commands-explained)
9. [The Agent Architecture](#-the-agent-architecture)
10. [Three-Dimensional Scoring System](#-three-dimensional-scoring-system)
11. [Configuration Guide](#-configuration-guide)
12. [Real-World Examples](#-real-world-examples)
13. [Troubleshooting](#-troubleshooting)
14. [FAQ](#-faq)
15. [Project Structure](#-project-structure)
16. [Contributing](#-contributing)

---

## 🌟 What is HelperMCP?

**HelperMCP** is an intelligent AI agent system that automatically creates tools for AI assistants like Claude, ChatGPT, or any LLM-based system.

### In Plain English:

Imagine you want Claude to be able to:
- Check your GitHub repository's health
- Send Stripe invoices
- Post to Slack channels
- Analyze your codebase

Normally, you'd need to:
1. Read the API documentation
2. Write Python code for each function
3. Test everything manually
4. Make sure it works with AI assistants

**HelperMCP does ALL of this automatically!**

You simply say:
```bash
helpermcp generate "Stripe"
```

And HelperMCP will:
1. 🔍 **Discover** - Find the Stripe SDK, documentation, and API endpoints
2. 🏗️ **Analyze** - Score each potential tool on usefulness and reliability  
3. 🧬 **Generate** - Write production-ready Python code
4. ✅ **Verify** - Test everything in a Docker sandbox
5. 🔧 **Fix** - Automatically repair any failures
6. 📦 **Deliver** - Give you certified, ready-to-use MCP tools

---

## 💡 Why HelperMCP?

| Without HelperMCP | With HelperMCP |
|-------------------|----------------|
| Hours of reading documentation | Seconds of waiting |
| Manual code writing | Automatic generation |
| Untested, potentially buggy | Docker-verified, certified |
| Works for one service | Works for any service |
| Static, doesn't evolve | Self-healing, adaptive |

---

## 🧩 How It Works (The Simple Version)

```
    YOU                          HELPERMCP                        OUTPUT
     │                               │                               │
     │  "Generate tools for          │                               │
     │   GitHub"                     │                               │
     │   ─────────────────────────►  │                               │
     │                               │                               │
     │                          🔍 Scout finds                       │
     │                             GitHub SDK                        │
     │                               │                               │
     │                          🏗️ Architect                         │
     │                             scores tools                      │
     │                               │                               │
     │                          🧬 Coder                             │
     │                             generates code                    │
     │                               │                               │
     │                          🐳 Sandbox                           │
     │                             verifies                          │
     │                               │                               │
     │                               │  ─────────────────────────►   │
     │                               │                               │
     │                               │                    server.py  │
     │                               │                    (Ready!)   │
```

---

## 📋 Prerequisites

Before you begin, make sure you have:

### Required:
- **Python 3.12 or newer**
  - Check your version: `python3 --version`
  - [Download Python](https://www.python.org/downloads/)

- **Docker Desktop**
  - HelperMCP tests tools in isolated containers
  - [Download Docker](https://www.docker.com/products/docker-desktop)
  - Make sure Docker is running: `docker --version`

- **Git**
  - For cloning the repository
  - Check: `git --version`

### Optional (for local LLM):
- **Ollama** (for running LLMs locally)
  - [Download Ollama](https://ollama.ai/)
  - Recommended model: `llama3.2`

---

## 🚀 Installation (Step-by-Step)

### Step 1: Open Your Terminal

- **Mac**: Press `Cmd + Space`, type "Terminal", press Enter
- **Windows**: Press `Win + R`, type "cmd", press Enter
- **Linux**: `Ctrl + Alt + T`

### Step 2: Choose Where to Install

Navigate to your preferred directory:
```bash
cd ~/Desktop
# or wherever you want to install HelperMCP
```

### Step 3: Clone the Repository

```bash
git clone https://github.com/yourusername/helpermcp.git
cd helpermcp
```

### Step 4: Create a Virtual Environment

A virtual environment keeps HelperMCP's dependencies separate from your system Python.

```bash
# Create the virtual environment
python3.12 -m venv .venv

# Activate it (you'll need to do this every time you use HelperMCP)
source .venv/bin/activate    # Mac/Linux
# OR
.venv\Scripts\activate       # Windows
```

**You'll know it worked when you see `(.venv)` at the start of your terminal prompt.**

### Step 5: Install HelperMCP

```bash
# Install with all development dependencies
pip install -e ".[dev]"
```

This installs:
- HelperMCP core
- All required packages (FastMCP, Docker, LangGraph, etc.)
- Testing tools

### Step 6: Verify Installation

```bash
helpermcp version
```

You should see:
```
HelperMCP v0.1.0
🏭 Autonomous MCP Server Factory
```

### (Optional) Step 7: Install Visual Automation

If you want browser/desktop automation tools:
```bash
pip install -e ".[visual]"
playwright install chromium
```

---

## 🎮 Your First Run (Complete Walkthrough)

Let's generate an MCP server for a popular service: **Stripe** (payment processing).

### Step 1: Make Sure Docker is Running

Open Docker Desktop and wait for it to start.

### Step 2: Start Ollama (If Using Local LLM)

In a **separate terminal**:
```bash
ollama serve
```

And in another terminal, pull the model:
```bash
ollama pull llama3.2
```

### Step 3: Run the Generator

In your HelperMCP terminal (with `.venv` activated):

```bash
helpermcp generate "Stripe" --max-tools 5
```

### Step 4: Watch the Magic Happen

You'll see output like this:

```
╭──────────────────────────────────────────────────────────────────╮
│                                                                  │
│  🏭 HelperMCP - Autonomous MCP Server Factory                   │
│                                                                  │
╰──────────────────────────────────────────────────────────────────╯

🎯 Target: Stripe

Stage: DISCOVERY
├─ 🔍 Searching for Stripe SDK...
├─ 📚 Found documentation: https://stripe.com/docs/api
├─ 🐍 Detected Python SDK: stripe
└─ ✅ Discovery complete

Stage: EXTRACTION  
├─ 🏗️ Analyzing API endpoints...
├─ 📊 Scoring tools on 3 dimensions:
│   ├─ LLM Utility: Can the LLM do this internally?
│   ├─ Determinism: Is the output reliable?
│   └─ Token Efficiency: Data density vs noise
├─ ✂️ Filtered: 5 high-scoring tools selected
└─ ✅ Extraction complete

Stage: GENERATION
├─ 🧬 Generating FastMCP-compliant code...
├─ 📝 Creating type annotations...
├─ 📖 Adding docstrings...
└─ ✅ Generation complete

Stage: VERIFICATION
├─ 🐳 Building Docker sandbox...
├─ 🧪 Running test suite...
│   ├─ Test 1/3: Import validation ✓
│   ├─ Test 2/3: Syntax check ✓
│   └─ Test 3/3: Mock client test ✓
└─ ✅ All tests passed!

🎉 SUCCESS!

Output: ./generated/stripe_server.py

╭─ Generated Tools ───────────────────────────────────────────────╮
│                                                                 │
│  1. create_customer    - Create a new Stripe customer          │
│  2. create_payment     - Create a payment intent               │
│  3. list_invoices      - List all invoices                     │
│  4. get_balance        - Get account balance                   │
│  5. create_refund      - Refund a charge                       │
│                                                                 │
╰─────────────────────────────────────────────────────────────────╯
```

### Step 5: Check Your Generated Server

Look at the generated file:

```bash
cat ./generated/stripe_server.py
```

You'll see clean, production-ready Python code:

```python
"""
Stripe MCP Server
Auto-generated by HelperMCP 🏭

This server provides LLM-steerable tools for interacting with Stripe.
"""

from fastmcp import FastMCP
from pydantic import BaseModel, Field
import stripe

mcp = FastMCP("Stripe")


class CreateCustomerInput(BaseModel):
    """Input for creating a customer."""
    email: str = Field(..., description="Customer email address")
    name: str = Field(None, description="Customer name")


@mcp.tool()
def create_customer(input: CreateCustomerInput) -> dict:
    """
    Create a new customer in Stripe.
    
    Use this when you need to register a new customer for payments.
    """
    return stripe.Customer.create(
        email=input.email,
        name=input.name
    )

# ... more tools
```

---

## 📊 Understanding the Output

### Generated Files

After running `helpermcp generate`, you'll find:

```
generated/
├── stripe_server.py      # The main MCP server
├── stripe_test.py        # Test suite for the tools
├── stripe_config.json    # Configuration metadata
└── README.md             # Usage instructions
```

### Tool Certification

Each tool is certified with:
- ✅ **Import validation** - All dependencies resolve
- ✅ **Syntax check** - Valid Python code
- ✅ **Mock client test** - Works with AI assistants

### Score Report

Tools are scored from 1-10 on three dimensions:

| Dimension | What It Measures | Good Score |
|-----------|------------------|------------|
| **LLM Utility** | Does the LLM need this tool? | 7+ (external data) |
| **Determinism** | Is output reliable/parsable? | 7+ (clean JSON) |
| **Token Efficiency** | Compact, actionable data? | 7+ (not noisy) |

**Only tools with aggregate score ≥ 7.5 are certified.**

---

## 🛠️ All CLI Commands Explained

### `generate` - Create an MCP Server

The main command. Creates a complete MCP server for a service.

```bash
# Basic usage
helpermcp generate "Stripe"

# With options
helpermcp generate "GitHub" \
    --max-tools 20 \        # Limit number of tools
    --output ./my-servers/  # Custom output directory
    --dry-run               # Preview without saving
```

**When to use:** When you want tools for a specific service (Stripe, GitHub, Slack, etc.)

---

### `jit` - Goal-Driven Tool Generation

The smart command. Tell it what you want to accomplish, and it figures out what tools you need.

```bash
# Analyze project health
helpermcp jit "Analyze my repository health" \
    --target ./my-project \
    --focus data

# Track expenses
helpermcp jit "Track my business expenses" \
    --target stripe

# Send notifications
helpermcp jit "Send team notifications when deployments finish" \
    --target slack \
    --focus action
```

**Focus options:**
- `data` - Prioritize data retrieval tools (get, list, read)
- `action` - Prioritize action tools (create, update, delete)
- `calculation` - Prioritize computation tools
- `general` - Balanced (default)

**When to use:** When you have a goal but don't know exactly what tools you need.

---

### `analyze-repo` - Analyze a Local Repository

Scans your codebase and suggests tools based on your existing functions.

```bash
helpermcp analyze-repo ./my-project
```

Output:
```
Repository Analysis: ./my-project

📂 Language: Python
📊 Files: 47 Python files

🔧 Tool Candidates Found:
├─ 1. calculate_metrics    (score: 8.5) - From analytics.py
├─ 2. send_notification    (score: 9.0) - From notifier.py
├─ 3. fetch_user_data      (score: 8.2) - From api/users.py
└─ 4. process_payment      (score: 8.8) - From payments.py
```

**When to use:** When you want to turn your existing code into MCP tools.

---

### `inspect` - Analyze a Python Package

Examines an installed Python library for potential tools.

```bash
helpermcp inspect requests
```

Output:
```
Package: requests

📦 Version: 2.31.0
📖 Functions: 28

🔧 Top Tool Candidates:
├─ get               (score: 9.0) - HTTP GET request
├─ post              (score: 9.0) - HTTP POST request
├─ put               (score: 8.5) - HTTP PUT request
└─ head              (score: 7.5) - HTTP HEAD request
```

**When to use:** When you want to wrap an existing Python library as MCP tools.

---

### `search` - Find Existing Tools

Search your registry for tools by natural language.

```bash
# Find payment tools
helpermcp search "payment processing"

# Find notification tools
helpermcp search "send alerts" --limit 5
```

**When to use:** When you've already generated tools and want to find them.

---

### `stats` - View Registry Statistics

Shows what's in your tool registry.

```bash
helpermcp stats
```

Output:
```
╭─ Registry Statistics ───────────────────────────────────────────╮
│                                                                 │
│  📊 Total Tools: 47                                             │
│  📦 Services: 5 (Stripe, GitHub, Slack, OpenAI, Anthropic)     │
│  📅 Last Updated: 2024-01-15 14:30                             │
│                                                                 │
│  🏆 Most Used Tools:                                           │
│  ├─ github.create_issue: 156 calls                             │
│  ├─ stripe.create_payment: 89 calls                            │
│  └─ slack.post_message: 67 calls                               │
│                                                                 │
╰─────────────────────────────────────────────────────────────────╯
```

---

### `check-updates` - Check for Service Updates

Monitors if a service's API has changed.

```bash
helpermcp check-updates stripe

# Check against live docs
helpermcp check-updates github --online
```

**When to use:** To see if your generated tools are outdated.

---

### `generate-docs` - Create Documentation

Generates a documentation site for all your tools.

```bash
helpermcp generate-docs --output ./docs/
```

Creates a beautiful static site with:
- Tool catalog
- Usage examples
- API reference

---

## 🏗️ The Agent Architecture

HelperMCP uses a team of specialized AI agents:

### 🔍 Scout Agent

**Job:** Discovery and information gathering

**What it does:**
- Searches for SDKs and documentation
- Scrapes API docs and converts to markdown
- Analyzes repositories using AST (Abstract Syntax Tree)
- Auto-detects URLs, local paths, or package names

```python
from helpermcp.agents import ScoutAgent

scout = ScoutAgent()

# Auto-detects target type
result = await scout.smart_discover("./my-repo")    # Local repo
result = await scout.smart_discover("https://api.example.com")  # URL
result = await scout.smart_discover("stripe")       # Package name
```

---

### 🏗️ Architect Agent

**Job:** Quality filtering and scoring

**What it does:**
- Evaluates each potential tool on 3 dimensions
- Filters out low-value tools
- Aligns tools with user intent (+2.0 bonus)
- Ensures only valuable tools get generated

**The 3 Dimensions:**

1. **LLM Utility (40%)** - "Can the LLM already do this?"
   - Low: `format_date`, `validate_email` (LLM can do these)
   - High: `send_email`, `get_balance` (needs external access)

2. **Determinism (35%)** - "Is the output reliable?"
   - Low: HTML scraping (unpredictable)
   - High: Clean JSON API responses

3. **Token Efficiency (25%)** - "Is the data compact?"
   - Low: Returns entire database
   - High: Returns just what's needed

---

### 🧬 Coder Agent

**Job:** Code generation

**What it does:**
- Uses Jinja2 templates for consistent code
- Generates FastMCP-compliant Python
- Adds type annotations (Pydantic)
- Writes comprehensive docstrings
- Implements error handling

---

### 🔬 Analyst Agent

**Job:** Goal analysis (for JIT mode)

**What it does:**
- Decomposes user goals into requirements
- Maps goals to tool categories
- Identifies gaps in existing tooling
- Prioritizes tool generation order

---

### 🕵️ NetworkSpy Agent

**Job:** API endpoint discovery

**What it does:**
- Uses Playwright to monitor web traffic
- Captures XHR/Fetch requests
- Extracts hidden API endpoints
- Monitors request/response patterns

---

### 🎭 Visual Agent

**Job:** Browser/desktop automation

**What it does:**
- Generates browser automation tools
- Creates desktop automation scripts
- Records and replays user actions

---

## 📏 Three-Dimensional Scoring System

Every tool is evaluated before certification:

### LLM Utility Score (40% weight)

*"Does the LLM need external access?*"

| Score | Meaning | Examples |
|-------|---------|----------|
| 1-3 | LLM can do this internally | `format_date()`, `validate_email()` |
| 4-6 | Helpful but not essential | `parse_config()`, `merge_dicts()` |
| 7-10 | **External data required** | `send_email()`, `get_balance()`, `post_tweet()` |

### Determinism Score (35% weight)

*"Is the output reliable and parsable?"*

| Score | Meaning | Examples |
|-------|---------|----------|
| 1-3 | Unpredictable output | HTML scraping, binary data |
| 4-6 | Semi-structured | Search results, paginated lists |
| 7-10 | **Clean, typed JSON** | `{"id": 1, "name": "John", "balance": 100.00}` |

### Token Efficiency Score (25% weight)

*"How compact is the data?"*

| Score | Meaning | Examples |
|-------|---------|----------|
| 1-3 | Huge, noisy responses | Returns entire database |
| 4-6 | Medium payloads | 100+ item lists |
| 7-10 | **Compact, actionable** | Single object, key fields only |

### Final Score Calculation

```
Final Score = (LLM Utility × 0.40) + (Determinism × 0.35) + (Token Efficiency × 0.25)
```

**Threshold: 7.5**

Only tools scoring ≥ 7.5 get certified.

**Intent Bonus: +2.0**

Tools aligned with user's stated goal receive a bonus.

---

## ⚙️ Configuration Guide

### Environment Variables

Create a `.env` file or set these in your shell:

```bash
# LLM Configuration (for Ollama)
export HELPERMCP_LLM_BASE_URL="http://localhost:11434/v1"
export HELPERMCP_LLM_MODEL="llama3.2"
export HELPERMCP_LLM_API_KEY=""  # Leave empty for Ollama

# For OpenAI
export HELPERMCP_LLM_BASE_URL="https://api.openai.com/v1"
export HELPERMCP_LLM_MODEL="gpt-4"
export HELPERMCP_LLM_API_KEY="sk-..."

# Docker Sandbox Settings
export HELPERMCP_DOCKER_IMAGE="python:3.12-slim"
export HELPERMCP_DOCKER_MEMORY_LIMIT="512m"
export HELPERMCP_DOCKER_CPU_LIMIT="1.0"

# Output Settings
export HELPERMCP_OUTPUT_DIR="./generated"
export HELPERMCP_MAX_TOOLS_PER_SERVER="50"
export HELPERMCP_SCORE_THRESHOLD="7.5"

# (Optional) Credential Storage
export HELPERMCP_VAULT_KEY="your-secret-master-key"
```

### Settings in Python

```python
from helpermcp.core import settings

# View current settings
print(settings.output_dir)          # Default: ./generated
print(settings.max_tools_per_server)  # Default: 50
print(settings.score_threshold)      # Default: 7.5
```

---

## 🌍 Real-World Examples

### Example 1: Creating a GitHub Dashboard

**Goal:** Build an MCP server with tools to monitor GitHub repositories.

```bash
# Generate GitHub tools
helpermcp generate "GitHub" --max-tools 10 --output ./github-mcp/
```

**Generated Tools:**
- `list_repositories` - List user's repos
- `get_repo_stats` - Get stars, forks, issues count
- `list_issues` - List open issues
- `create_issue` - Create a new issue
- `get_pull_requests` - List PRs
- `get_workflow_runs` - CI/CD status
- ... and more

**Usage with Claude:**

```
You: Check the health of my kushalgarg/awesome-project repo

Claude: I'll check your repository health using the GitHub tools.
        [Calls list_issues, get_repo_stats, get_workflow_runs]
        
        📊 Repository Health Report:
        - Stars: 1,234 ⭐
        - Open Issues: 12
        - Failed CI Runs: 2 (in last 7 days)
        - Last Updated: 2 hours ago
```

---

### Example 2: Goal-Driven Expense Tracking

**Goal:** Create tools to track and analyze business expenses.

```bash
helpermcp jit "Track my business expenses and generate monthly reports" \
    --target stripe \
    --focus data
```

**What happens:**
1. Analyst decomposes goal:
   - Need: List charges
   - Need: Get charge details
   - Need: Aggregate by date
   - Need: Export functionality

2. Scout finds Stripe SDK

3. Architect scores and filters:
   - `list_charges` ✓ (score: 9.2)
   - `get_charge` ✓ (score: 8.8)
   - `create_charge` ✗ (not aligned with "tracking")

4. Coder generates expense-focused tools

**Generated Tools:**
- `list_charges` - Get all charges in date range
- `get_charge_details` - Details for one charge
- `get_monthly_summary` - Aggregate charges by month
- `export_expenses_csv` - Export for accounting

---

### Example 3: Analyzing Your Own Codebase

**Goal:** Turn your existing code into MCP tools.

```bash
# Analyze your project
helpermcp analyze-repo ./my-saas-app

# Then generate tools from the analysis
helpermcp jit "Create tools from my codebase" \
    --target ./my-saas-app
```

**If your code has:**
```python
# my-saas-app/analytics.py
def calculate_mrr(subscriptions: list) -> float:
    """Calculate Monthly Recurring Revenue."""
    return sum(s.amount for s in subscriptions if s.active)

def get_churn_rate(period_days: int = 30) -> float:
    """Calculate churn rate for the period."""
    ...
```

**HelperMCP generates:**
```python
@mcp.tool()
def calculate_mrr(subscriptions: list[SubscriptionInput]) -> MRROutput:
    """
    Calculate Monthly Recurring Revenue from active subscriptions.
    
    Use this when you need to know your current MRR.
    """
    ...
```

---

## 🔧 Troubleshooting

### "Docker not found"

**Problem:** HelperMCP can't find Docker.

**Solution:**
1. Install Docker Desktop from https://docker.com
2. Start Docker Desktop (wait for it to fully load)
3. Verify: `docker --version`

---

### "Connection refused" to LLM

**Problem:** Can't connect to the LLM server.

**Solutions:**

For Ollama:
```bash
# Make sure Ollama is running
ollama serve

# In another terminal, verify
curl http://localhost:11434/api/version
```

For OpenAI:
```bash
# Check your API key is set
echo $HELPERMCP_LLM_API_KEY
```

---

### "No tools generated"

**Problem:** Pipeline completes but no tools are produced.

**Possible causes:**

1. **Score threshold too high** - Lower it:
   ```bash
   export HELPERMCP_SCORE_THRESHOLD="6.0"
   ```

2. **Service not recognized** - Try with more context:
   ```bash
   # Instead of
   helpermcp generate "myapp"
   
   # Try
   helpermcp generate "myapp REST API" 
   ```

3. **Max tools too low** - Increase it:
   ```bash
   helpermcp generate "GitHub" --max-tools 50
   ```

---

### "Import error in generated code"

**Problem:** Generated server has import errors.

**Solution:**
The generated code might need additional dependencies. Check `requirements.txt` in the output folder and install:
```bash
pip install -r ./generated/requirements.txt
```

---

### Sandbox verification fails

**Problem:** Tools fail verification.

**Solution:**
HelperMCP has self-healing! It will:
1. Detect the failure
2. Analyze the error
3. Adjust and retry (up to 3 times)

If it still fails, check the error message in the output.

---

## ❓ FAQ

### Q: What LLMs does HelperMCP support?

A: Any OpenAI-compatible API:
- **Ollama** (local, free) - Recommended: `llama3.2`
- **OpenAI** - GPT-4, GPT-3.5
- **Anthropic** - Claude (via OpenAI-compatible wrapper)
- **Local models** - LM Studio, Text Generation WebUI

---

### Q: Is my data sent to external servers?

A: It depends on your LLM choice:
- **Ollama:** Everything runs locally. No external calls.
- **OpenAI/Claude:** Your prompts go through their APIs.

---

### Q: Can I use HelperMCP without Docker?

A: Not recommended. Docker provides:
- Isolated testing environment
- Consistent Python version
- Safe execution of generated code

---

### Q: What services does HelperMCP support?

A: Virtually any service! HelperMCP uses AI to discover and understand services. Popular ones include:
- Payment: Stripe, PayPal
- Social: Twitter/X, Slack, Discord
- Dev: GitHub, GitLab, Jira
- Cloud: AWS, GCP, Azure
- And many more...

---

### Q: How do I use generated tools with Claude?

A: The generated `server.py` is an MCP server. Configure it in Claude Desktop:

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "stripe": {
      "command": "python",
      "args": ["/path/to/generated/stripe_server.py"]
    }
  }
}
```

---

### Q: Can I customize generated tools?

A: Absolutely! The generated code is plain Python. Edit it:
```python
@mcp.tool()
def create_customer(input: CreateCustomerInput) -> dict:
    # Add your custom logic here
    ...
```

---

## 📂 Project Structure

```
helpermcp/
├── src/helpermcp/
│   ├── agents/                 # AI Agents
│   │   ├── scout.py           # Discovery & scraping
│   │   ├── architect.py       # Scoring & filtering
│   │   ├── coder.py           # Code generation
│   │   ├── analyst.py         # Goal decomposition
│   │   ├── network_spy.py     # API monitoring
│   │   └── visual_agent.py    # Browser automation
│   │
│   ├── core/                   # Core components
│   │   ├── models.py          # Pydantic data models
│   │   ├── settings.py        # Configuration
│   │   └── pipeline.py        # Orchestration
│   │
│   ├── registry/               # Tool registry
│   │   ├── database.py        # SQLite storage
│   │   ├── search.py          # Semantic search
│   │   └── vault.py           # Encrypted credentials
│   │
│   ├── sandbox/                # Verification
│   │   ├── executor.py        # Docker execution
│   │   └── client.py          # Mock testing
│   │
│   ├── watchtower/             # Monitoring
│   │   ├── monitor.py         # Version checking
│   │   ├── hotreload.py       # Live refresh
│   │   └── websocket_server.py # Real-time sync
│   │
│   ├── templates/              # Jinja2 templates
│   └── main.py                 # CLI entry point
│
├── tests/                      # Unit tests
├── docs/                       # Documentation
├── pyproject.toml              # Project config
└── README.md                   # This file
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

### 1. Fork & Clone

```bash
git clone https://github.com/yourusername/helpermcp.git
cd helpermcp
```

### 2. Create a Branch

```bash
git checkout -b feature/amazing-feature
```

### 3. Make Changes

Edit the code, add tests.

### 4. Run Tests

```bash
pytest tests/ -v
```

### 5. Submit PR

```bash
git push origin feature/amazing-feature
```

Then open a Pull Request on GitHub.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

---

## 🙏 Acknowledgments

- [FastMCP](https://github.com/jlowin/fastmcp) - MCP server framework
- [Playwright](https://playwright.dev/) - Browser automation
- [LangGraph](https://github.com/langchain-ai/langgraph) - Agent orchestration
- [Sentence Transformers](https://www.sbert.net/) - Semantic search

---

<div align="center">

## 🚀 Ready to Get Started?

```bash
helpermcp generate "Stripe"
```

**Built with 🧠 by HelperMCP**

*The AI that builds AI tools*

---

**Questions?** Open an issue on GitHub  
**Found a bug?** PRs welcome!

</div>

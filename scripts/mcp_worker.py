#!/usr/bin/env python3
"""
MCP Worker - Processes MCP generation requests using Claude CLI

This worker:
1. Polls Supabase for pending mcp_requests
2. Uses Claude CLI to generate MCP server code
3. Updates request status and logs in real-time
4. Stores generated code in mcp_results

Usage:
    cd /path/to/context-bridge
    python scripts/mcp_worker.py

Environment variables required:
    SUPABASE_URL - Your Supabase project URL
    SUPABASE_SERVICE_KEY - Service role key (NOT anon key)
    
Note: Claude CLI must be installed and authenticated.
"""

import os
import sys
import time
import subprocess
import json
from pathlib import Path
from datetime import datetime
from typing import Optional

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ supabase-py not installed. Run: pip install supabase")
    sys.exit(1)


# ===========================================
# Configuration
# ===========================================

# Load from environment or use defaults from .env.local
SUPABASE_URL = os.environ.get(
    "SUPABASE_URL",
    os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
)
SUPABASE_SERVICE_KEY = os.environ.get(
    "SUPABASE_SERVICE_KEY",
    ""
)

# Poll interval in seconds
POLL_INTERVAL = 5

# Claude CLI path
CLAUDE_CLI = os.environ.get("CLAUDE_CLI", "claude")


# ===========================================
# Supabase Client
# ===========================================

def get_supabase_client() -> Optional[Client]:
    """Initialize and return Supabase client."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("❌ Missing Supabase credentials!")
        print("Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables")
        return None
    
    try:
        client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        return client
    except Exception as e:
        print(f"❌ Failed to create Supabase client: {e}")
        return None


# ===========================================
# Claude CLI Integration
# ===========================================

def run_claude_cli(prompt: str, timeout: int = 180) -> tuple[bool, str]:
    """
    Run Claude CLI with a prompt and return the result.
    
    Returns:
        (success: bool, output: str)
    """
    try:
        # Use shell=True with echo pipe for reliable prompt passing
        cmd = f'echo {repr(prompt)} | {CLAUDE_CLI} -p --dangerously-skip-permissions'
        
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=str(Path(__file__).parent.parent)
        )
        
        output = result.stdout.strip()
        stderr = result.stderr.strip()
        
        print(f"   DEBUG: return_code={result.returncode}, output_len={len(output)}")
        
        if output and len(output) > 20:
            return True, output
        else:
            error_msg = stderr if stderr else "Claude CLI returned empty output"
            if stderr:
                print(f"   DEBUG stderr: {stderr[:300]}")
            return False, error_msg
            
    except subprocess.TimeoutExpired:
        return False, f"Claude CLI timed out after {timeout}s"
    except FileNotFoundError:
        return False, f"Claude CLI not found at: {CLAUDE_CLI}"
    except Exception as e:
        print(f"   DEBUG exception: {e}")
        return False, str(e)


def generate_mcp_server(goal: str) -> tuple[bool, str, dict]:
    """
    Generate an MCP server using Claude CLI.
    
    Returns:
        (success: bool, server_code: str, tools_json: dict)
    """
    # Keep the prompt simple and clean
    prompt = f"Generate a complete Python MCP server using FastMCP library for: {goal}. Include 3-5 useful tools with Pydantic models. Return only the Python code."

    success, output = run_claude_cli(prompt)
    
    if not success:
        return False, "", {"error": output}
    
    # Extract code from the response
    code = output
    
    # If response contains markdown code blocks, extract the code
    if "```python" in output:
        start = output.find("```python") + len("```python")
        end = output.find("```", start)
        if end > start:
            code = output[start:end].strip()
    elif "```" in output:
        start = output.find("```") + len("```")
        end = output.find("```", start)
        if end > start:
            code = output[start:end].strip()
        if end > start:
            code = output[start:end].strip()
    
    # Count tools (look for @mcp.tool() decorators)
    tool_count = code.count("@mcp.tool()")
    
    # Extract tool names
    tools = []
    for line in code.split("\n"):
        if line.strip().startswith("def ") and "@mcp.tool()" in code[:code.find(line)]:
            func_name = line.split("def ")[1].split("(")[0]
            tools.append({"name": func_name, "description": ""})
    
    tools_json = {
        "count": tool_count,
        "tools": tools
    }
    
    return True, code, tools_json


# ===========================================
# Request Processing
# ===========================================

class MCPWorker:
    """Worker that processes MCP generation requests."""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.current_request_id: Optional[str] = None
        
    def log(self, message: str):
        """Print timestamped log message."""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")
        
    def update_request_status(
        self,
        request_id: str,
        status: str,
        logs: Optional[list] = None,
        error_message: Optional[str] = None
    ):
        """Update request status in Supabase."""
        update_data = {"status": status}
        
        if logs is not None:
            update_data["logs"] = logs
            
        try:
            self.supabase.table("mcp_requests").update(update_data).eq("id", request_id).execute()
        except Exception as e:
            self.log(f"⚠️ Failed to update request status: {e}")
            
    def append_log(self, request_id: str, log_message: str, current_logs: list) -> list:
        """Append a log message and update Supabase."""
        current_logs.append(log_message)
        self.update_request_status(request_id, "processing", logs=current_logs)
        self.log(log_message)
        return current_logs
    
    def save_result(self, request_id: str, server_code: str, tools_json: dict):
        """Save generated MCP server to mcp_results table."""
        try:
            self.supabase.table("mcp_results").insert({
                "request_id": request_id,
                "server_code": server_code,
                "tools_json": tools_json,
                "download_url": None
            }).execute()
            self.log(f"✅ Saved result for request {request_id[:8]}...")
        except Exception as e:
            self.log(f"❌ Failed to save result: {e}")
            
    def fetch_pending_request(self) -> Optional[dict]:
        """Fetch the oldest pending request."""
        try:
            response = self.supabase.table("mcp_requests")\
                .select("*")\
                .eq("status", "pending")\
                .order("created_at", desc=False)\
                .limit(1)\
                .execute()
                
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            self.log(f"⚠️ Error fetching requests: {e}")
            return None
            
    def process_request(self, request: dict):
        """Process a single MCP generation request."""
        request_id = request["id"]
        goal = request["goal"]
        
        self.current_request_id = request_id
        self.log(f"🚀 Processing request {request_id[:8]}...")
        self.log(f"   Goal: {goal}")
        
        # Mark as processing
        logs = [f"🏭 Starting MCP generation for: {goal}"]
        self.update_request_status(request_id, "processing", logs=logs)
        
        try:
            # Stage 1: Initialize
            logs = self.append_log(request_id, "🔧 Initializing Claude CLI...", logs)
            
            # Stage 2: Generate with Claude CLI
            logs = self.append_log(request_id, "🤖 Generating MCP server with Claude...", logs)
            success, server_code, tools_json = generate_mcp_server(goal)
            
            if not success:
                raise Exception(f"Claude CLI error: {tools_json.get('error', 'Unknown error')}")
            
            # Stage 3: Validate output
            logs = self.append_log(request_id, f"✅ Generated {tools_json['count']} tools", logs)
            
            if not server_code or len(server_code) < 100:
                raise Exception("Generated code is too short or empty")
            
            # Stage 4: Save result
            logs = self.append_log(request_id, "💾 Saving generated server...", logs)
            self.save_result(request_id, server_code, tools_json)
            
            # Update status to completed
            logs = self.append_log(
                request_id,
                f"🎉 Success! MCP server ready with {tools_json['count']} tools",
                logs
            )
            self.update_request_status(request_id, "completed", logs=logs)
            self.log(f"✅ Completed request {request_id[:8]}")
                
        except Exception as e:
            error_msg = str(e)
            self.log(f"❌ Failed: {error_msg}")
            logs.append(f"❌ Error: {error_msg}")
            self.update_request_status(request_id, "failed", logs=logs)
            
        finally:
            self.current_request_id = None
            
    def run(self):
        """Main worker loop."""
        self.log("🏭 MCP Worker started (Claude CLI mode)")
        self.log(f"   Supabase URL: {SUPABASE_URL[:40]}...")
        self.log(f"   Claude CLI: {CLAUDE_CLI}")
        self.log(f"   Poll interval: {POLL_INTERVAL}s")
        self.log("")
        
        while True:
            try:
                # Fetch pending request
                request = self.fetch_pending_request()
                
                if request:
                    self.process_request(request)
                    
                time.sleep(POLL_INTERVAL)
                
            except KeyboardInterrupt:
                self.log("\n👋 Shutting down worker...")
                break
            except Exception as e:
                self.log(f"⚠️ Worker error: {e}")
                time.sleep(POLL_INTERVAL)


# ===========================================
# Main Entry Point
# ===========================================

def main():
    print("""
╭──────────────────────────────────────────────────────────────────╮
│                                                                  │
│  🏭 MCP Worker - Claude CLI Mode                                │
│                                                                  │
╰──────────────────────────────────────────────────────────────────╯
""")
    
    # Check Claude CLI
    result = subprocess.run([CLAUDE_CLI, "--version"], capture_output=True, text=True)
    if result.returncode == 0:
        print(f"✅ Claude CLI found: {result.stdout.strip()}")
    else:
        print(f"❌ Claude CLI not found at: {CLAUDE_CLI}")
        print("   Install it from: https://github.com/anthropics/claude-cli")
        sys.exit(1)
    
    # Initialize Supabase
    supabase = get_supabase_client()
    if not supabase:
        print("\n❌ Cannot start worker without Supabase connection")
        sys.exit(1)
        
    # Test connection
    try:
        result = supabase.table("mcp_requests").select("id").limit(1).execute()
        print("✅ Supabase connection successful")
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        sys.exit(1)
    
    print("")
    
    # Create and run worker
    worker = MCPWorker(supabase)
    worker.run()


if __name__ == "__main__":
    main()

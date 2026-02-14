"""
SuperMCP Orchestrator - The Global Intelligence Hub

This is the master orchestrator that manages all MCP servers:
- Dynamic server lifecycle (start/stop)
- Lazy-loading proxy for on-demand server activation  
- Timeout reaper for idle server cleanup
- Recursive fallback for missing capabilities
"""

import asyncio
import subprocess
import time
import os
import json
from pathlib import Path
from dataclasses import dataclass, field
from typing import Any, Callable
from datetime import datetime, timedelta

from pydantic import BaseModel


@dataclass
class ServerProcess:
    """Represents a running MCP server."""
    name: str
    process: subprocess.Popen | None = None
    port: int = 0
    started_at: datetime = field(default_factory=datetime.now)
    last_used: datetime = field(default_factory=datetime.now)
    tools: list[str] = field(default_factory=list)
    status: str = "stopped"


class ServerManager:
    """
    Manages the lifecycle of MCP sub-servers.
    
    Features:
    - Start servers on demand
    - Track active processes
    - Clean shutdown
    """
    
    def __init__(
        self,
        servers_dir: Path | None = None,
        base_port: int = 9000,
    ):
        self.servers_dir = servers_dir or Path.home() / "Desktop" / "mcp-servers"
        self.base_port = base_port
        self._servers: dict[str, ServerProcess] = {}
        self._next_port = base_port
        
    def discover_servers(self) -> list[str]:
        """Discover all available MCP servers."""
        servers = []
        if self.servers_dir.exists():
            for d in self.servers_dir.iterdir():
                if d.is_dir() and (d / "server.py").exists():
                    servers.append(d.name.replace("_mcp", ""))
        return sorted(servers)
    
    def get_server_tools(self, server_name: str) -> list[str]:
        """Get list of tools provided by a server."""
        import re
        server_dir = self.servers_dir / f"{server_name}_mcp"
        server_file = server_dir / "server.py"
        
        if not server_file.exists():
            return []
        
        code = server_file.read_text()
        # Extract tool names from @mcp.tool() decorated functions
        tools = re.findall(r'@mcp\.tool\(\)\s*\nasync def (\w+)\(', code)
        return tools
    
    async def start_server(self, server_name: str) -> ServerProcess:
        """Start a server if not already running."""
        if server_name in self._servers and self._servers[server_name].status == "running":
            self._servers[server_name].last_used = datetime.now()
            return self._servers[server_name]
        
        server_dir = self.servers_dir / f"{server_name}_mcp"
        server_file = server_dir / "server.py"
        
        if not server_file.exists():
            raise FileNotFoundError(f"Server not found: {server_name}")
        
        # Assign port
        port = self._next_port
        self._next_port += 1
        
        # Start the server process
        process = subprocess.Popen(
            ["python", str(server_file)],
            cwd=str(server_dir),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env={**os.environ, "MCP_PORT": str(port)},
        )
        
        # Get tools
        tools = self.get_server_tools(server_name)
        
        server_proc = ServerProcess(
            name=server_name,
            process=process,
            port=port,
            tools=tools,
            status="running",
        )
        
        self._servers[server_name] = server_proc
        return server_proc
    
    async def stop_server(self, server_name: str) -> bool:
        """Stop a running server."""
        if server_name not in self._servers:
            return False
        
        server = self._servers[server_name]
        if server.process and server.status == "running":
            server.process.terminate()
            try:
                server.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server.process.kill()
            server.status = "stopped"
        
        return True
    
    async def stop_all(self):
        """Stop all running servers."""
        for name in list(self._servers.keys()):
            await self.stop_server(name)
    
    def get_active_servers(self) -> list[dict]:
        """Get list of currently active servers."""
        return [
            {
                "name": s.name,
                "port": s.port,
                "tools": s.tools,
                "started_at": s.started_at.isoformat(),
                "last_used": s.last_used.isoformat(),
                "uptime_seconds": (datetime.now() - s.started_at).total_seconds(),
            }
            for s in self._servers.values()
            if s.status == "running"
        ]


class TimeoutReaper:
    """
    Background task that shuts down idle servers.
    
    Servers not used for `timeout_minutes` are terminated to save resources.
    """
    
    def __init__(
        self,
        server_manager: ServerManager,
        timeout_minutes: int = 10,
    ):
        self.manager = server_manager
        self.timeout = timedelta(minutes=timeout_minutes)
        self._running = False
        self._task: asyncio.Task | None = None
    
    async def start(self):
        """Start the reaper background task."""
        self._running = True
        self._task = asyncio.create_task(self._reap_loop())
    
    async def stop(self):
        """Stop the reaper."""
        self._running = False
        if self._task:
            self._task.cancel()
    
    async def _reap_loop(self):
        """Main reaping loop - check every minute."""
        while self._running:
            await self._reap_idle_servers()
            await asyncio.sleep(60)
    
    async def _reap_idle_servers(self):
        """Shut down servers that haven't been used recently."""
        now = datetime.now()
        for name, server in list(self.manager._servers.items()):
            if server.status == "running":
                idle_time = now - server.last_used
                if idle_time > self.timeout:
                    print(f"[Reaper] Shutting down idle server: {name}")
                    await self.manager.stop_server(name)


class WorkspaceManager:
    """
    Manages the shared workspace for all MCP tools.
    
    Provides a common directory where all tools can read/write files,
    enabling collaboration between servers.
    """
    
    def __init__(self, workspace_path: Path | None = None):
        self.workspace = workspace_path or Path.home() / "Desktop" / "helpermcp-workspace"
        self._ensure_workspace()
    
    def _ensure_workspace(self):
        """Create workspace directory if it doesn't exist."""
        self.workspace.mkdir(parents=True, exist_ok=True)
        
        # Create standard subdirectories
        (self.workspace / "data").mkdir(exist_ok=True)
        (self.workspace / "outputs").mkdir(exist_ok=True)
        (self.workspace / "temp").mkdir(exist_ok=True)
        (self.workspace / "logs").mkdir(exist_ok=True)
    
    def get_path(self, subpath: str = "") -> Path:
        """Get a path within the workspace."""
        return self.workspace / subpath
    
    def list_files(self, subdir: str = "") -> list[dict]:
        """List files in a workspace subdirectory."""
        target = self.workspace / subdir
        if not target.exists():
            return []
        
        files = []
        for item in target.iterdir():
            if item.is_file():
                files.append({
                    "name": item.name,
                    "size": item.stat().st_size,
                    "modified": datetime.fromtimestamp(item.stat().st_mtime).isoformat(),
                })
        return files
    
    def cleanup_temp(self):
        """Clean up temporary files."""
        temp_dir = self.workspace / "temp"
        for item in temp_dir.iterdir():
            if item.is_file():
                item.unlink()


class SuperMCPOrchestrator:
    """
    The Master Orchestrator - Global Intelligence Hub.
    
    Features:
    - Lazy-loading of sub-servers
    - Unified tool routing
    - Recursive capability acquisition
    - Resource management
    """
    
    def __init__(self):
        self.server_manager = ServerManager()
        self.workspace = WorkspaceManager()
        self.reaper = TimeoutReaper(self.server_manager)
        
        self._tool_registry: dict[str, str] = {}  # tool_name -> server_name
        self._on_missing_capability: Callable | None = None
    
    async def initialize(self):
        """Initialize the orchestrator."""
        # Build tool registry from all available servers
        await self._build_tool_registry()
        
        # Start the timeout reaper
        await self.reaper.start()
        
        # Ensure workspace exists
        self.workspace._ensure_workspace()
    
    async def shutdown(self):
        """Graceful shutdown."""
        await self.reaper.stop()
        await self.server_manager.stop_all()
    
    async def _build_tool_registry(self):
        """Build a mapping of tool_name -> server_name."""
        self._tool_registry.clear()
        
        for server_name in self.server_manager.discover_servers():
            tools = self.server_manager.get_server_tools(server_name)
            for tool in tools:
                self._tool_registry[tool] = server_name
    
    def find_server_for_tool(self, tool_name: str) -> str | None:
        """Find which server provides a given tool."""
        return self._tool_registry.get(tool_name)
    
    async def route_request(
        self,
        tool_name: str,
        **kwargs,
    ) -> dict[str, Any]:
        """
        Route a tool request to the appropriate server.
        
        This is the lazy-loading proxy - servers are started on demand.
        """
        server_name = self.find_server_for_tool(tool_name)
        
        if not server_name:
            # Tool not found - trigger recursive capability acquisition
            if self._on_missing_capability:
                return await self._acquire_missing_capability(tool_name, kwargs)
            else:
                return {"success": False, "error": f"Tool not found: {tool_name}"}
        
        # Ensure server is running
        try:
            server = await self.server_manager.start_server(server_name)
        except FileNotFoundError as e:
            return {"success": False, "error": str(e)}
        
        # Mark as used (for reaper)
        server.last_used = datetime.now()
        
        # Note: In a full implementation, this would make an actual RPC call
        # For now, we return metadata about the routing
        return {
            "success": True,
            "routed_to": server_name,
            "tool": tool_name,
            "server_port": server.port,
            "args": kwargs,
        }
    
    async def _acquire_missing_capability(
        self,
        tool_name: str,
        original_args: dict,
    ) -> dict[str, Any]:
        """
        Recursive fallback - build missing capability via jit_forge.
        """
        print(f"[Orchestrator] Missing capability: {tool_name}")
        print(f"[Orchestrator] Triggering jit_forge...")
        
        # Trigger the Meta-MCP to build the capability
        # This would call helpermcp_mcp:jit_forge in a full implementation
        
        return {
            "success": False,
            "error": f"Tool '{tool_name}' not found",
            "action_required": "jit_forge",
            "suggestion": f"Use helpermcp:jit_forge to create a tool for: {tool_name}",
        }
    
    def set_missing_capability_handler(self, handler: Callable):
        """Set a callback for when a capability is missing."""
        self._on_missing_capability = handler
    
    def get_status(self) -> dict[str, Any]:
        """Get orchestrator status."""
        return {
            "active_servers": self.server_manager.get_active_servers(),
            "available_servers": self.server_manager.discover_servers(),
            "total_tools": len(self._tool_registry),
            "workspace": str(self.workspace.workspace),
        }
    
    def get_all_tools(self) -> list[dict]:
        """Get all available tools across all servers."""
        tools = []
        for tool_name, server_name in sorted(self._tool_registry.items()):
            tools.append({
                "tool": tool_name,
                "server": server_name,
            })
        return tools

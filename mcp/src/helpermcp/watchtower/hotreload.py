"""Hot-Reload - Live tool refresh without restart."""

import asyncio
import json
import os
import signal
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from helpermcp.core import settings


@dataclass
class HotReloadResult:
    """Result of a hot-reload operation."""
    
    success: bool
    method: str  # "sighup", "jsonrpc", or "file"
    tools_reloaded: int = 0
    error: str | None = None


class HotReloader:
    """
    Hot-reload integration for SuperMCP.
    
    Methods:
    1. SIGHUP signal to process
    2. JSON-RPC notification
    3. File-based trigger
    """

    def __init__(
        self,
        supermcp_pid: int | None = None,
        supermcp_url: str = "http://localhost:8000",
    ):
        self.supermcp_pid = supermcp_pid
        self.supermcp_url = supermcp_url
        self._trigger_file = settings.output_dir / ".hot-reload-trigger"

    async def reload(self, method: str = "auto") -> HotReloadResult:
        """
        Trigger a hot-reload of SuperMCP tools.
        
        Args:
            method: "sighup", "jsonrpc", "file", or "auto" (try all)
        """
        if method == "auto":
            # Try methods in order of preference
            for m in ["sighup", "jsonrpc", "file"]:
                result = await self.reload(m)
                if result.success:
                    return result
            return HotReloadResult(
                success=False,
                method="auto",
                error="All methods failed",
            )
        
        if method == "sighup":
            return await self._reload_sighup()
        elif method == "jsonrpc":
            return await self._reload_jsonrpc()
        elif method == "file":
            return await self._reload_file()
        else:
            return HotReloadResult(
                success=False,
                method=method,
                error=f"Unknown method: {method}",
            )

    async def _reload_sighup(self) -> HotReloadResult:
        """Send SIGHUP to SuperMCP process."""
        pid = self.supermcp_pid or self._find_supermcp_pid()
        
        if not pid:
            return HotReloadResult(
                success=False,
                method="sighup",
                error="SuperMCP process not found",
            )
        
        try:
            os.kill(pid, signal.SIGHUP)
            # Wait briefly for reload
            await asyncio.sleep(0.5)
            return HotReloadResult(
                success=True,
                method="sighup",
            )
        except ProcessLookupError:
            return HotReloadResult(
                success=False,
                method="sighup",
                error=f"Process {pid} not found",
            )
        except PermissionError:
            return HotReloadResult(
                success=False,
                method="sighup",
                error=f"Permission denied for process {pid}",
            )

    async def _reload_jsonrpc(self) -> HotReloadResult:
        """Send JSON-RPC notification to SuperMCP."""
        import httpx
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self.supermcp_url}/jsonrpc",
                    json={
                        "jsonrpc": "2.0",
                        "method": "tools/refresh",
                        "id": 1,
                    },
                )
                
                if response.status_code == 200:
                    data = response.json()
                    tools_count = data.get("result", {}).get("tools_reloaded", 0)
                    return HotReloadResult(
                        success=True,
                        method="jsonrpc",
                        tools_reloaded=tools_count,
                    )
                else:
                    return HotReloadResult(
                        success=False,
                        method="jsonrpc",
                        error=f"HTTP {response.status_code}",
                    )
                    
        except Exception as e:
            return HotReloadResult(
                success=False,
                method="jsonrpc",
                error=str(e),
            )

    async def _reload_file(self) -> HotReloadResult:
        """Create a trigger file for SuperMCP to detect."""
        try:
            self._trigger_file.parent.mkdir(parents=True, exist_ok=True)
            self._trigger_file.write_text(json.dumps({
                "timestamp": asyncio.get_event_loop().time(),
                "action": "reload",
            }))
            return HotReloadResult(
                success=True,
                method="file",
            )
        except Exception as e:
            return HotReloadResult(
                success=False,
                method="file",
                error=str(e),
            )

    def _find_supermcp_pid(self) -> int | None:
        """Try to find SuperMCP process ID."""
        try:
            import subprocess
            result = subprocess.run(
                ["pgrep", "-f", "supermcp"],
                capture_output=True,
                text=True,
            )
            if result.returncode == 0 and result.stdout.strip():
                return int(result.stdout.strip().split()[0])
        except Exception:
            pass
        
        # Check PID file
        pid_file = settings.output_dir / "supermcp.pid"
        if pid_file.exists():
            try:
                return int(pid_file.read_text().strip())
            except ValueError:
                pass
        
        return None


async def notify_tool_certified(tool_name: str, service_name: str):
    """
    Called when a tool is certified.
    
    Triggers hot-reload and updates registry.
    """
    from helpermcp.registry import RegistryDatabase
    
    # Hot-reload SuperMCP
    reloader = HotReloader()
    result = await reloader.reload()
    
    if result.success:
        print(f"✓ Hot-reload triggered via {result.method}")
    else:
        print(f"✗ Hot-reload failed: {result.error}")
    
    return result

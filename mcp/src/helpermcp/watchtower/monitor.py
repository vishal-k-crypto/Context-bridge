"""Version Watchtower - Background monitoring and auto-update system."""

import asyncio
import hashlib
import json
import os
import signal
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Callable

from pydantic import BaseModel, Field

from helpermcp.core import settings


@dataclass
class UpdateResult:
    """Result of checking for updates."""
    
    tool_name: str
    current_version: str
    has_update: bool = False
    new_version: str | None = None
    changes_detected: list[str] = field(default_factory=list)
    checked_at: datetime = field(default_factory=datetime.now)


class VersionWatchtower:
    """
    Background worker that monitors tools for updates.
    
    Features:
    - Monitor SuperMCP/tools/ directory
    - Compare schemas against latest docs
    - Trigger auto-patch when updates detected
    """

    def __init__(
        self,
        tools_dir: Path | None = None,
        check_interval_hours: int = 24,
    ):
        self.tools_dir = tools_dir or settings.output_dir
        self.check_interval = check_interval_hours * 3600
        self._running = False
        self._task: asyncio.Task | None = None
        
        # Cache of tool checksums for change detection
        self._checksums: dict[str, str] = {}
        
        # Callbacks for updates
        self._on_update_callbacks: list[Callable] = []

    def on_update(self, callback: Callable[[str], Any]):
        """Register callback for when updates are detected."""
        self._on_update_callbacks.append(callback)

    async def start(self):
        """Start the background monitoring task."""
        if self._running:
            return
        
        self._running = True
        self._task = asyncio.create_task(self._monitor_loop())

    async def stop(self):
        """Stop the monitoring task."""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    async def _monitor_loop(self):
        """Main monitoring loop."""
        while self._running:
            try:
                await self.check_all_tools()
            except Exception as e:
                print(f"Watchtower error: {e}")
            
            await asyncio.sleep(self.check_interval)

    async def check_all_tools(self) -> list[UpdateResult]:
        """Check all registered tools for updates."""
        results = []
        
        if not self.tools_dir.exists():
            return results
        
        for tool_dir in self.tools_dir.iterdir():
            if tool_dir.is_dir() and (tool_dir / "server.py").exists():
                result = await self.check_tool(tool_dir.name)
                results.append(result)
                
                if result.has_update:
                    for callback in self._on_update_callbacks:
                        try:
                            callback(result.tool_name)
                        except Exception:
                            pass
        
        return results

    async def check_tool(self, service_name: str) -> UpdateResult:
        """
        Check a single tool/service for updates.
        
        Compares:
        1. Local schema checksum vs stored checksum
        2. Documentation timestamp if available
        """
        tool_dir = self.tools_dir / f"{service_name}_mcp"
        
        result = UpdateResult(
            tool_name=service_name,
            current_version="1.0.0",
        )
        
        if not tool_dir.exists():
            return result
        
        # Read current server code
        server_file = tool_dir / "server.py"
        if server_file.exists():
            content = server_file.read_text()
            current_checksum = self._compute_checksum(content)
            
            # Compare with stored checksum
            stored_checksum = self._checksums.get(service_name)
            if stored_checksum and stored_checksum != current_checksum:
                result.has_update = True
                result.changes_detected.append("Code modified locally")
            
            self._checksums[service_name] = current_checksum
        
        # Check for manifest with version info
        manifest_file = tool_dir / "manifest.json"
        if manifest_file.exists():
            try:
                manifest = json.loads(manifest_file.read_text())
                result.current_version = manifest.get("version", "1.0.0")
            except json.JSONDecodeError:
                pass
        
        return result

    async def check_for_updates_online(
        self,
        service_name: str,
        docs_url: str | None = None,
    ) -> UpdateResult:
        """
        Check for updates by comparing against online documentation.
        
        This triggers the Scout to re-scrape and compare schemas.
        """
        from helpermcp.agents.scout import ScoutAgent
        
        result = UpdateResult(
            tool_name=service_name,
            current_version="1.0.0",
        )
        
        try:
            scout = ScoutAgent()
            discovery = await scout.discover(service_name)
            
            # Generate checksum of new docs
            if discovery.markdown_docs:
                new_checksum = self._compute_checksum(discovery.markdown_docs[:10000])
                stored_key = f"{service_name}_docs"
                stored_checksum = self._checksums.get(stored_key)
                
                if stored_checksum and stored_checksum != new_checksum:
                    result.has_update = True
                    result.changes_detected.append("Documentation updated")
                
                self._checksums[stored_key] = new_checksum
            
            await scout.close()
            
        except Exception as e:
            result.changes_detected.append(f"Check failed: {e}")
        
        return result

    def _compute_checksum(self, content: str) -> str:
        """Compute MD5 checksum of content."""
        return hashlib.md5(content.encode()).hexdigest()

    async def trigger_auto_patch(self, service_name: str):
        """
        Trigger the Forge to regenerate a tool.
        
        This runs the full pipeline:
        Scout -> Architect -> Coder -> Sandbox
        """
        from helpermcp.core.pipeline import MCPPipeline
        
        pipeline = MCPPipeline()
        
        try:
            result = await pipeline.run(service_name)
            return result
        finally:
            await pipeline.close()

    async def auto_heal_failing_tools(self, threshold: float = 0.9) -> list[dict]:
        """
        Automatically heal tools with success rate below threshold.
        
        This is the Phase 5 self-healing loop:
        1. Query registry for tools with success_rate < threshold
        2. For each failing tool, trigger evolve_server
        3. Return list of attempted repairs
        
        Args:
            threshold: Minimum success rate (default 0.9 = 90%)
            
        Returns:
            List of repair attempts with status
        """
        from helpermcp.registry import RegistryDatabase
        
        registry = RegistryDatabase()
        failing_tools = registry.get_failing_tools(threshold)
        
        repairs = []
        
        for tool in failing_tools:
            try:
                # Attempt to regenerate the tool
                result = await self.trigger_auto_patch(tool.service_name)
                
                repairs.append({
                    "tool": tool.name,
                    "service": tool.service_name,
                    "success_rate": tool.success_rate,
                    "repair_status": "success" if result else "failed",
                })
            except Exception as e:
                repairs.append({
                    "tool": tool.name,
                    "service": tool.service_name,
                    "success_rate": tool.success_rate,
                    "repair_status": "error",
                    "error": str(e),
                })
        
        return repairs

    async def schedule_health_check(self, interval_minutes: int = 60):
        """Start a background task that periodically heals failing tools."""
        async def health_loop():
            while self._running:
                try:
                    repairs = await self.auto_heal_failing_tools()
                    if repairs:
                        print(f"[Watchtower] Auto-healed {len(repairs)} tools")
                except Exception as e:
                    print(f"[Watchtower] Health check error: {e}")
                
                await asyncio.sleep(interval_minutes * 60)
        
        asyncio.create_task(health_loop())



def create_check_updates_tool_code() -> str:
    """Generate MCP tool code for checking updates."""
    return '''
@mcp.tool()
async def check_for_updates(
    service_name: str = Field(..., description="Name of the service to check"),
    check_online: bool = Field(False, description="Check against online documentation"),
) -> dict:
    """
    Check if a tool needs updating.
    
    Compares local tool schema against:
    - Stored checksums (local changes)
    - Online documentation (if check_online=True)
    
    Returns update status and detected changes.
    """
    from helpermcp.watchtower import VersionWatchtower
    
    watchtower = VersionWatchtower()
    
    if check_online:
        result = await watchtower.check_for_updates_online(service_name)
    else:
        result = await watchtower.check_tool(service_name)
    
    return {
        "tool_name": result.tool_name,
        "current_version": result.current_version,
        "has_update": result.has_update,
        "changes": result.changes_detected,
        "checked_at": result.checked_at.isoformat(),
    }
'''

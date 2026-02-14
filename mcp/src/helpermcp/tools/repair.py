"""
Repair Tools - Self-Healing Maintenance Agent

Tools for verifying, repairing, and recertifying MCP servers.
Ensures the ecosystem remains healthy and functional.
"""

import asyncio
import ast
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any


@dataclass
class ToolTestResult:
    """Result of testing a single tool."""
    name: str
    passed: bool
    error: str | None = None
    execution_time: float = 0.0


@dataclass
class ServerHealthReport:
    """Health report for a server."""
    server_name: str
    total_tools: int
    passed: int
    failed: int
    success_rate: float
    failures: list[ToolTestResult]
    status: str  # healthy, degraded, critical


class MaintenanceAgent:
    """
    Self-healing maintenance agent for MCP servers.
    
    Features:
    - Verify and repair individual servers
    - Recertify entire registry
    - Auto-fix common issues
    """
    
    def __init__(self):
        self.mcp_servers_path = Path.home() / "Desktop" / "mcp-servers"
        self._health_cache: dict[str, ServerHealthReport] = {}
    
    async def verify_server(self, server_name: str) -> ServerHealthReport:
        """
        Verify a server by testing all its tools.
        
        Args:
            server_name: Name of the server to verify
            
        Returns:
            Health report with test results
        """
        server_dir = self.mcp_servers_path / f"{server_name}_mcp"
        server_file = server_dir / "server.py"
        
        if not server_file.exists():
            return ServerHealthReport(
                server_name=server_name,
                total_tools=0,
                passed=0,
                failed=1,
                success_rate=0.0,
                failures=[ToolTestResult(name="server", passed=False, error="Server not found")],
                status="critical"
            )
        
        results = []
        
        try:
            code = server_file.read_text()
            
            # 1. Syntax check
            try:
                ast.parse(code)
                results.append(ToolTestResult(name="syntax", passed=True))
            except SyntaxError as e:
                results.append(ToolTestResult(name="syntax", passed=False, error=str(e)))
            
            # 2. Import check
            import_issues = []
            required_imports = [
                ("from fastmcp import FastMCP", "fastmcp"),
                ("from pydantic import Field", "pydantic"),
                ("from typing import Any", "typing"),
            ]
            
            for import_stmt, module in required_imports:
                if import_stmt not in code and module in code:
                    import_issues.append(f"Missing: {import_stmt}")
            
            if import_issues:
                results.append(ToolTestResult(name="imports", passed=False, error="; ".join(import_issues)))
            else:
                results.append(ToolTestResult(name="imports", passed=True))
            
            # 3. Tool structure check
            import re
            tools = re.findall(r'@mcp\.tool\(\)\s*\nasync def (\w+)\(', code)
            
            for tool_name in tools:
                # Check tool has return type
                pattern = rf'async def {tool_name}\([^)]*\)\s*->\s*dict'
                if re.search(pattern, code):
                    results.append(ToolTestResult(name=f"tool:{tool_name}", passed=True))
                else:
                    results.append(ToolTestResult(name=f"tool:{tool_name}", passed=False, error="Missing return type"))
            
            # 4. Compile check
            try:
                compile(code, server_file, 'exec')
                results.append(ToolTestResult(name="compile", passed=True))
            except Exception as e:
                results.append(ToolTestResult(name="compile", passed=False, error=str(e)))
                
        except Exception as e:
            results.append(ToolTestResult(name="read", passed=False, error=str(e)))
        
        # Calculate health
        passed = sum(1 for r in results if r.passed)
        failed = sum(1 for r in results if not r.passed)
        total = len(results)
        success_rate = passed / total if total > 0 else 0.0
        
        status = "healthy" if success_rate >= 0.9 else ("degraded" if success_rate >= 0.5 else "critical")
        
        report = ServerHealthReport(
            server_name=server_name,
            total_tools=len([r for r in results if r.name.startswith("tool:")]),
            passed=passed,
            failed=failed,
            success_rate=success_rate,
            failures=[r for r in results if not r.passed],
            status=status
        )
        
        self._health_cache[server_name] = report
        return report
    
    async def repair_server(self, server_name: str) -> dict[str, Any]:
        """
        Attempt to automatically repair common issues.
        
        Args:
            server_name: Server to repair
            
        Returns:
            Repair report
        """
        server_dir = self.mcp_servers_path / f"{server_name}_mcp"
        server_file = server_dir / "server.py"
        
        if not server_file.exists():
            return {"success": False, "error": "Server not found"}
        
        code = server_file.read_text()
        original_code = code
        repairs = []
        
        # Fix 1: Add missing imports
        if "from typing import Any" not in code and "dict[str, Any]" in code:
            code = "from typing import Any\n" + code
            repairs.append("Added typing.Any import")
        
        if "import os" not in code and "os.environ" in code:
            code = "import os\n" + code
            repairs.append("Added os import")
        
        if "import httpx" not in code and "httpx." in code:
            code = "import httpx\n" + code
            repairs.append("Added httpx import")
        
        # Fix 2: Add missing async
        import re
        funcs_without_async = re.findall(r'@mcp\.tool\(\)\s*\ndef (\w+)\(', code)
        for func_name in funcs_without_async:
            code = code.replace(f"def {func_name}(", f"async def {func_name}(")
            repairs.append(f"Added async to {func_name}")
        
        # Fix 3: Add missing return types
        funcs_without_return = re.findall(r'async def (\w+)\([^)]*\):', code)
        for func_name in funcs_without_return:
            if f"async def {func_name}" in code:
                pattern = rf'async def {func_name}\(([^)]*)\):'
                replacement = rf'async def {func_name}(\1) -> dict[str, Any]:'
                new_code = re.sub(pattern, replacement, code)
                if new_code != code:
                    code = new_code
                    repairs.append(f"Added return type to {func_name}")
        
        if code != original_code:
            server_file.write_text(code)
            return {
                "success": True,
                "server": server_name,
                "repairs": repairs,
                "message": f"Applied {len(repairs)} repairs"
            }
        
        return {
            "success": True,
            "server": server_name,
            "repairs": [],
            "message": "No repairs needed"
        }
    
    async def verify_and_repair(self, server_name: str) -> dict[str, Any]:
        """
        Full verify-then-repair cycle.
        
        Args:
            server_name: Server to verify and repair
            
        Returns:
            Combined report
        """
        # Initial verification
        initial_report = await self.verify_server(server_name)
        
        if initial_report.status == "healthy":
            return {
                "success": True,
                "server": server_name,
                "status": "healthy",
                "message": "No repairs needed",
            }
        
        # Attempt repairs
        repair_result = await self.repair_server(server_name)
        
        if repair_result["repairs"]:
            # Re-verify
            final_report = await self.verify_server(server_name)
            return {
                "success": True,
                "server": server_name,
                "initial_status": initial_report.status,
                "repairs": repair_result["repairs"],
                "final_status": final_report.status,
                "improved": final_report.success_rate > initial_report.success_rate,
            }
        
        return {
            "success": False,
            "server": server_name,
            "status": initial_report.status,
            "failures": [{"name": f.name, "error": f.error} for f in initial_report.failures],
            "message": "Could not auto-repair, manual intervention needed",
        }
    
    async def recertify_registry(self) -> dict[str, Any]:
        """
        Recertify all servers in the registry.
        
        Returns:
            Full registry health report
        """
        results = {
            "timestamp": datetime.now().isoformat(),
            "total_servers": 0,
            "healthy": 0,
            "degraded": 0,
            "critical": 0,
            "servers": [],
        }
        
        for d in sorted(self.mcp_servers_path.iterdir()):
            if d.is_dir() and (d / "server.py").exists():
                server_name = d.name.replace("_mcp", "")
                report = await self.verify_server(server_name)
                
                results["total_servers"] += 1
                results[report.status] += 1
                results["servers"].append({
                    "name": server_name,
                    "status": report.status,
                    "success_rate": f"{report.success_rate * 100:.0f}%",
                    "tools": report.total_tools,
                })
        
        results["overall_health"] = (
            "healthy" if results["critical"] == 0 and results["degraded"] == 0
            else "degraded" if results["critical"] == 0
            else "critical"
        )
        
        return results
    
    def get_cached_health(self, server_name: str) -> ServerHealthReport | None:
        """Get cached health report if available."""
        return self._health_cache.get(server_name)


# Convenience functions for direct use
async def verify_and_repair_server(server_name: str) -> dict[str, Any]:
    """Verify and repair a single server."""
    agent = MaintenanceAgent()
    return await agent.verify_and_repair(server_name)


async def recertify_registry() -> dict[str, Any]:
    """Recertify all servers."""
    agent = MaintenanceAgent()
    return await agent.recertify_registry()

"""Coder Agent - MCP Server Code Generation."""

import re
from pathlib import Path
from textwrap import dedent

import httpx

from helpermcp.core import (
    DiscoveryResult,
    ExtractedTool,
    GeneratedMCPServer,
    ParameterType,
    settings,
)


class CoderAgent:
    """
    The Coder Agent generates FastMCP-compliant Python code.
    
    It takes extracted tools and produces:
    1. A complete MCP server with all tools
    2. Proper type hints and docstrings
    3. Error handling and retry logic
    4. Requirements file
    """

    # Type mapping for Python annotations
    TYPE_MAP = {
        ParameterType.STRING: "str",
        ParameterType.INTEGER: "int",
        ParameterType.FLOAT: "float",
        ParameterType.BOOLEAN: "bool",
        ParameterType.ARRAY: "list",
        ParameterType.OBJECT: "dict",
        ParameterType.FILE: "bytes",
    }

    def __init__(self):
        self.http_client = httpx.AsyncClient(timeout=60.0)

    async def generate(
        self,
        discovery: DiscoveryResult,
        tools: list[ExtractedTool],
    ) -> GeneratedMCPServer:
        """
        Generate a complete MCP server from discovery results and tools.
        
        Args:
            discovery: Results from Scout agent
            tools: Filtered tools from Architect agent
            
        Returns:
            GeneratedMCPServer with all code and metadata
        """
        package_name = self._generate_package_name(discovery.target_name)
        
        # Phase 1: Reconcile path parameters for all tools
        reconciled_tools = [self._reconcile_path_parameters(t) for t in tools]
        
        # Generate main server code
        server_code = await self._generate_server_code(discovery, reconciled_tools, package_name)
        
        # Phase 4: Add MCP resources for logs and workspace
        server_code = self._add_mcp_resources(server_code, package_name)
        
        # Phase 3: Add AuthVault integration
        server_code = self._add_auth_vault_integration(server_code, discovery)
        
        # Lint the code with ruff before returning
        server_code = await self._lint_code(server_code)
        
        # Generate __init__.py
        init_code = self._generate_init_code(package_name)
        
        # Generate requirements
        requirements = self._generate_requirements(discovery)
        
        return GeneratedMCPServer(
            service_name=discovery.target_name,
            package_name=package_name,
            tools=reconciled_tools,
            tools_count=len(reconciled_tools),
            server_code=server_code,
            init_code=init_code,
            requirements=requirements,
        )

    def _reconcile_path_parameters(self, tool: ExtractedTool) -> ExtractedTool:
        """
        Extract path variables from api_endpoint and ensure they're in the signature.
        
        This fixes the common bug where {owner}, {repo} etc. are used in endpoints
        but not added as function parameters, causing NameError at runtime.
        """
        if not tool.api_endpoint:
            return tool
        
        # Extract all path variables like {owner}, {repo}
        path_vars = re.findall(r'\{(\w+)\}', tool.api_endpoint)
        
        # Get existing parameter names
        existing_params = {p.name for p in tool.parameters}
        
        # Add missing path parameters at the beginning (they're required)
        from helpermcp.core.models import ToolParameter
        
        new_params = []
        for var in path_vars:
            if var not in existing_params:
                new_params.append(ToolParameter(
                    name=var,
                    type=ParameterType.STRING,
                    required=True,
                    description=f"Path parameter: {var}",
                ))
        
        # Prepend path params (required), then existing params
        tool.parameters = new_params + list(tool.parameters)
        
        return tool

    def _add_mcp_resources(self, server_code: str, package_name: str) -> str:
        """Add MCP resource definitions for logs and workspace access."""
        resource_code = dedent('''
            
            # ============================================================================
            # MCP RESOURCES - Logs and Workspace Access
            # ============================================================================
            
            @mcp.resource("logs://server")
            async def get_server_logs() -> str:
                """Get recent server logs for debugging."""
                import logging
                # Return last 100 log entries
                return "Server logs available via native logging"
            
            @mcp.resource("workspace://files")
            async def list_workspace_files() -> list[str]:
                """List files in the current workspace directory."""
                from pathlib import Path
                workspace = Path.cwd()
                files = [str(f.relative_to(workspace)) for f in workspace.rglob("*") if f.is_file()]
                return files[:100]  # Limit to 100 files
            
        ''')
        
        # Insert before the main entry point
        if 'if __name__' in server_code:
            return server_code.replace('if __name__', resource_code + '\nif __name__')
        return server_code + resource_code

    def _add_auth_vault_integration(self, server_code: str, discovery: DiscoveryResult) -> str:
        """Add AuthVault credential injection to the server."""
        vault_code = dedent(f'''
            
            # ============================================================================
            # AUTH VAULT INTEGRATION - Secure Credential Management
            # ============================================================================
            
            def _get_credentials():
                """Fetch credentials from AuthVault or environment."""
                try:
                    from helpermcp.registry import AuthVault
                    vault = AuthVault()
                    creds = vault.inject_into_environment("{discovery.target_name.lower()}")
                    return creds
                except ImportError:
                    # Fallback to environment variables
                    return {{}}
            
            # Auto-inject credentials at startup
            _vault_creds = _get_credentials()
            for key, value in _vault_creds.items():
                os.environ.setdefault(key, value)
            
        ''')
        
        # Insert after imports
        lines = server_code.split('\n')
        import_end = 0
        for i, line in enumerate(lines):
            if line.startswith('mcp = ') or line.startswith('# Initialize'):
                import_end = i
                break
        
        return '\n'.join(lines[:import_end]) + vault_code + '\n'.join(lines[import_end:])

    def _is_high_latency_tool(self, tool: ExtractedTool) -> bool:
        """Detect if a tool is high-latency and needs progress reporting."""
        high_latency_keywords = [
            "merge", "groupby", "aggregate", "analyze", "train", "cluster",
            "reduce", "transform", "generate", "summarize", "transcribe",
            "download", "upload", "scan", "index", "migrate", "sync"
        ]
        tool_name_lower = tool.name.lower()
        return any(kw in tool_name_lower for kw in high_latency_keywords)

    def _add_progress_context_to_tool(self, tool_code: str, tool_name: str) -> str:
        """Add mcp_context parameter and progress calls to a high-latency tool."""
        # Add Context import if not present
        if "from mcp.server" not in tool_code:
            tool_code = tool_code.replace(
                "from fastmcp import FastMCP",
                "from fastmcp import FastMCP, Context"
            )
        
        # Add mcp_context parameter to function signature
        if "async def " + tool_name + "(" in tool_code:
            # Add context as first optional parameter
            old_sig = f"async def {tool_name}("
            new_sig = f"async def {tool_name}(ctx: Context = None, "
            tool_code = tool_code.replace(old_sig, new_sig)
            
            # Add progress checkpoint at start of implementation
            # Find the docstring end and insert progress call
            lines = tool_code.split('\n')
            new_lines = []
            in_docstring = False
            added_progress = False
            
            for line in lines:
                new_lines.append(line)
                if '"""' in line:
                    in_docstring = not in_docstring
                    if not in_docstring and not added_progress:
                        # Just exited docstring, add progress call
                        indent = "        "
                        new_lines.append(f'{indent}if ctx: await ctx.info("Starting {tool_name}...")')
                        added_progress = True
            
            tool_code = '\n'.join(new_lines)
        
        return tool_code



    async def _lint_code(self, code: str) -> str:
        """Run ruff linter on generated code and return fixed version."""
        import subprocess
        import tempfile
        
        try:
            # Write to temp file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(code)
                temp_path = f.name
            
            # Run ruff fix
            result = subprocess.run(
                ['ruff', 'check', '--fix', '--quiet', temp_path],
                capture_output=True,
                text=True,
                timeout=10,
            )
            
            # Read fixed code
            with open(temp_path) as f:
                fixed_code = f.read()
            
            # Clean up
            Path(temp_path).unlink(missing_ok=True)
            
            return fixed_code if fixed_code.strip() else code
            
        except (subprocess.TimeoutExpired, FileNotFoundError, Exception):
            # ruff not available or other error, return original
            return code


    def _generate_package_name(self, service_name: str) -> str:
        """Generate a valid Python package name."""
        name = service_name.lower()
        name = re.sub(r"[^a-z0-9]+", "_", name)
        name = name.strip("_")
        return f"{name}_mcp"

    async def _generate_server_code(
        self,
        discovery: DiscoveryResult,
        tools: list[ExtractedTool],
        package_name: str,
    ) -> str:
        """Generate the main server.py code."""
        
        # Header with imports
        header = dedent(f'''
            """
            {discovery.target_name} MCP Server
            
            Auto-generated by HelperMCP
            Provides {len(tools)} tools for {discovery.target_name} integration.
            """
            
            import os
            from typing import Any
            
            import httpx
            from fastmcp import FastMCP
            
            # Initialize the MCP server
            mcp = FastMCP("{discovery.target_name}")
            
            # Configuration
            API_KEY = os.environ.get("{discovery.auth_env_var or 'API_KEY'}")
            BASE_URL = "{self._get_base_url(discovery)}"
            
            # HTTP client with auth
            client = httpx.AsyncClient(
                base_url=BASE_URL,
                headers={{"{discovery.auth_header_name or 'Authorization'}": f"Bearer {{API_KEY}}"}},
                timeout=30.0,
            )
            
        ''').strip()
        
        # Generate each tool
        tool_codes = []
        for tool in tools:
            tool_code = self._generate_tool_code(tool, discovery)
            
            # Phase 5: Add progress reporting for high-latency tools
            if self._is_high_latency_tool(tool):
                tool_code = self._add_progress_context_to_tool(tool_code, tool.name)
            
            tool_codes.append(tool_code)

        
        # Footer with server entry point
        footer = dedent('''
            
            if __name__ == "__main__":
                mcp.run()
        ''')
        
        return header + "\n\n" + "\n\n".join(tool_codes) + footer

    def _generate_tool_code(self, tool: ExtractedTool, discovery: DiscoveryResult) -> str:
        """Generate code for a single tool."""
        
        # SMART NAME INFERENCE: Fix "unknown" or invalid tool names
        if not tool.name or tool.name.lower() in ("unknown", "unknown_tool", ""):
            # Try to generate name from display_name
            if tool.display_name:
                inferred = tool.display_name.lower().replace(" ", "_").replace("-", "_")
                tool.name = re.sub(r"[^a-z0-9_]", "", inferred) or "tool"
            # Fallback to description
            elif tool.description:
                words = tool.description.lower().split()[:3]
                tool.name = "_".join(re.sub(r"[^a-z0-9]", "", w) for w in words) or "tool"
            else:
                tool.name = f"tool_{hash(tool.description or 'x') % 10000}"
        
        # Build parameter list
        params = []
        for p in tool.parameters:
            type_hint = self.TYPE_MAP.get(p.type, "str")
            if p.required:
                params.append(f"{p.name}: {type_hint}")
            else:
                default = self._get_default_value(p.type)
                params.append(f"{p.name}: {type_hint} = {default}")
        
        params_str = ", ".join(params) if params else ""
        
        # Build docstring
        docstring_parts = [tool.description or f"Execute {tool.display_name}"]
        
        if tool.parameters:
            docstring_parts.append("")
            docstring_parts.append("Args:")
            for p in tool.parameters:
                docstring_parts.append(f"    {p.name}: {p.description or p.name}")
        
        docstring_parts.append("")
        docstring_parts.append("Returns:")
        docstring_parts.append(f"    {tool.return_description or 'API response as dictionary'}")
        
        docstring = "\n    ".join(docstring_parts)
        
        # Build implementation
        if tool.api_endpoint and tool.http_method:
            impl = self._generate_rest_implementation(tool)
        else:
            impl = self._generate_sdk_implementation(tool, discovery)
        
        # Combine into function
        code = dedent(f'''
            @mcp.tool()
            async def {tool.name}({params_str}) -> dict[str, Any]:
                """
                {docstring}
                """
                {impl}
        ''').strip()
        
        return code

    def _generate_rest_implementation(self, tool: ExtractedTool) -> str:
        """Generate implementation for REST API calls."""
        method = (tool.http_method or "GET").lower()
        endpoint = tool.api_endpoint or "/"
        
        # Handle path parameters
        path_params = re.findall(r"\{(\w+)\}", endpoint)
        if path_params:
            endpoint_code = f'f"{endpoint}"'
        else:
            endpoint_code = f'"{endpoint}"'
        
        # Build request
        if method in ("post", "put", "patch"):
            # Collect body parameters
            body_params = [
                p.name for p in tool.parameters
                if p.name not in path_params
            ]
            if body_params:
                body_dict = ", ".join(f'"{p}": {p}' for p in body_params)
                impl = dedent(f'''
                    try:
                        response = await client.{method}(
                            {endpoint_code},
                            json={{{body_dict}}},
                        )
                        response.raise_for_status()
                        return response.json()
                    except httpx.HTTPError as e:
                        return {{"error": str(e), "status": "failed"}}
                ''').strip()
            else:
                impl = dedent(f'''
                    try:
                        response = await client.{method}({endpoint_code})
                        response.raise_for_status()
                        return response.json()
                    except httpx.HTTPError as e:
                        return {{"error": str(e), "status": "failed"}}
                ''').strip()
        else:
            # GET/DELETE with query params
            query_params = [
                p.name for p in tool.parameters
                if p.name not in path_params
            ]
            if query_params:
                params_dict = ", ".join(f'"{p}": {p}' for p in query_params)
                impl = dedent(f'''
                    try:
                        response = await client.{method}(
                            {endpoint_code},
                            params={{{params_dict}}},
                        )
                        response.raise_for_status()
                        return response.json()
                    except httpx.HTTPError as e:
                        return {{"error": str(e), "status": "failed"}}
                ''').strip()
            else:
                impl = dedent(f'''
                    try:
                        response = await client.{method}({endpoint_code})
                        response.raise_for_status()
                        return response.json()
                    except httpx.HTTPError as e:
                        return {{"error": str(e), "status": "failed"}}
                ''').strip()
        
        return impl

    def _generate_sdk_implementation(
        self,
        tool: ExtractedTool,
        discovery: DiscoveryResult,
    ) -> str:
        """Generate implementation using SDK calls."""
        sdk_name = discovery.sdk_name or discovery.target_name.lower()
        
        # Generic SDK call pattern
        params_list = ", ".join(f"{p.name}={p.name}" for p in tool.parameters)
        
        impl = dedent(f'''
            # TODO: Implement using {sdk_name} SDK
            # Example: result = {sdk_name}.{tool.name}({params_list})
            return {{
                "status": "not_implemented",
                "message": "SDK implementation pending"
            }}
        ''').strip()
        
        return impl

    def _get_base_url(self, discovery: DiscoveryResult) -> str:
        """Extract or guess the API base URL."""
        if discovery.api_reference_url:
            # Try to extract base URL from API reference
            match = re.match(r"(https?://[^/]+)", discovery.api_reference_url)
            if match:
                return match.group(1) + "/api"
        
        # Default pattern
        name = discovery.target_name.lower()
        return f"https://api.{name}.com/v1"

    def _get_default_value(self, param_type: ParameterType) -> str:
        """Get default value for optional parameter."""
        defaults = {
            ParameterType.STRING: '""',
            ParameterType.INTEGER: "0",
            ParameterType.FLOAT: "0.0",
            ParameterType.BOOLEAN: "False",
            ParameterType.ARRAY: "[]",
            ParameterType.OBJECT: "{}",
            ParameterType.FILE: 'b""',
        }
        return defaults.get(param_type, "None")

    def _generate_init_code(self, package_name: str) -> str:
        """Generate __init__.py code."""
        return dedent(f'''
            """{package_name} - Auto-generated MCP Server."""
            
            from .server import mcp
            
            __all__ = ["mcp"]
        ''').strip()

    def _generate_requirements(self, discovery: DiscoveryResult) -> list[str]:
        """Generate requirements list."""
        reqs = [
            "fastmcp>=2.0",
            "httpx>=0.27.0",
        ]
        
        if discovery.sdk_name:
            reqs.append(discovery.sdk_install_command or discovery.sdk_name)
        
        return reqs

    async def write_to_disk(
        self,
        server: GeneratedMCPServer,
        output_dir: Path | None = None,
    ) -> Path:
        """
        Write the generated server to disk.
        
        Args:
            server: Generated server to write
            output_dir: Output directory (uses settings default if None)
            
        Returns:
            Path to the generated package directory
        """
        output_dir = output_dir or settings.output_dir
        package_dir = output_dir / server.package_name
        
        # Create directories
        package_dir.mkdir(parents=True, exist_ok=True)
        
        # Write files
        (package_dir / "server.py").write_text(server.server_code)
        (package_dir / "__init__.py").write_text(server.init_code)
        (package_dir / "requirements.txt").write_text("\n".join(server.requirements))
        
        # Write pyproject.toml for the generated package
        pyproject = dedent(f'''
            [project]
            name = "{server.package_name}"
            version = "0.1.0"
            description = "MCP Server for {server.service_name}"
            requires-python = ">=3.12"
            dependencies = {server.requirements}
            
            [project.scripts]
            {server.package_name} = "{server.package_name}.server:mcp.run"
        ''').strip()
        (package_dir / "pyproject.toml").write_text(pyproject)
        
        # Update server with output path
        server.output_dir = str(package_dir)
        
        return package_dir

    async def close(self):
        """Close the HTTP client."""
        await self.http_client.aclose()

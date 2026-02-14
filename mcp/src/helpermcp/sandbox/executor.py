"""Docker Sandbox - Self-healing execution with 3-strike certification."""

import asyncio
import tempfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from helpermcp.core import ExtractedTool, GeneratedMCPServer, TestResult, settings


@dataclass
class CertificationResult:
    """Result of the 3-strike certification process."""
    
    certified: bool = False
    attempts: int = 0
    consecutive_successes: int = 0
    test_results: list[TestResult] = field(default_factory=list)
    final_code: str = ""
    error_history: list[str] = field(default_factory=list)


class SandboxExecutor:
    """
    Docker-based sandbox with self-healing and 3-strike certification.
    
    Certification process:
    1. Generate tool code
    2. Deploy to Docker sandbox
    3. Run mock client test
    4. If fail: capture traceback, auto-fix, reset counter
    5. If pass: increment counter
    6. Certified after 3 consecutive passes
    """

    MAX_ATTEMPTS = 10
    REQUIRED_SUCCESSES = 3

    def __init__(self):
        self._docker_available = self._check_docker()
        self._mock_client = None

    def _check_docker(self) -> bool:
        """Check if Docker SDK is available."""
        try:
            import docker
            self.docker_client = docker.from_env()
            self.docker_client.ping()
            return True
        except Exception:
            return False

    async def certify_tool(
        self,
        tool: ExtractedTool,
        coder_agent: Any = None,
    ) -> CertificationResult:
        """
        Run 3-strike certification for a single tool.
        
        Args:
            tool: The tool to certify
            coder_agent: Coder agent for auto-fixing (optional)
            
        Returns:
            CertificationResult with certification status
        """
        result = CertificationResult(final_code=tool.generated_code or "")
        
        while result.attempts < self.MAX_ATTEMPTS:
            result.attempts += 1
            
            # Run test
            test_result = await self._test_tool(tool)
            result.test_results.append(test_result)
            
            if test_result.passed:
                result.consecutive_successes += 1
                
                if result.consecutive_successes >= self.REQUIRED_SUCCESSES:
                    result.certified = True
                    tool.certified = True
                    tool.certification_attempts = result.attempts
                    return result
            else:
                # Reset counter on failure
                result.consecutive_successes = 0
                result.error_history.append(test_result.error_message or "Unknown error")
                
                # Auto-fix if coder agent provided
                if coder_agent and test_result.error_message:
                    fixed_code = await self._auto_fix(
                        tool,
                        test_result.error_message,
                        test_result.stderr,
                        coder_agent,
                    )
                    if fixed_code:
                        tool.generated_code = fixed_code
                        result.final_code = fixed_code
        
        return result

    async def _test_tool(self, tool: ExtractedTool) -> TestResult:
        """Test a single tool in the sandbox."""
        
        # First check syntax
        if tool.generated_code:
            try:
                compile(tool.generated_code, "tool.py", "exec")
            except SyntaxError as e:
                return TestResult(
                    tool_name=tool.name,
                    passed=False,
                    error_message=f"Syntax error at line {e.lineno}: {e.msg}",
                )
        
        # Test imports
        import_result = await self._test_imports(tool)
        if not import_result.passed:
            return import_result
        
        # Run Docker test if available
        if self._docker_available:
            return await self._test_in_docker(tool)
        
        # Fallback to local test
        return await self._test_local(tool)

    async def _test_imports(self, tool: ExtractedTool) -> TestResult:
        """Test that required imports are available."""
        required_imports = ["fastmcp", "httpx", "pydantic"]
        missing = []
        
        for module in required_imports:
            try:
                __import__(module)
            except ImportError:
                missing.append(module)
        
        if missing:
            return TestResult(
                tool_name=tool.name,
                passed=False,
                error_message=f"Missing imports: {', '.join(missing)}",
            )
        
        return TestResult(tool_name=tool.name, passed=True, stdout="Imports OK")

    async def _test_in_docker(self, tool: ExtractedTool) -> TestResult:
        """Test tool execution in Docker container."""
        import docker
        
        with tempfile.TemporaryDirectory() as tmpdir:
            tmppath = Path(tmpdir)
            
            # Write tool code
            tool_file = tmppath / "tool.py"
            tool_file.write_text(tool.generated_code or "")
            
            # Write test script
            test_script = tmppath / "test_tool.py"
            test_content = f'''
import sys
import asyncio
sys.path.insert(0, "/app")

async def test():
    try:
        # Import the tool
        exec(open("/app/tool.py").read())
        print("Tool loaded successfully")
        return True
    except Exception as e:
        print(f"Error: {{e}}")
        return False

if asyncio.run(test()):
    sys.exit(0)
else:
    sys.exit(1)
'''
            test_script.write_text(test_content)
            
            try:
                container = self.docker_client.containers.run(
                    image=settings.docker_image,
                    command=[
                        "bash", "-c",
                        "pip install -q fastmcp httpx pydantic && python /app/test_tool.py"
                    ],
                    volumes={str(tmppath): {"bind": "/app", "mode": "ro"}},
                    mem_limit=settings.docker_memory_limit,
                    cpu_period=100000,
                    cpu_quota=int(settings.docker_cpu_limit * 100000),
                    network_disabled=True,
                    remove=True,
                    detach=False,
                    stdout=True,
                    stderr=True,
                )
                
                output = container.decode("utf-8") if isinstance(container, bytes) else str(container)
                
                return TestResult(
                    tool_name=tool.name,
                    passed=True,
                    stdout=output,
                )
                
            except docker.errors.ContainerError as e:
                return TestResult(
                    tool_name=tool.name,
                    passed=False,
                    stderr=e.stderr.decode("utf-8") if e.stderr else "",
                    error_message=str(e),
                )
            except Exception as e:
                return TestResult(
                    tool_name=tool.name,
                    passed=False,
                    error_message=str(e),
                )

    async def _test_local(self, tool: ExtractedTool) -> TestResult:
        """Fallback: Test tool locally using subprocess."""
        with tempfile.TemporaryDirectory() as tmpdir:
            tmppath = Path(tmpdir)
            
            tool_file = tmppath / "tool.py"
            tool_file.write_text(tool.generated_code or "")
            
            test_code = f'''
import sys
sys.path.insert(0, "{tmppath}")
try:
    exec(open("{tool_file}").read())
    print("Tool loaded successfully")
except Exception as e:
    print(f"Error: {{e}}")
    sys.exit(1)
'''
            
            try:
                proc = await asyncio.create_subprocess_exec(
                    "python", "-c", test_code,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                )
                
                stdout, stderr = await asyncio.wait_for(
                    proc.communicate(),
                    timeout=10.0,
                )
                
                if proc.returncode == 0:
                    return TestResult(
                        tool_name=tool.name,
                        passed=True,
                        stdout=stdout.decode(),
                    )
                else:
                    return TestResult(
                        tool_name=tool.name,
                        passed=False,
                        stdout=stdout.decode(),
                        stderr=stderr.decode(),
                        error_message="Tool failed to load",
                    )
                    
            except asyncio.TimeoutError:
                return TestResult(
                    tool_name=tool.name,
                    passed=False,
                    error_message="Timeout",
                )
            except Exception as e:
                return TestResult(
                    tool_name=tool.name,
                    passed=False,
                    error_message=str(e),
                )

    async def _auto_fix(
        self,
        tool: ExtractedTool,
        error_message: str,
        stderr: str,
        coder_agent: Any,
    ) -> str | None:
        """
        Attempt to auto-fix a tool based on error traceback.
        
        Returns:
            Fixed code if successful, None otherwise
        """
        if not coder_agent:
            return None
        
        try:
            # Ask LLM to fix the code
            from helpermcp.core import settings
            import httpx
            
            prompt = f"""Fix this Python code that failed with an error:

ORIGINAL CODE:
```python
{tool.generated_code}
```

ERROR MESSAGE:
{error_message}

STDERR:
{stderr}

Return ONLY the fixed Python code, no explanations.
"""

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{settings.llm_base_url}/chat/completions",
                    json={
                        "model": settings.llm_model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.1,
                    },
                    headers={"Authorization": f"Bearer {settings.llm_api_key or 'not-needed'}"},
                )
                response.raise_for_status()
                
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                
                # Extract code from response
                import re
                code_match = re.search(r"```python\n(.*?)```", content, re.DOTALL)
                if code_match:
                    return code_match.group(1)
                return content
                
        except Exception:
            return None

    async def verify_server(self, server: GeneratedMCPServer) -> list[TestResult]:
        """Legacy method for backward compatibility."""
        results: list[TestResult] = []
        
        # Syntax check
        try:
            compile(server.server_code, "server.py", "exec")
            results.append(TestResult(tool_name="syntax_check", passed=True))
        except SyntaxError as e:
            results.append(TestResult(
                tool_name="syntax_check",
                passed=False,
                error_message=f"Syntax error at line {e.lineno}: {e.msg}",
            ))
            return results
        
        # Import check
        import_result = TestResult(tool_name="import_check", passed=True)
        for module in ["fastmcp", "httpx"]:
            try:
                __import__(module)
            except ImportError:
                import_result.passed = False
                import_result.error_message = f"Missing: {module}"
        results.append(import_result)
        
        return results

    def close(self):
        """Close Docker client."""
        if self._docker_available:
            self.docker_client.close()

"""Scout Agent - Discovery and Documentation Scraping."""

import asyncio
import re
from typing import Any

import httpx
from pydantic import BaseModel

from helpermcp.core import AuthType, DiscoveryResult, settings


class SearchResult(BaseModel):
    """A single search result."""

    title: str
    url: str
    snippet: str


class ScoutAgent:
    """
    The Scout Agent is responsible for discovering SDKs, APIs, and documentation.
    
    It uses multiple strategies:
    1. Web search to find official SDK and documentation
    2. Crawl4AI for clean markdown extraction
    3. Firecrawl for complex JS-heavy sites (optional)
    4. Python inspect/ast for local libraries
    """

    def __init__(self):
        self.http_client = httpx.AsyncClient(timeout=30.0)
        self._crawl4ai_available = self._check_crawl4ai()

    def _check_crawl4ai(self) -> bool:
        """Check if Crawl4AI is available."""
        try:
            import crawl4ai  # noqa: F401
            return True
        except ImportError:
            return False

    async def discover(self, target: str) -> DiscoveryResult:
        """
        Main discovery method - AUTONOMOUS AI + OBSERVER architecture.
        
        Uses dual-stage discovery:
        1. AI Theorist: LLM predicts SDK, auth, and endpoints
        2. Observer: NetworkSpy captures live traffic (if available)
        
        Args:
            target: Service name (e.g., "Stripe", "GitHub", "Slack")
            
        Returns:
            DiscoveryResult with SDK info, docs URLs, and scraped content
        """
        result = DiscoveryResult(target_name=target)
        
        # Stage 1: AI Theorist Research (LLM-based prediction)
        theory = await self._ai_theoretic_research(target)
        result = self._apply_theory_to_result(theory, result)
        
        # Stage 2: Scrape documentation if URL predicted
        if result.docs_url:
            result.markdown_docs = await self._scrape_documentation(result.docs_url)
        
        # Stage 3: Try Observer (NetworkSpy) if we have a docs URL
        observed_endpoints = []
        if result.docs_url:
            try:
                observed = await self._observe_with_networkspy(result.docs_url)
                observed_endpoints = observed.get("endpoints", [])
            except Exception:
                pass  # Observer is optional enhancement
        
        # Stage 4: Synthesize Theory + Reality
        result = self._synthesize_discovery(result, theory, observed_endpoints)
        
        # Stage 5: Detect authentication type
        result = self._detect_auth_type(target, result)
        
        return result

    async def smart_discover(self, target: str) -> DiscoveryResult:
        """
        Unified discovery that auto-detects target type.
        
        AUTONOMOUS ARCHITECTURE - No external APIs needed:
        - URLs → NetworkSpy direct observation
        - Local paths → AST repository analysis  
        - Service names → AI Theorist + Observer
        
        Args:
            target: URL, local path, or package name
            
        Returns:
            DiscoveryResult from the appropriate source
        """
        from pathlib import Path
        
        # Detect target type and route accordingly
        if target.startswith("http://") or target.startswith("https://"):
            # URL: Use NetworkSpy for direct observation
            try:
                from helpermcp.agents.network_spy import NetworkSpy
                
                spy = NetworkSpy()
                result = await spy.discover_and_create_tools(target)
                await spy.close()
                return result
            except Exception as e:
                # Fallback to basic scraping + AI research
                result = DiscoveryResult(target_name=target, docs_url=target)
                result.markdown_docs = await self._scrape_documentation(target)
                return result
        
        elif Path(target).exists():
            # Local path: Use AST repository analysis
            return await self.analyze_repository(target)
        
        else:
            # Service name: Use AI Theorist + Observer
            return await self.discover(target)

    async def _ai_theoretic_research(self, target: str) -> dict[str, Any]:
        """
        AI Theorist: Use LLM to predict SDK, endpoints, and auth patterns.
        
        This is the "brain" of autonomous discovery - it uses the LLM's
        training knowledge to generate a theoretical blueprint of the service.
        
        Returns:
            Theoretical blueprint with SDK, auth, endpoints predictions
        """
        prompt = f"""You are a Research Lead analyzing the "{target}" API/service.
Generate a technical blueprint in this exact JSON format:

{{
    "sdk_name": "<most likely Python SDK on PyPI>",
    "sdk_install": "<pip install command>",
    "docs_url": "<official documentation URL>",
    "api_base_url": "<base URL for API calls>",
    "auth_type": "<one of: api_key, bearer, oauth2, basic, none>",
    "auth_header": "<header name like Authorization or X-API-Key>",
    "endpoints": [
        {{"method": "GET", "path": "/endpoint", "description": "What it does"}},
        {{"method": "POST", "path": "/endpoint", "description": "What it does"}}
    ],
    "common_use_cases": ["use case 1", "use case 2", "use case 3"]
}}

Be precise. Use real SDK names from PyPI. Include at least 5-8 common endpoints.
Only output valid JSON, no markdown or explanations."""

        try:
            response = await self.http_client.post(
                f"{settings.llm_base_url}/chat/completions",
                json={
                    "model": settings.llm_model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                },
                headers={"Authorization": f"Bearer {settings.llm_api_key or 'not-needed'}"},
                timeout=60.0,
            )
            response.raise_for_status()
            data = response.json()
            
            content = data["choices"][0]["message"]["content"]
            
            # Extract JSON from response
            import json
            # Find JSON in response (handle markdown code blocks)
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            
            return json.loads(content.strip())
        except Exception as e:
            # Return minimal theory on failure
            return {
                "sdk_name": target.lower().replace(" ", "-"),
                "sdk_install": f"pip install {target.lower().replace(' ', '-')}",
                "docs_url": f"https://{target.lower().replace(' ', '')}.readthedocs.io/en/latest/",
                "auth_type": "api_key",
                "endpoints": [],
                "error": str(e),
            }

    def _apply_theory_to_result(self, theory: dict[str, Any], result: DiscoveryResult) -> DiscoveryResult:
        """Apply AI Theorist predictions to DiscoveryResult."""
        result.sdk_name = theory.get("sdk_name", result.sdk_name)
        result.sdk_install_command = theory.get("sdk_install", result.sdk_install_command)
        result.docs_url = theory.get("docs_url", result.docs_url)
        result.api_reference_url = theory.get("api_base_url", result.api_reference_url)
        
        # Store raw theory for synthesis
        result.raw_endpoints = theory.get("endpoints", [])
        
        return result

    async def _observe_with_networkspy(self, url: str) -> dict[str, Any]:
        """
        Observer: Use NetworkSpy to capture live API traffic.
        
        Navigates to the URL and monitors XHR/Fetch requests,
        generating an internal HAR-like structure without user input.
        """
        try:
            from helpermcp.agents.network_spy import NetworkSpy
            
            spy = NetworkSpy()
            
            # Auto-observe the documentation page
            traffic = await spy.capture_traffic(url, timeout=15000)
            
            await spy.close()
            
            return {
                "endpoints": traffic.get("captured_requests", []),
                "status": "observed",
            }
        except Exception as e:
            return {"endpoints": [], "status": "failed", "error": str(e)}

    def _synthesize_discovery(
        self,
        result: DiscoveryResult,
        theory: dict[str, Any],
        observed_endpoints: list,
    ) -> DiscoveryResult:
        """
        Synthesize Theory (AI predictions) + Reality (observed traffic).
        
        Observed endpoints get a +1.5 determinism bonus.
        """
        # Merge endpoints, prioritizing observed ones
        all_endpoints = []
        
        # Add observed endpoints with high confidence
        for ep in observed_endpoints:
            ep["observed"] = True
            ep["determinism_bonus"] = 1.5
            all_endpoints.append(ep)
        
        # Add theoretical endpoints (lower priority)
        for ep in theory.get("endpoints", []):
            ep["observed"] = False
            ep["determinism_bonus"] = 0.0
            all_endpoints.append(ep)
        
        # Store synthesized endpoints
        result.raw_endpoints = all_endpoints
        
        return result

    async def _search_for_sdk(self, target: str) -> list[SearchResult]:
        """
        DEPRECATED: Search methods removed in favor of AI Theorist research.
        This method now returns empty results - AI Theorist handles discovery.
        """
        return []

    async def _perform_search(self, query: str) -> list[SearchResult]:
        """DEPRECATED: No external search needed - AI Theorist handles discovery."""
        return []

    async def _tavily_search(self, query: str) -> list[SearchResult]:
        """DEPRECATED: Replaced by AI Theorist research."""
        return []

    async def _google_search(self, query: str) -> list[SearchResult]:
        """DEPRECATED: Replaced by AI Theorist research."""
        return []

    async def _duckduckgo_search(self, query: str) -> list[SearchResult]:
        """DEPRECATED: Replaced by AI Theorist research."""
        return []

    def _smart_guess_docs_url(self, target: str) -> str | None:
        """
        Generate a smart guess for documentation URL based on common patterns.
        
        This is a fallback when search fails to find docs.
        """
        target_lower = target.lower().replace(" ", "-").replace("_", "-")
        
        # Common documentation URL patterns
        patterns = [
            f"https://{target_lower}.readthedocs.io/en/latest/",
            f"https://docs.{target_lower}.com/",
            f"https://{target_lower}.github.io/",
            f"https://pypi.org/project/{target_lower}/",
            f"https://github.com/{target_lower}/{target_lower}",
            f"https://developer.{target_lower}.com/docs",
            f"https://api.{target_lower}.com/docs",
        ]
        
        return patterns[0]  # Return the most common pattern as initial guess

    async def _extract_urls_from_search(
        self,
        target: str,
        search_results: list[SearchResult],
        result: DiscoveryResult,
    ) -> DiscoveryResult:
        """
        Extract relevant URLs from search results using AI-enhanced ranking.
        
        URLs are scored based on:
        1. Presence of keywords (docs, api, reference)
        2. Target name in URL/title
        3. Domain authority (readthedocs, github, official sites)
        """
        target_lower = target.lower()
        
        # Score-based URL ranking
        scored_docs_urls = []
        scored_api_urls = []
        
        for sr in search_results:
            url_lower = sr.url.lower()
            title_lower = sr.title.lower()
            snippet_lower = sr.snippet.lower() if sr.snippet else ""
            
            # Skip empty URLs (like AI summary)
            if not sr.url:
                continue
            
            # Calculate documentation score
            doc_score = 0
            if any(kw in url_lower for kw in ["docs.", "/docs", "documentation"]):
                doc_score += 3
            if "developer." in url_lower or "api." in url_lower:
                doc_score += 2
            if target_lower in url_lower:
                doc_score += 3
            if target_lower in title_lower:
                doc_score += 2
            if any(kw in url_lower for kw in ["readthedocs", "github.io"]):
                doc_score += 1
            if "reference" in snippet_lower or "documentation" in snippet_lower:
                doc_score += 1
            
            if doc_score > 0:
                scored_docs_urls.append((doc_score, sr.url))
            
            # Calculate API reference score
            api_score = 0
            if any(kw in url_lower for kw in ["api-reference", "/api/", "reference"]):
                api_score += 3
            if target_lower in url_lower:
                api_score += 2
            if "endpoint" in snippet_lower or "method" in snippet_lower:
                api_score += 1
            
            if api_score > 0:
                scored_api_urls.append((api_score, sr.url))
            
            # Look for quickstart
            if not result.quickstart_url:
                if any(kw in url_lower for kw in ["quickstart", "getting-started", "quick-start"]):
                    if target_lower in url_lower or target_lower in title_lower:
                        result.quickstart_url = sr.url
            
            # Look for SDK on PyPI
            if not result.sdk_name:
                if "pypi.org" in url_lower:
                    match = re.search(r"pypi\.org/project/([^/]+)", sr.url)
                    if match:
                        result.sdk_name = match.group(1)
                        result.sdk_install_command = f"pip install {result.sdk_name}"
        
        # Select best docs URL
        if scored_docs_urls and not result.docs_url:
            scored_docs_urls.sort(reverse=True, key=lambda x: x[0])
            result.docs_url = scored_docs_urls[0][1]
        
        # Select best API reference URL
        if scored_api_urls and not result.api_reference_url:
            scored_api_urls.sort(reverse=True, key=lambda x: x[0])
            result.api_reference_url = scored_api_urls[0][1]
        
        # SMART FALLBACK: If docs_url is still None, use smart guess
        if not result.docs_url:
            result.docs_url = self._smart_guess_docs_url(target)
        
        # If no SDK found, try common patterns
        if not result.sdk_name:
            result.sdk_name = self._guess_sdk_name(target)
            result.sdk_install_command = f"pip install {result.sdk_name}"
        
        return result

    def _guess_sdk_name(self, target: str) -> str:
        """Guess the SDK name based on common patterns."""
        target_lower = target.lower().replace(" ", "-")
        
        # Common SDK naming patterns
        patterns = [
            target_lower,  # stripe, github, etc.
            f"{target_lower}-python",  # some-service-python
            f"py{target_lower}",  # pysome-service
        ]
        
        return patterns[0]  # Default to simple lowercase

    async def _scrape_documentation(self, url: str) -> str:
        """
        Scrape documentation and convert to clean markdown.
        
        Uses Crawl4AI if available, otherwise falls back to basic scraping.
        """
        if self._crawl4ai_available:
            return await self._scrape_with_crawl4ai(url)
        
        return await self._basic_scrape(url)

    async def _scrape_with_crawl4ai(self, url: str) -> str:
        """Use Crawl4AI for high-quality markdown extraction."""
        try:
            from crawl4ai import AsyncWebCrawler
            
            async with AsyncWebCrawler() as crawler:
                result = await crawler.arun(url=url)
                return result.markdown if result.markdown else ""
        except Exception as e:
            # Fallback to basic scraping on error
            return await self._basic_scrape(url)

    async def _basic_scrape(self, url: str) -> str:
        """Basic HTML to text extraction fallback."""
        try:
            response = await self.http_client.get(url)
            response.raise_for_status()
            
            # Very basic HTML stripping
            text = response.text
            text = re.sub(r"<script[^>]*>.*?</script>", "", text, flags=re.DOTALL)
            text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL)
            text = re.sub(r"<[^>]+>", " ", text)
            text = re.sub(r"\s+", " ", text)
            
            return text[:50000]  # Limit to ~50k chars
        except Exception:
            return ""

    def _detect_auth_type(self, target: str, result: DiscoveryResult) -> DiscoveryResult:
        """Detect authentication type from documentation content."""
        docs_lower = result.markdown_docs.lower()
        
        # Check for OAuth2
        if any(kw in docs_lower for kw in ["oauth2", "oauth 2", "authorization_code", "access_token"]):
            result.auth_type = AuthType.OAUTH2
        # Check for API key
        elif any(kw in docs_lower for kw in ["api_key", "api-key", "apikey", "x-api-key"]):
            result.auth_type = AuthType.API_KEY
        # Check for Bearer token
        elif "bearer" in docs_lower:
            result.auth_type = AuthType.BEARER
        else:
            result.auth_type = AuthType.API_KEY  # Default assumption
        
        # Set common header and env var names
        target_upper = target.upper().replace(" ", "_")
        result.auth_env_var = f"{target_upper}_API_KEY"
        
        if result.auth_type == AuthType.BEARER:
            result.auth_header_name = "Authorization"
        else:
            result.auth_header_name = "X-Api-Key"
        
        return result

    async def inspect_local_library(self, package_name: str) -> dict[str, Any]:
        """
        Inspect a locally installed Python library using inspect and ast modules.
        
        Returns information about available functions and classes.
        """
        import ast
        import importlib
        import inspect
        
        try:
            module = importlib.import_module(package_name)
        except ImportError:
            return {"error": f"Package {package_name} not installed"}
        
        result = {
            "module_name": package_name,
            "functions": [],
            "classes": [],
        }
        
        for name, obj in inspect.getmembers(module):
            if name.startswith("_"):
                continue
            
            if inspect.isfunction(obj):
                sig = inspect.signature(obj)
                doc = inspect.getdoc(obj) or ""
                result["functions"].append({
                    "name": name,
                    "signature": str(sig),
                    "docstring": doc[:500],  # Truncate
                })
            
            elif inspect.isclass(obj):
                methods = []
                for method_name, method in inspect.getmembers(obj, inspect.isfunction):
                    if not method_name.startswith("_"):
                        sig = inspect.signature(method)
                        methods.append({
                            "name": method_name,
                            "signature": str(sig),
                        })
                
                result["classes"].append({
                    "name": name,
                    "docstring": (inspect.getdoc(obj) or "")[:500],
                    "methods": methods[:20],  # Limit methods
                })
        
        return result

    async def analyze_repository(self, repo_path: str) -> DiscoveryResult:
        """
        Analyze a local repository using recursive AST analysis.
        
        The Folder Scout recursively scans Python files to extract:
        - Functions with their signatures and docstrings
        - Classes with their methods
        - Dependencies from requirements.txt/pyproject.toml
        
        Args:
            repo_path: Path to the local repository
            
        Returns:
            DiscoveryResult with extracted tool candidates
        """
        from pathlib import Path
        import ast
        
        repo = Path(repo_path).resolve()
        if not repo.exists():
            return DiscoveryResult(
                target_name=repo.name,
                markdown_docs=f"Repository not found: {repo_path}",
            )
        
        result = DiscoveryResult(
            target_name=repo.name,
            docs_url=f"file://{repo}",
        )
        
        # Collect all Python files
        py_files = list(repo.rglob("*.py"))
        
        # Parse requirements
        deps = await self._parse_repository_dependencies(repo)
        result.sdk_name = deps.get("name", repo.name)
        result.sdk_install_command = deps.get("install_cmd", "")
        
        # Analyze all Python files with AST
        all_functions: list[dict] = []
        all_classes: list[dict] = []
        
        for py_file in py_files:
            try:
                funcs, classes = self._analyze_python_file(py_file)
                for f in funcs:
                    f["file"] = str(py_file.relative_to(repo))
                for c in classes:
                    c["file"] = str(py_file.relative_to(repo))
                all_functions.extend(funcs)
                all_classes.extend(classes)
            except Exception:
                continue
        
        # Generate markdown documentation
        markdown = self._generate_repo_markdown(
            repo.name,
            all_functions,
            all_classes,
            deps,
        )
        result.markdown_docs = markdown
        
        # Store raw endpoints for the Architect
        result.raw_endpoints = [
            {
                "name": f["name"],
                "path": f["file"],
                "method": "FUNCTION",
                "description": f.get("docstring", "")[:200],
                "signature": f.get("signature", ""),
            }
            for f in all_functions
            if not f["name"].startswith("_")
        ]
        
        return result

    def _analyze_python_file(self, file_path) -> tuple[list[dict], list[dict]]:
        """Analyze a Python file using AST."""
        import ast
        
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            source = f.read()
        
        tree = ast.parse(source)
        
        functions = []
        classes = []
        
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef) or isinstance(node, ast.AsyncFunctionDef):
                func_info = self._extract_function_info(node)
                functions.append(func_info)
            
            elif isinstance(node, ast.ClassDef):
                class_info = self._extract_class_info(node)
                classes.append(class_info)
        
        return functions, classes

    def _extract_function_info(self, node) -> dict:
        """Extract function information from AST node."""
        import ast
        
        # Get docstring
        docstring = ast.get_docstring(node) or ""
        
        # Build signature
        args = []
        for arg in node.args.args:
            arg_name = arg.arg
            arg_type = ""
            if arg.annotation:
                arg_type = ast.unparse(arg.annotation) if hasattr(ast, 'unparse') else ""
            args.append(f"{arg_name}: {arg_type}" if arg_type else arg_name)
        
        signature = f"({', '.join(args)})"
        
        # Return type
        return_type = ""
        if node.returns:
            return_type = ast.unparse(node.returns) if hasattr(ast, 'unparse') else ""
        
        return {
            "name": node.name,
            "signature": signature,
            "return_type": return_type,
            "docstring": docstring[:500],
            "is_async": isinstance(node, ast.AsyncFunctionDef),
            "line_number": node.lineno,
        }

    def _extract_class_info(self, node) -> dict:
        """Extract class information from AST node."""
        import ast
        
        docstring = ast.get_docstring(node) or ""
        
        methods = []
        for item in node.body:
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if not item.name.startswith("_") or item.name in ("__init__", "__call__"):
                    methods.append(self._extract_function_info(item))
        
        return {
            "name": node.name,
            "docstring": docstring[:500],
            "methods": methods[:20],
            "line_number": node.lineno,
        }

    async def _parse_repository_dependencies(self, repo_path) -> dict[str, Any]:
        """Parse dependencies from requirements.txt or pyproject.toml."""
        from pathlib import Path
        import tomllib
        
        deps = {
            "name": repo_path.name,
            "dependencies": [],
            "install_cmd": "",
        }
        
        # Try pyproject.toml first
        pyproject = repo_path / "pyproject.toml"
        if pyproject.exists():
            try:
                with open(pyproject, "rb") as f:
                    data = tomllib.load(f)
                
                project = data.get("project", {})
                deps["name"] = project.get("name", repo_path.name)
                deps["dependencies"] = project.get("dependencies", [])
                deps["install_cmd"] = f"pip install -e {repo_path}"
            except Exception:
                pass
        
        # Fallback to requirements.txt
        requirements = repo_path / "requirements.txt"
        if requirements.exists() and not deps["dependencies"]:
            try:
                with open(requirements, "r") as f:
                    deps["dependencies"] = [
                        line.strip() for line in f
                        if line.strip() and not line.startswith("#")
                    ]
                deps["install_cmd"] = f"pip install -r {requirements}"
            except Exception:
                pass
        
        # Check for setup.py
        if not deps["install_cmd"]:
            setup_py = repo_path / "setup.py"
            if setup_py.exists():
                deps["install_cmd"] = f"pip install -e {repo_path}"
        
        return deps

    def _generate_repo_markdown(
        self,
        name: str,
        functions: list[dict],
        classes: list[dict],
        deps: dict,
    ) -> str:
        """Generate markdown documentation from analyzed repository."""
        lines = [
            f"# {name} Repository Analysis",
            "",
            f"**Dependencies**: {len(deps.get('dependencies', []))}",
            f"**Functions**: {len(functions)}",
            f"**Classes**: {len(classes)}",
            "",
        ]
        
        if deps.get("dependencies"):
            lines.append("## Dependencies")
            for dep in deps["dependencies"][:20]:
                lines.append(f"- {dep}")
            lines.append("")
        
        # Public functions (excluding private)
        public_funcs = [f for f in functions if not f["name"].startswith("_")]
        if public_funcs:
            lines.append("## Functions")
            lines.append("")
            for func in public_funcs[:30]:
                async_prefix = "async " if func.get("is_async") else ""
                lines.append(f"### {async_prefix}{func['name']}{func['signature']}")
                if func.get("return_type"):
                    lines.append(f"Returns: `{func['return_type']}`")
                if func.get("docstring"):
                    lines.append(f"\n{func['docstring'][:200]}")
                if func.get("file"):
                    lines.append(f"\n*File: {func['file']}:{func.get('line_number', '')}*")
                lines.append("")
        
        # Classes
        if classes:
            lines.append("## Classes")
            lines.append("")
            for cls in classes[:20]:
                lines.append(f"### {cls['name']}")
                if cls.get("docstring"):
                    lines.append(cls["docstring"][:200])
                if cls.get("methods"):
                    lines.append("**Methods:**")
                    for method in cls["methods"][:10]:
                        lines.append(f"- `{method['name']}{method['signature']}`")
                lines.append("")
        
        return "\n".join(lines)

    async def close(self):
        """Close the HTTP client."""
        await self.http_client.aclose()


"""Network Spy - Playwright-based dynamic web discovery."""

import asyncio
import json
import re
from dataclasses import dataclass, field
from typing import Any
from urllib.parse import urlparse

from pydantic import BaseModel, Field

from helpermcp.core import DiscoveryResult, settings


@dataclass
class DiscoveredEndpoint:
    """An API endpoint discovered from network traffic."""
    
    url: str
    method: str = "GET"
    content_type: str = "application/json"
    request_body: dict | None = None
    response_sample: str = ""
    status_code: int = 200


class NetworkSpy:
    """
    Playwright-based agent for dynamic web intelligence.
    
    Features:
    - Monitor XHR/Fetch requests during navigation
    - Discover undocumented API endpoints
    - Generate scraper tools for non-API sites
    """

    def __init__(self):
        self._browser = None
        self._playwright = None
        self._discovered: list[DiscoveredEndpoint] = []

    async def _ensure_browser(self):
        """Ensure Playwright browser is initialized."""
        if self._browser is None:
            try:
                from playwright.async_api import async_playwright
                
                self._playwright = await async_playwright().start()
                self._browser = await self._playwright.chromium.launch(headless=True)
            except ImportError:
                raise RuntimeError("Playwright not installed. Run: pip install playwright && playwright install")

    async def monitor_site(
        self,
        url: str,
        navigation_steps: list[dict] | None = None,
        wait_time: int = 5,
    ) -> list[DiscoveredEndpoint]:
        """
        Monitor XHR/Fetch traffic while navigating a site.
        
        Args:
            url: Starting URL
            navigation_steps: Optional list of actions (click, input, etc.)
            wait_time: Seconds to wait for network activity
            
        Returns:
            List of discovered endpoints
        """
        await self._ensure_browser()
        
        self._discovered = []
        
        page = await self._browser.new_page()
        
        # Set up request interception
        await page.route("**/*", self._intercept_request)
        
        # Listen for responses
        page.on("response", lambda response: asyncio.create_task(self._capture_response(response)))
        
        try:
            # Navigate to the site with optimized wait strategy
            # Use domcontentloaded instead of networkidle to avoid timeout on heavy sites
            await page.goto(url, wait_until="domcontentloaded", timeout=60000)
            
            # Execute navigation steps if provided
            if navigation_steps:
                for step in navigation_steps:
                    await self._execute_step(page, step)
            
            # Wait for additional network activity
            await asyncio.sleep(wait_time)
            
        except Exception as e:
            print(f"Navigation error: {e}")
        finally:
            await page.close()
        
        return self._discovered

    async def spider_and_observe(
        self,
        url: str,
        max_clicks: int = 5,
    ) -> dict[str, Any]:
        """
        Spider a documentation site and observe API traffic.
        
        Auto-clicks on API reference, Examples, and Try-it links
        to trigger XHR/Fetch traffic, then captures the endpoints.
        
        Args:
            url: Documentation URL to spider
            max_clicks: Maximum number of links to click
            
        Returns:
            Dictionary with observed endpoints and metadata
        """
        await self._ensure_browser()
        
        self._discovered = []
        clicked_links = []
        
        page = await self._browser.new_page()
        
        # Set up request interception
        await page.route("**/*", self._intercept_request)
        page.on("response", lambda response: asyncio.create_task(self._capture_response(response)))
        
        try:
            # Navigate to the documentation site (optimized for heavy sites)
            await page.goto(url, wait_until="domcontentloaded", timeout=60000)
            await asyncio.sleep(3)  # Give JS time to initialize
            
            # API reference link patterns to auto-click
            api_link_selectors = [
                'a:has-text("API")',
                'a:has-text("Reference")',
                'a:has-text("Endpoints")',
                'a:has-text("Documentation")',
                'a:has-text("Examples")',
                'a:has-text("Try it")',
                'a:has-text("Quickstart")',
                '[href*="/api"]',
                '[href*="/reference"]',
                '[href*="/docs"]',
            ]
            
            clicks = 0
            for selector in api_link_selectors:
                if clicks >= max_clicks:
                    break
                    
                try:
                    links = await page.query_selector_all(selector)
                    for link in links[:2]:  # Max 2 per selector
                        if clicks >= max_clicks:
                            break
                        
                        href = await link.get_attribute("href")
                        if href and href not in clicked_links:
                            await link.click()
                            await page.wait_for_load_state("networkidle", timeout=5000)
                            await asyncio.sleep(1)
                            clicked_links.append(href)
                            clicks += 1
                except Exception:
                    continue
            
        except Exception as e:
            print(f"Spider error: {e}")
        finally:
            await page.close()
        
        return {
            "url": url,
            "links_clicked": clicked_links,
            "endpoints": [
                {
                    "url": ep.url,
                    "method": ep.method,
                    "observed": True,
                    "determinism_bonus": 1.5,
                }
                for ep in self._discovered
            ],
            "captured_requests": self._discovered,
        }

    async def capture_traffic(
        self,
        url: str,
        timeout: int = 15000,
    ) -> dict[str, Any]:
        """
        Observe a page and capture all API traffic.
        
        This is the method called by ScoutAgent._observe_with_networkspy().
        
        Args:
            url: URL to observe
            timeout: Timeout in milliseconds
            
        Returns:
            Dictionary with captured requests
        """
        endpoints = await self.monitor_site(url, wait_time=timeout // 1000)
        
        return {
            "url": url,
            "captured_requests": [
                {
                    "url": ep.url,
                    "method": ep.method,
                    "status_code": ep.status_code,
                    "observed": True,
                    "determinism_bonus": 1.5,
                }
                for ep in endpoints
            ],
        }

    async def _intercept_request(self, route):
        """Intercept and log requests."""
        request = route.request
        
        # Skip non-API requests
        resource_type = request.resource_type
        if resource_type not in ("xhr", "fetch", "document"):
            await route.continue_()
            return
        
        # Log API-like requests
        url = request.url
        if self._is_api_request(url):
            endpoint = DiscoveredEndpoint(
                url=url,
                method=request.method,
            )
            
            # Capture request body for POST/PUT
            if request.method in ("POST", "PUT", "PATCH"):
                try:
                    body = request.post_data
                    if body:
                        endpoint.request_body = json.loads(body) if body.startswith("{") else {"raw": body}
                except Exception:
                    pass
            
            self._discovered.append(endpoint)
        
        await route.continue_()

    async def _capture_response(self, response):
        """Capture response data for discovered endpoints."""
        url = response.url
        
        # Find matching endpoint
        for endpoint in self._discovered:
            if endpoint.url == url:
                endpoint.status_code = response.status
                try:
                    content_type = response.headers.get("content-type", "")
                    endpoint.content_type = content_type
                    
                    if "json" in content_type:
                        body = await response.text()
                        endpoint.response_sample = body[:2000]
                except Exception:
                    pass
                break

    def _is_api_request(self, url: str) -> bool:
        """Check if URL looks like an API endpoint."""
        parsed = urlparse(url)
        path = parsed.path.lower()
        
        # Common API patterns
        api_patterns = [
            "/api/", "/v1/", "/v2/", "/v3/",
            "/graphql", "/rest/", "/data/",
            ".json", "/query", "/search",
        ]
        
        # Skip static assets
        static_patterns = [
            ".js", ".css", ".png", ".jpg", ".gif",
            ".svg", ".woff", ".ttf", ".ico",
        ]
        
        if any(p in path for p in static_patterns):
            return False
        
        return any(p in path for p in api_patterns)

    async def _execute_step(self, page, step: dict):
        """Execute a navigation step."""
        action = step.get("action", "click")
        selector = step.get("selector", "")
        value = step.get("value", "")
        
        try:
            if action == "click":
                await page.click(selector)
            elif action == "input":
                await page.fill(selector, value)
            elif action == "wait":
                await asyncio.sleep(int(value) if value else 1)
            elif action == "scroll":
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            
            # Wait for network after action
            await page.wait_for_load_state("networkidle", timeout=5000)
        except Exception:
            pass

    async def generate_scraper_tool(
        self,
        url: str,
        selectors: dict[str, str],
    ) -> str:
        """
        Generate a scraper tool for sites without APIs.
        
        Args:
            url: Target URL
            selectors: CSS selectors for data extraction
            
        Returns:
            Generated Python code for the scraper tool
        """
        code = f'''
@mcp.tool()
async def scrape_{self._url_to_name(url)}(
    url: str = Field("{url}", description="URL to scrape"),
) -> dict[str, Any]:
    """
    Scrape structured data from {urlparse(url).netloc}.
    
    Auto-generated scraper tool.
    """
    from playwright.async_api import async_playwright
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=60000)
            
            data = {{}}
'''
        
        for name, selector in selectors.items():
            code += f'''
            try:
                element = await page.query_selector("{selector}")
                if element:
                    data["{name}"] = await element.text_content()
            except Exception:
                data["{name}"] = None
'''
        
        code += '''
            return {"success": True, "data": data}
        except Exception as e:
            return {"success": False, "error": str(e)}
        finally:
            await browser.close()
'''
        
        return code

    def _url_to_name(self, url: str) -> str:
        """Convert URL to function name."""
        parsed = urlparse(url)
        name = parsed.netloc.replace(".", "_").replace("-", "_")
        return re.sub(r"[^a-z0-9_]", "", name.lower())

    async def discover_and_create_tools(self, url: str) -> DiscoveryResult:
        """
        Full discovery workflow: monitor site and create tool candidates.
        
        Args:
            url: Target website
            
        Returns:
            DiscoveryResult with discovered endpoints
        """
        parsed = urlparse(url)
        
        result = DiscoveryResult(
            target_name=parsed.netloc,
            docs_url=url,
        )
        
        # Monitor site for API calls
        endpoints = await self.monitor_site(url)
        
        if endpoints:
            # Generate markdown from discovered endpoints
            markdown = self._endpoints_to_markdown(endpoints)
            result.markdown_docs = markdown
            
            # Store as raw endpoints
            result.raw_endpoints = [
                {
                    "name": self._endpoint_to_name(ep),
                    "path": urlparse(ep.url).path,
                    "method": ep.method,
                    "description": f"{ep.method} request to {ep.url}",
                    "response_format": "json" if "json" in ep.content_type else "html",
                }
                for ep in endpoints
            ]
        else:
            result.markdown_docs = f"No API endpoints discovered at {url}. Consider using a Scraper Tool."
        
        return result

    def _endpoints_to_markdown(self, endpoints: list[DiscoveredEndpoint]) -> str:
        """Convert discovered endpoints to markdown documentation."""
        lines = [
            "# Discovered API Endpoints",
            "",
            f"**Total**: {len(endpoints)} endpoints discovered",
            "",
        ]
        
        for ep in endpoints[:20]:
            parsed = urlparse(ep.url)
            lines.append(f"## {ep.method} {parsed.path}")
            lines.append(f"**Host**: {parsed.netloc}")
            lines.append(f"**Status**: {ep.status_code}")
            lines.append(f"**Content-Type**: {ep.content_type}")
            
            if ep.request_body:
                lines.append(f"\n**Request Body**:\n```json\n{json.dumps(ep.request_body, indent=2)[:500]}\n```")
            
            if ep.response_sample:
                lines.append(f"\n**Response Sample**:\n```json\n{ep.response_sample[:500]}\n```")
            
            lines.append("")
        
        return "\n".join(lines)

    def _endpoint_to_name(self, ep: DiscoveredEndpoint) -> str:
        """Convert endpoint to function name."""
        parsed = urlparse(ep.url)
        path = parsed.path.strip("/").replace("/", "_").replace("-", "_")
        path = re.sub(r"[^a-z0-9_]", "", path.lower())
        
        method = ep.method.lower()
        if method == "get":
            prefix = "get"
        elif method == "post":
            prefix = "create"
        elif method == "put" or method == "patch":
            prefix = "update"
        elif method == "delete":
            prefix = "delete"
        else:
            prefix = method
        
        return f"{prefix}_{path}" if path else f"{prefix}_endpoint"

    async def close(self):
        """Close browser and playwright."""
        if self._browser:
            await self._browser.close()
        if self._playwright:
            await self._playwright.stop()

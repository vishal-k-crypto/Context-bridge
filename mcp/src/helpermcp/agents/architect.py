"""Architect Agent - Enhanced Tool Extraction and Three-Dimensional Scoring."""

import json
import re
from typing import Any

import httpx

from helpermcp.core import (
    DiscoveryResult,
    ExtractedTool,
    ParameterType,
    ToolParameter,
    ToolScore,
    settings,
)


class ArchitectAgent:
    """
    The Architect Agent is the "Rubbish Filter" with no-compromise scoring.
    
    Every potential tool is scored on three dimensions:
    1. LLM Utility (1-10): Can the LLM do this internally?
    2. Determinism (1-10): Is the output reliable and parsable?
    3. Token Efficiency (1-10): Data density vs noise ratio
    
    Threshold: Only tools with aggregate score > 7.5 are passed to the Coder.
    """

    # High-value action verbs (external data required)
    HIGH_VALUE_VERBS = {
        "send", "create", "post", "publish", "submit", "execute",
        "trigger", "start", "deploy", "generate", "run", "build",
        "fetch", "query", "subscribe", "purchase", "pay", "transfer",
    }
    
    # Medium-value action verbs (useful CRUD)
    MEDIUM_VALUE_VERBS = {
        "get", "list", "search", "find", "retrieve",
        "update", "edit", "modify", "delete", "remove",
    }
    
    # Low-value patterns (LLM can do these internally)
    LOW_VALUE_PATTERNS = [
        r"^format",
        r"^validate",
        r"^parse",
        r"^convert",
        r"^calculate",
        r"^compute",
        r"helper",
        r"util",
        r"internal",
        r"^_",
    ]

    def __init__(self):
        self.http_client = httpx.AsyncClient(timeout=60.0)

    async def analyze(
        self,
        discovery: DiscoveryResult,
        requirement_map=None,
    ) -> list[ExtractedTool]:
        """
        Analyze discovery results and extract tools with three-dimensional scoring.
        
        UNRESTRICTED MODE: All tools pass through - scoring preserved for metadata only.
        
        Args:
            discovery: Results from the Scout agent
            requirement_map: Optional RequirementMap for context-aware scoring
            
        Returns:
            List of ExtractedTool objects sorted by score (no filtering)
        """
        # Step 1: Extract raw tool candidates from docs
        raw_tools = await self._extract_tool_candidates(discovery)
        
        # Step 2: Score each tool on all three dimensions (metadata only)
        scored_tools = []
        for tool in raw_tools:
            scored_tool = await self._score_tool_full(tool, discovery, requirement_map)
            scored_tools.append(scored_tool)
        
        # Step 3: UNRESTRICTED - All tools pass (no score filtering)
        # Scoring preserved for sorting and metadata purposes
        all_tools = scored_tools
        
        # Step 4: Sort by aggregate score descending
        all_tools.sort(
            key=lambda t: t.detailed_score.aggregate if t.detailed_score else 0,
            reverse=True,
        )
        
        # Step 5: Return ALL tools (no slicing)
        return all_tools


    async def _score_tool_full(
        self,
        tool: ExtractedTool,
        discovery: DiscoveryResult,
        requirement_map=None,
    ) -> ExtractedTool:
        """
        Score a tool on all three dimensions.
        
        If RequirementMap is provided, applies +2.0 bonus for intent-aligned tools.
        """
        
        score = ToolScore()
        
        # Dimension 1: LLM Utility
        score.llm_utility, score.llm_utility_reason = self._score_llm_utility(tool)
        
        # Dimension 2: Determinism
        score.determinism, score.determinism_reason = self._score_determinism(tool)
        
        # Dimension 3: Token Efficiency
        score.token_efficiency, score.token_efficiency_reason = self._score_token_efficiency(tool)
        
        # Calculate aggregate with weights
        # LLM Utility: 40%, Determinism: 35%, Token Efficiency: 25%
        score.calculate_aggregate(weights=(0.40, 0.35, 0.25))
        
        # Apply context-aware bonus if RequirementMap is provided
        if requirement_map is not None:
            bonus = self._calculate_intent_bonus(tool, requirement_map)
            if bonus > 0:
                score.aggregate = min(10.0, score.aggregate + bonus)
                score.llm_utility_reason += f" [+{bonus:.1f} intent bonus]"
                # Recalculate passed status with bonus
                score.passed = score.aggregate >= 7.5
        
        # Update tool with detailed score
        tool.detailed_score = score
        tool.score = score.aggregate  # Keep legacy field in sync
        tool.score_reasoning = f"U:{score.llm_utility:.1f} D:{score.determinism:.1f} T:{score.token_efficiency:.1f}"
        
        return tool

    def _calculate_intent_bonus(self, tool: ExtractedTool, requirement_map) -> float:
        """
        Calculate bonus score for tools that align with user intent.
        
        Returns +2.0 for strong alignment, +1.0 for partial alignment.
        """
        bonus = 0.0
        tool_name_lower = tool.name.lower()
        tool_desc_lower = (tool.description or "").lower()
        
        # Check intent alignment
        for intent in requirement_map.intents:
            intent_keywords = intent.lower().split()
            matches = sum(1 for kw in intent_keywords if kw in tool_name_lower or kw in tool_desc_lower)
            if matches >= 2:
                bonus = 2.0  # Strong alignment
                break
            elif matches >= 1:
                bonus = max(bonus, 1.0)  # Partial alignment
        
        # Check category alignment
        category = requirement_map.category.lower()
        
        category_keywords = {
            "data": ["get", "list", "fetch", "read", "extract", "query"],
            "action": ["send", "create", "post", "push", "trigger", "execute"],
            "calculation": ["calculate", "compute", "count", "sum", "average"],
            "automation": ["automate", "schedule", "run", "batch"],
        }
        
        if category in category_keywords:
            for kw in category_keywords[category]:
                if kw in tool_name_lower:
                    bonus = max(bonus, 1.5)  # Category match
                    break
        
        # Check service priority
        for service in requirement_map.priority_services:
            if service.lower() in tool_name_lower or service.lower() in tool_desc_lower:
                bonus = max(bonus, 1.0)  # Service match
                break
        
        return min(2.0, bonus)  # Cap at +2.0


    def _score_llm_utility(self, tool: ExtractedTool) -> tuple[float, str]:
        """
        Score LLM Utility: Can the LLM do this internally?
        
        1-3: Math/string operations (LLM can do these)
        4-6: Complex logic but no external data
        7-10: External API calls, real-time data, actions
        """
        name_lower = tool.name.lower()
        desc_lower = tool.description.lower()
        
        # Check for low-value patterns (LLM can do internally)
        for pattern in self.LOW_VALUE_PATTERNS:
            if re.search(pattern, name_lower):
                return 2.0, "LLM can perform this internally"
        
        # Check for high-value verbs (requires external systems)
        for verb in self.HIGH_VALUE_VERBS:
            if name_lower.startswith(verb) or f" {verb} " in desc_lower:
                if tool.api_endpoint:
                    return 9.5, f"External API action: {verb}"
                return 8.5, f"High-value action: {verb}"
        
        # Check for medium-value verbs
        for verb in self.MEDIUM_VALUE_VERBS:
            if name_lower.startswith(verb):
                return 7.5, f"Useful CRUD operation: {verb}"
        
        # Check for API endpoint (indicates external data)
        if tool.api_endpoint:
            return 8.0, "External API endpoint"
        
        # Default for ambiguous cases
        return 5.0, "Standard utility"

    def _score_determinism(self, tool: ExtractedTool) -> tuple[float, str]:
        """
        Score Determinism: Is the output reliable and parsable?
        
        1-3: Raw HTML, unpredictable format
        4-6: Semi-structured (XML, varied JSON)
        7-10: Typed SDK responses, consistent JSON schema
        
        BONUS: +1.5 for observed endpoints (verified by NetworkSpy)
        """
        desc_lower = tool.description.lower()
        response_format = tool.response_format.lower()
        
        # Observation bonus: +1.5 for endpoints verified by NetworkSpy
        observation_bonus = 0.0
        if hasattr(tool, 'observed') and tool.observed:
            observation_bonus = 1.5
        elif hasattr(tool, 'source') and tool.source == 'observed':
            observation_bonus = 1.5
        elif hasattr(tool, 'determinism_bonus'):
            observation_bonus = tool.determinism_bonus
        
        # Check response format
        if response_format == "json":
            # Check for schema hints
            if tool.return_type and tool.return_type != "dict":
                return min(9.5 + observation_bonus, 10.0), "Typed JSON response with schema" + (" [OBSERVED]" if observation_bonus else "")
            return min(8.5 + observation_bonus, 10.0), "Consistent JSON response" + (" [OBSERVED]" if observation_bonus else "")
        
        elif response_format in ("xml", "soap"):
            return min(6.0 + observation_bonus, 10.0), "XML/SOAP response requires parsing"
        
        elif response_format in ("html", "text"):
            return min(3.0 + observation_bonus, 10.0), "Unstructured HTML/text response"
        
        # Check for indicators in description
        if any(kw in desc_lower for kw in ["json", "object", "dictionary"]):
            return min(8.0 + observation_bonus, 10.0), "JSON response indicated"
        
        if any(kw in desc_lower for kw in ["html", "page", "webpage"]):
            return min(3.0 + observation_bonus, 10.0), "HTML response indicated"
        
        # If it's a REST API with method, assume JSON
        if tool.http_method and tool.api_endpoint:
            return min(8.0 + observation_bonus, 10.0), "REST API (assumed JSON)"
        
        return min(6.0 + observation_bonus, 10.0), "Unknown response format"

    def _score_token_efficiency(self, tool: ExtractedTool) -> tuple[float, str]:
        """
        Score Token Efficiency: Data density vs noise ratio.
        
        1-3: 50KB+ responses, lots of noise
        4-6: 1-10KB, some filtering needed
        7-10: <1KB, pure structured data
        """
        # Parse estimated response size
        size_str = tool.estimated_response_size.lower()
        
        if "<1kb" in size_str or "bytes" in size_str:
            return 9.5, "Compact response (<1KB)"
        
        if "<5kb" in size_str or "small" in size_str:
            return 8.0, "Small response (<5KB)"
        
        if "<10kb" in size_str:
            return 7.0, "Moderate response (<10KB)"
        
        if "50kb" in size_str or "large" in size_str:
            return 3.0, "Large response (50KB+)"
        
        # Estimate from other factors
        if len(tool.parameters) <= 2:
            # Simple queries usually return focused data
            return 8.0, "Simple query, likely focused data"
        
        if tool.http_method == "GET" and "list" in tool.name.lower():
            # List endpoints often return many items
            return 5.0, "List endpoint may return many items"
        
        if tool.http_method in ("POST", "PUT", "DELETE"):
            # Write operations usually return minimal confirmation
            return 8.5, "Write operation, compact response"
        
        return 6.0, "Unknown response size"

    async def _extract_tool_candidates(
        self,
        discovery: DiscoveryResult,
    ) -> list[ExtractedTool]:
        """Extract tool candidates from documentation with intent extraction."""
        tools: list[ExtractedTool] = []
        
        # Strategy 1: Use LLM to extract with intent
        if discovery.markdown_docs:
            llm_tools = await self._llm_extract_tools_with_intent(discovery)
            tools.extend(llm_tools)
        
        # Strategy 2: Parse raw endpoints if available
        if discovery.raw_endpoints:
            endpoint_tools = self._parse_endpoints(discovery.raw_endpoints)
            tools.extend(endpoint_tools)
        
        # Deduplicate by name
        seen = set()
        unique_tools = []
        for tool in tools:
            if tool.name not in seen:
                seen.add(tool.name)
                unique_tools.append(tool)
        
        return unique_tools

    async def _llm_extract_tools_with_intent(
        self,
        discovery: DiscoveryResult,
    ) -> list[ExtractedTool]:
        """Use LLM to extract tools with intent from surrounding context."""
        docs = discovery.markdown_docs[:100000]  # EXPANDED: 100k chars for full API coverage
        
        prompt = f"""Analyze this API documentation and extract useful API endpoints/functions.

SERVICE: {discovery.target_name}

DOCUMENTATION:
{docs}

For each useful endpoint/function, extract:
1. name: snake_case function name
2. display_name: Human readable name
3. description: What it does
4. intent: The use case from surrounding text (e.g., "Alert team members of high-priority events")
5. parameters: List with name, type, description, required, examples
6. return_type: What it returns
7. api_endpoint: API path (if REST)
8. http_method: GET/POST/PUT/DELETE (if REST)
9. response_format: json/xml/html
10. estimated_response_size: <1KB, <5KB, <10KB, or 50KB+

Focus on ACTION endpoints that provide capabilities LLMs cannot do internally:
- Sending messages/notifications
- Creating/modifying resources
- Fetching real-time data
- Triggering workflows

SKIP utility functions like: format, validate, parse, calculate

Return a JSON array. Only include JSON, no other text.
"""

        try:
            response = await self.http_client.post(
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
            
            return self._parse_llm_response_with_intent(content, discovery)
            
        except Exception:
            # Fallback to regex extraction
            return self._regex_extract_tools(discovery.markdown_docs)

    def _parse_llm_response_with_intent(
        self,
        content: str,
        discovery: DiscoveryResult,
    ) -> list[ExtractedTool]:
        """Parse LLM response into ExtractedTool objects with intent."""
        tools: list[ExtractedTool] = []
        
        json_match = re.search(r"\[[\s\S]*\]", content)
        if not json_match:
            return tools
        
        try:
            raw_tools = json.loads(json_match.group())
        except json.JSONDecodeError:
            return tools
        
        for raw in raw_tools:
            if not isinstance(raw, dict):
                continue
            
            # Parse parameters with examples
            params = []
            for p in raw.get("parameters", []):
                if isinstance(p, dict):
                    param_type = self._parse_parameter_type(p.get("type", "string"))
                    examples = p.get("examples", [])
                    if not isinstance(examples, list):
                        examples = [examples] if examples else []
                    
                    params.append(ToolParameter(
                        name=p.get("name", "param"),
                        type=param_type,
                        description=p.get("description", ""),
                        required=p.get("required", True),
                        examples=[str(e) for e in examples],
                    ))
            
            tools.append(ExtractedTool(
                name=raw.get("name", "unknown"),
                display_name=raw.get("display_name", raw.get("name", "Unknown")),
                description=raw.get("description", ""),
                intent=raw.get("intent", ""),
                parameters=params,
                return_type=raw.get("return_type", "dict"),
                api_endpoint=raw.get("api_endpoint"),
                http_method=raw.get("http_method"),
                response_format=raw.get("response_format", "json"),
                estimated_response_size=raw.get("estimated_response_size", "<1KB"),
                source_url=discovery.docs_url,
            ))
        
        return tools

    def _parse_parameter_type(self, type_str: str) -> ParameterType:
        """Parse a type string into ParameterType enum."""
        type_str = type_str.lower() if type_str else "string"
        
        if "int" in type_str:
            return ParameterType.INTEGER
        elif "float" in type_str or "number" in type_str:
            return ParameterType.FLOAT
        elif "bool" in type_str:
            return ParameterType.BOOLEAN
        elif "array" in type_str or "list" in type_str:
            return ParameterType.ARRAY
        elif "object" in type_str or "dict" in type_str:
            return ParameterType.OBJECT
        return ParameterType.STRING

    def _parse_endpoints(self, endpoints: list[dict[str, Any]]) -> list[ExtractedTool]:
        """Parse raw endpoint data into tools."""
        tools: list[ExtractedTool] = []
        
        for ep in endpoints:
            # Get or generate a meaningful name
            name = ep.get("name") or ep.get("operationId")
            
            # If no name, generate from method + path
            if not name or name == "unknown":
                method = ep.get("method", "get").lower()
                path = ep.get("path", "")
                
                # Convert path to name: /v1/customers/{id} -> customers_id
                path_parts = path.strip("/").replace("{", "").replace("}", "")
                path_name = re.sub(r"[^a-zA-Z0-9]+", "_", path_parts).strip("_")
                
                # Map method to action prefix
                method_prefix = {
                    "get": "get", "post": "create", "put": "update",
                    "patch": "update", "delete": "delete"
                }.get(method, method)
                
                name = f"{method_prefix}_{path_name}" if path_name else f"{method_prefix}_endpoint"
            
            name = re.sub(r"[^a-zA-Z0-9_]", "_", name).lower()
            
            tools.append(ExtractedTool(
                name=name,
                display_name=ep.get("summary") or ep.get("description") or name.replace("_", " ").title(),
                description=ep.get("description", ""),
                intent=ep.get("intent", ""),
                api_endpoint=ep.get("path"),
                http_method=ep.get("method"),
                response_format=ep.get("response_format", "json"),
            ))
        
        return tools

    def _regex_extract_tools(self, markdown: str) -> list[ExtractedTool]:
        """Fallback: Extract tools using regex patterns from markdown."""
        tools: list[ExtractedTool] = []
        
        # Pattern: REST endpoints (GET /api/users, POST /v1/messages)
        endpoint_pattern = r"(GET|POST|PUT|DELETE|PATCH)\s+(/[a-zA-Z0-9/_\-{}:]+)"
        for match in re.finditer(endpoint_pattern, markdown):
            method, path = match.groups()
            name = self._path_to_function_name(method, path)
            
            tools.append(ExtractedTool(
                name=name,
                display_name=name.replace("_", " ").title(),
                description=f"{method} request to {path}",
                api_endpoint=path,
                http_method=method,
            ))
        
        return tools[:50]

    def _path_to_function_name(self, method: str, path: str) -> str:
        """Convert HTTP method and path to function name."""
        path = re.sub(r"^/v\d+/", "/", path)
        path = re.sub(r"\{[^}]+\}", "", path)
        parts = [p for p in path.split("/") if p]
        
        if method == "GET":
            verb = "list" if len(parts) == 1 else "get"
        elif method == "POST":
            verb = "create"
        elif method in ("PUT", "PATCH"):
            verb = "update"
        elif method == "DELETE":
            verb = "delete"
        else:
            verb = method.lower()
        
        name = f"{verb}_{'_'.join(parts)}"
        return re.sub(r"_+", "_", name).strip("_")

    async def suggest_composites(self, registry=None) -> list[dict]:
        """
        Analyze registry to suggest composite tool combinations.
        
        Looks for tools that naturally chain together:
        - Fetch -> Transform -> Post patterns
        - Cross-server workflows (GitHub -> OpenHands -> Slack)
        - Similar service combinations
        
        Returns:
            List of composite tool suggestions with code generation hints
        """
        if registry is None:
            from helpermcp.registry import RegistryDatabase
            registry = RegistryDatabase()
        
        tools = registry.list_tools(certified_only=True)
        
        suggestions = []
        
        # Group by service
        by_service: dict[str, list] = {}
        for tool in tools:
            by_service.setdefault(tool.service_name, []).append(tool)
        
        # Define common workflow patterns
        workflow_patterns = [
            {"trigger": "github", "processor": "openhands", "notifier": "slack"},
            {"trigger": "github", "processor": "openhands", "notifier": "discord"},
            {"trigger": "jira", "processor": "openhands", "notifier": "slack"},
            {"trigger": "stripe", "processor": None, "notifier": "slack"},
            {"trigger": "email", "processor": None, "notifier": "slack"},
        ]
        
        # Generate multi-server chain composites
        for pattern in workflow_patterns:
            trigger_service = pattern["trigger"]
            processor_service = pattern.get("processor")
            notifier_service = pattern["notifier"]
            
            trigger_tools = by_service.get(trigger_service, [])[:2]
            notifier_tools = by_service.get(notifier_service, [])[:2]
            processor_tools = by_service.get(processor_service, [])[:1] if processor_service else []
            
            for trigger in trigger_tools:
                for notifier in notifier_tools:
                    steps = [{"tool": trigger.name, "service": trigger_service}]
                    
                    if processor_tools:
                        for proc in processor_tools:
                            steps.append({"tool": proc.name, "service": processor_service})
                    
                    steps.append({"tool": notifier.name, "service": notifier_service})
                    
                    workflow_name = "_then_".join(s["service"] for s in steps)
                    suggestions.append({
                        "name": f"{workflow_name}_workflow",
                        "description": f"Workflow: {' → '.join(s['service'].title() for s in steps)}",
                        "steps": steps,
                        "pattern": "multi_server_chain",
                        "score": sum(t.aggregate_score for t in [trigger, notifier] + processor_tools) / (2 + len(processor_tools)),
                    })
        
        # Look for fetch + action patterns (single service)
        fetch_tools = [t for t in tools if t.name.startswith(("get_", "list_", "fetch_"))]
        action_tools = [t for t in tools if t.name.startswith(("send_", "post_", "create_"))]
        
        # Suggest cross-service workflows
        for fetch in fetch_tools[:5]:
            for action in action_tools[:5]:
                if fetch.service_name != action.service_name:
                    suggestions.append({
                        "name": f"{fetch.name}_then_{action.name}",
                        "description": f"Fetch from {fetch.service_name}, then {action.name.replace('_', ' ')}",
                        "steps": [
                            {"tool": fetch.name, "service": fetch.service_name},
                            {"tool": action.name, "service": action.service_name},
                        ],
                        "pattern": "fetch_then_action",
                        "score": (fetch.aggregate_score + action.aggregate_score) / 2,
                    })
        
        # Sort by score
        suggestions.sort(key=lambda x: x.get("score", 0), reverse=True)
        
        return suggestions[:15]


    async def heal_failing_tools(self, registry=None, threshold: int = 3) -> list[str]:
        """
        Identify and regenerate tools with high failure rates.
        
        Args:
            registry: RegistryDatabase instance
            threshold: Number of failures before triggering regeneration
            
        Returns:
            List of tool names queued for regeneration
        """
        if registry is None:
            from helpermcp.registry import RegistryDatabase
            registry = RegistryDatabase()
        
        tools = registry.list_tools(certified_only=True)
        
        to_heal = []
        
        for tool in tools:
            if tool.failure_history and len(tool.failure_history) >= threshold:
                to_heal.append(tool.name)
                
                # Mark for update
                registry.mark_update_available(tool.name)
        
        return to_heal

    async def generate_composite_tool(
        self,
        name: str,
        steps: list[dict],
    ) -> str:
        """
        Generate code for a composite tool that chains multiple tools.
        
        Args:
            name: Composite tool name
            steps: List of {tool, service, transform?} dicts
            
        Returns:
            Generated Python code
        """
        step_code = ""
        for i, step in enumerate(steps):
            tool_name = step.get("tool", "unknown")
            step_code += f'''
            # Step {i + 1}: {step.get("description", tool_name)}
            step_{i}_result = await mcp.call_tool("{tool_name}", step_input)
            if not step_{i}_result.get("success", True):
                return {{"success": False, "error": f"Step {i + 1} failed", "step": {i + 1}}}
            step_input = step_{i}_result.get("data", step_{i}_result)
'''
        
        code = f'''
@mcp.tool()
async def {name}(
    initial_input: dict = Field(..., description="Initial input for the composite workflow"),
) -> dict[str, Any]:
    """
    Composite tool that chains {len(steps)} operations.
    
    Tool Type: COMPOSITE
    """
    step_input = initial_input
    
    try:
{step_code}
        return {{"success": True, "data": step_input}}
    except Exception as e:
        return {{"success": False, "error": str(e)}}
'''
        return code

    async def close(self):
        """Close the HTTP client."""
        await self.http_client.aclose()


"""Mock Client Agent for double-blind testing in the sandbox."""

import json
import re
from typing import Any

import httpx

from helpermcp.core import ExtractedTool, settings


class MockClientAgent:
    """
    Mock Client agent that tests tools using realistic prompts.
    
    Part of the "double-blind" test system:
    - Server Agent: Runs the tool in Docker
    - Client Agent: Attempts to use the tool to solve a prompt
    """

    def __init__(self):
        self.http_client = httpx.AsyncClient(timeout=60.0)

    async def generate_test_prompt(self, tool: ExtractedTool) -> str:
        """
        Generate a realistic test prompt for a tool.
        
        Uses LLM to create a natural language request that would invoke this tool.
        """
        prompt = f"""Generate a realistic user prompt that would require using this tool:

Tool: {tool.name}
Description: {tool.description}
Intent: {tool.intent}
Parameters: {[p.name for p in tool.parameters]}

Generate a SHORT, natural user request (1 sentence) that would invoke this tool.
Only return the prompt, nothing else.
"""

        try:
            response = await self.http_client.post(
                f"{settings.llm_base_url}/chat/completions",
                json={
                    "model": settings.llm_model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                },
                headers={"Authorization": f"Bearer {settings.llm_api_key or 'not-needed'}"},
            )
            response.raise_for_status()
            
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()
            
        except Exception:
            # Fallback prompt
            return f"Please {tool.display_name.lower()}"

    async def generate_test_arguments(self, tool: ExtractedTool) -> dict[str, Any]:
        """
        Generate realistic test arguments for a tool.
        """
        args = {}
        
        for param in tool.parameters:
            if param.examples:
                # Use first example
                args[param.name] = param.examples[0]
            else:
                # Generate based on type
                args[param.name] = self._generate_mock_value(param)
        
        return args

    def _generate_mock_value(self, param) -> Any:
        """Generate a mock value based on parameter type."""
        type_str = param.type.value if hasattr(param.type, 'value') else str(param.type)
        name_lower = param.name.lower()
        
        # Name-based inference
        if "email" in name_lower:
            return "test@example.com"
        if "url" in name_lower or "link" in name_lower:
            return "https://example.com"
        if "id" in name_lower:
            return "test_123"
        if "name" in name_lower:
            return "Test Name"
        if "message" in name_lower or "text" in name_lower:
            return "Test message content"
        if "channel" in name_lower:
            return "general"
        if "user" in name_lower:
            return "test_user"
        
        # Type-based defaults
        if type_str == "integer":
            return 42
        if type_str == "float":
            return 3.14
        if type_str == "boolean":
            return True
        if type_str == "array":
            return ["item1", "item2"]
        if type_str == "object":
            return {"key": "value"}
        
        return "test_value"

    async def validate_response(
        self,
        tool: ExtractedTool,
        response: dict[str, Any],
    ) -> tuple[bool, str]:
        """
        Validate that a tool response is correct.
        
        Returns:
            Tuple of (passed, reason)
        """
        # Check for error responses
        if "error" in response:
            if response.get("status") == "failed":
                return False, f"Tool returned error: {response['error']}"
        
        # Check response is not empty
        if not response:
            return False, "Empty response"
        
        # For now, any non-error response is valid
        # Future: Use LLM to validate response quality
        return True, "Response validated"

    async def close(self):
        """Close the HTTP client."""
        await self.http_client.aclose()

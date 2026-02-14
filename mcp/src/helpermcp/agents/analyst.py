"""RequirementAnalyst - LLM-based goal decomposition for JIT tooling."""

import json
import re
from typing import Any

import httpx
from pydantic import BaseModel, Field

from helpermcp.core import settings


class RequirementMap(BaseModel):
    """
    Structured decomposition of a user goal into technical requirements.
    
    Used by the JIT pipeline to determine what tools are needed.
    """
    
    # Specific intents extracted from the goal
    intents: list[str] = Field(
        default_factory=list,
        description="Specific actions needed, e.g. 'extract commit history', 'calculate growth rate'",
    )
    
    # Tools that don't exist in the registry
    capability_gaps: list[str] = Field(
        default_factory=list,
        description="Tool names that need to be created",
    )
    
    # Category focus for scoring
    category: str = Field(
        default="general",
        description="Primary category: 'data', 'action', 'calculation', 'automation'",
    )
    
    # Priority services to focus on
    priority_services: list[str] = Field(
        default_factory=list,
        description="Services to prioritize during discovery",
    )
    
    # Extracted target type
    target_type: str = Field(
        default="unknown",
        description="Type of target: 'url', 'repository', 'package', 'api'",
    )
    
    # Confidence score
    confidence: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="Confidence in the analysis",
    )


class RequirementAnalyst:
    """
    Agent that uses an LLM to decompose user goals into technical requirements.
    
    Bridges the gap between natural language prompts and tool generation.
    """

    ANALYSIS_PROMPT = """You are a requirements analyst for an AI tool factory. 
Analyze the user's goal and target to determine what technical capabilities are needed.

User Goal: {goal}
Target: {target}
Focus Category: {focus}

Respond with a JSON object containing:
{{
    "intents": ["specific action 1", "specific action 2", ...],
    "category": "data|action|calculation|automation",
    "priority_services": ["service1", "service2"],
    "target_type": "url|repository|package|api",
    "suggested_tools": [
        {{"name": "tool_name", "description": "what it does", "priority": 1-10}}
    ],
    "confidence": 0.0-1.0
}}

Be specific about what operations are needed. Focus on the {focus} aspect."""

    def __init__(self):
        self.http_client = httpx.AsyncClient(timeout=60.0)

    async def analyze(
        self,
        goal: str,
        target: str,
        focus: str = "general",
    ) -> RequirementMap:
        """
        Decompose a user goal into a technical requirement map.
        
        Args:
            goal: Natural language description of what the user wants
            target: The target (URL, path, package name)
            focus: Category focus ('data', 'action', 'calculation')
            
        Returns:
            RequirementMap with decomposed requirements
        """
        # Detect target type
        target_type = self._detect_target_type(target)
        
        # Use LLM for deep analysis
        llm_analysis = await self._llm_analyze(goal, target, focus)
        
        if llm_analysis:
            return llm_analysis
        
        # Fallback to rule-based analysis
        return self._rule_based_analysis(goal, target, target_type, focus)

    def _detect_target_type(self, target: str) -> str:
        """Detect the type of target."""
        from pathlib import Path
        
        if target.startswith("http://") or target.startswith("https://"):
            return "url"
        elif Path(target).exists():
            return "repository"
        elif "/" in target or "\\" in target:
            return "repository"  # Likely a path
        else:
            return "package"

    async def _llm_analyze(
        self,
        goal: str,
        target: str,
        focus: str,
    ) -> RequirementMap | None:
        """Use LLM for deep goal analysis."""
        prompt = self.ANALYSIS_PROMPT.format(goal=goal, target=target, focus=focus)
        
        try:
            response = await self.http_client.post(
                f"{settings.llm_base_url}/chat/completions",
                json={
                    "model": settings.llm_model,
                    "messages": [
                        {"role": "system", "content": "You are a technical requirements analyst."},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.3,
                    "max_tokens": 1000,
                },
                headers={"Authorization": f"Bearer {settings.llm_api_key}"} if settings.llm_api_key else {},
            )
            
            if response.status_code != 200:
                return None
            
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            
            # Parse JSON from response
            json_match = re.search(r"\{[\s\S]*\}", content)
            if json_match:
                analysis = json.loads(json_match.group())
                
                return RequirementMap(
                    intents=analysis.get("intents", []),
                    category=analysis.get("category", focus),
                    priority_services=analysis.get("priority_services", []),
                    target_type=analysis.get("target_type", self._detect_target_type(target)),
                    capability_gaps=[
                        t["name"] for t in analysis.get("suggested_tools", [])
                    ],
                    confidence=analysis.get("confidence", 0.7),
                )
                
        except Exception as e:
            print(f"LLM analysis failed: {e}")
        
        return None

    def _rule_based_analysis(
        self,
        goal: str,
        target: str,
        target_type: str,
        focus: str,
    ) -> RequirementMap:
        """Fallback rule-based analysis."""
        goal_lower = goal.lower()
        
        intents = []
        services = []
        category = focus if focus != "general" else "data"
        
        # Extract intents from keywords
        if any(word in goal_lower for word in ["extract", "get", "fetch", "read"]):
            intents.append("extract data")
        if any(word in goal_lower for word in ["analyze", "check", "inspect"]):
            intents.append("analyze content")
        if any(word in goal_lower for word in ["calculate", "compute", "count"]):
            intents.append("perform calculations")
            category = "calculation"
        if any(word in goal_lower for word in ["send", "post", "create", "push"]):
            intents.append("perform action")
            category = "action"
        if any(word in goal_lower for word in ["automate", "schedule", "trigger"]):
            intents.append("automate workflow")
            category = "automation"
        
        # Detect services from goal
        service_keywords = {
            "github": "github",
            "git": "github",
            "repo": "github",
            "slack": "slack",
            "discord": "discord",
            "stripe": "stripe",
            "payment": "stripe",
            "email": "email",
            "api": "http",
        }
        
        for keyword, service in service_keywords.items():
            if keyword in goal_lower or keyword in target.lower():
                if service not in services:
                    services.append(service)
        
        return RequirementMap(
            intents=intents if intents else ["general operation"],
            category=category,
            priority_services=services,
            target_type=target_type,
            capability_gaps=[],
            confidence=0.5,
        )

    async def identify_capability_gaps(
        self,
        requirement_map: RequirementMap,
        registry=None,
    ) -> RequirementMap:
        """
        Identify which required capabilities don't exist in the registry.
        
        Args:
            requirement_map: The analyzed requirements
            registry: RegistryDatabase instance
            
        Returns:
            Updated RequirementMap with capability_gaps filled
        """
        if registry is None:
            from helpermcp.registry import RegistryDatabase
            registry = RegistryDatabase()
        
        from helpermcp.registry import SemanticSearch
        
        search = SemanticSearch(registry)
        gaps = []
        
        for intent in requirement_map.intents:
            # Search for existing tools
            results = search.search(intent, limit=3)
            
            if not results or results[0][1] < 0.7:  # Low relevance
                # This is a capability gap
                gaps.append(intent.replace(" ", "_"))
        
        requirement_map.capability_gaps = gaps
        return requirement_map

    async def close(self):
        """Close the HTTP client."""
        await self.http_client.aclose()

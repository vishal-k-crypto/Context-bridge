"""Semantic Search - Vector-based tool discovery."""

import json
from typing import Any

import numpy as np

from helpermcp.registry.database import RegistryDatabase, ToolManifest


class SemanticSearch:
    """
    Natural language tool discovery using vector similarity.
    
    Uses sentence-transformers embeddings with cosine similarity
    to find tools matching user queries.
    """

    def __init__(self, registry: RegistryDatabase):
        self.registry = registry
        self._embedder = None

    def _get_embedder(self):
        """Lazy-load sentence transformer."""
        if self._embedder is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._embedder = SentenceTransformer("all-MiniLM-L6-v2")
            except ImportError:
                self._embedder = None
        return self._embedder

    def _cosine_similarity(self, a: list[float], b: list[float]) -> float:
        """Compute cosine similarity between two vectors."""
        if not a or not b:
            return 0.0
        
        a_np = np.array(a)
        b_np = np.array(b)
        
        dot = np.dot(a_np, b_np)
        norm_a = np.linalg.norm(a_np)
        norm_b = np.linalg.norm(b_np)
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
        
        return float(dot / (norm_a * norm_b))

    def search(
        self,
        query: str,
        limit: int = 10,
        min_score: float = 0.3,
        service_filter: str | None = None,
    ) -> list[tuple[ToolManifest, float]]:
        """
        Search for tools using natural language.
        
        Args:
            query: Natural language query (e.g., "tools for parsing satellite data")
            limit: Maximum results to return
            min_score: Minimum similarity score (0-1)
            service_filter: Optional service name filter
            
        Returns:
            List of (ToolManifest, similarity_score) tuples
        """
        embedder = self._get_embedder()
        if embedder is None:
            # Fallback to keyword search
            return self._keyword_search(query, limit, service_filter)
        
        # Generate query embedding
        query_embedding = embedder.encode(query, convert_to_numpy=True).tolist()
        
        # Get all tools
        tools = self.registry.list_tools(
            service_name=service_filter,
            certified_only=True,
        )
        
        # Calculate similarities
        results = []
        for tool in tools:
            if not tool.embedding:
                continue
            
            similarity = self._cosine_similarity(query_embedding, tool.embedding)
            if similarity >= min_score:
                results.append((tool, similarity))
        
        # Sort by similarity descending
        results.sort(key=lambda x: x[1], reverse=True)
        
        return results[:limit]

    def _keyword_search(
        self,
        query: str,
        limit: int,
        service_filter: str | None,
    ) -> list[tuple[ToolManifest, float]]:
        """Fallback keyword-based search."""
        query_lower = query.lower()
        keywords = query_lower.split()
        
        tools = self.registry.list_tools(
            service_name=service_filter,
            certified_only=True,
        )
        
        results = []
        for tool in tools:
            # Simple keyword matching
            text = f"{tool.name} {tool.display_name} {tool.description} {tool.intent}".lower()
            
            matches = sum(1 for kw in keywords if kw in text)
            if matches > 0:
                score = matches / len(keywords)
                results.append((tool, score))
        
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:limit]

    def find_similar(
        self,
        tool_name: str,
        limit: int = 5,
    ) -> list[tuple[ToolManifest, float]]:
        """Find tools similar to a given tool."""
        tool = self.registry.get_tool(tool_name)
        if not tool or not tool.embedding:
            return []
        
        tools = self.registry.list_tools(certified_only=True)
        
        results = []
        for other in tools:
            if other.name == tool_name or not other.embedding:
                continue
            
            similarity = self._cosine_similarity(tool.embedding, other.embedding)
            if similarity > 0.5:
                results.append((other, similarity))
        
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:limit]


def create_search_tool_code(registry_path: str) -> str:
    """Generate MCP tool code for search functionality."""
    return f'''
@mcp.tool()
async def search_tools(
    query: str = Field(..., description="Natural language query to find tools"),
    limit: int = Field(10, description="Maximum results to return"),
) -> list[dict]:
    """
    Find tools using natural language search.
    
    Examples:
    - "tools for parsing satellite data"
    - "payment processing tools"
    - "send notifications"
    
    Returns list of matching tools with relevance scores.
    """
    from helpermcp.registry import RegistryDatabase, SemanticSearch
    
    registry = RegistryDatabase("{registry_path}")
    search = SemanticSearch(registry)
    
    results = search.search(query, limit=limit)
    
    return [
        {{
            "name": tool.name,
            "display_name": tool.display_name,
            "description": tool.description,
            "service": tool.service_name,
            "score": tool.aggregate_score,
            "relevance": round(relevance, 3),
        }}
        for tool, relevance in results
    ]
'''

"""Core configuration and settings for HelperMCP."""

from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class HelperMCPSettings(BaseSettings):
    """Configuration settings for HelperMCP."""

    model_config = SettingsConfigDict(
        env_prefix="HELPERMCP_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # LLM Configuration
    llm_provider: Literal["openai", "anthropic", "ollama"] = Field(
        default="ollama",
        description="LLM provider for agent reasoning",
    )
    llm_model: str = Field(
        default="llama3.2",
        description="Model name for the LLM provider",
    )
    llm_base_url: str = Field(
        default="http://localhost:11434/v1",
        description="Base URL for LLM API (Ollama proxy or OpenAI-compatible)",
    )
    llm_api_key: str | None = Field(
        default=None,
        description="API key for LLM provider (not needed for local Ollama)",
    )

    # Web Scraping Configuration (Optional - Firecrawl for JS-heavy sites)
    firecrawl_api_key: str | None = Field(
        default=None,
        description="Optional: Firecrawl API key for complex JS-heavy sites",
    )
    
    # NOTE: External search APIs removed - discovery is now 100% autonomous
    # using AI Theorist (LLM) + NetworkSpy Observer

    # Docker Sandbox Configuration
    docker_image: str = Field(
        default="python:3.12-slim",
        description="Base Docker image for sandbox",
    )
    docker_timeout: int = Field(
        default=60,
        description="Timeout in seconds for Docker container execution",
    )
    docker_memory_limit: str = Field(
        default="256m",
        description="Memory limit for Docker containers",
    )
    docker_cpu_limit: float = Field(
        default=0.5,
        description="CPU limit (fractional cores) for Docker containers",
    )

    # Storage Configuration
    storage_backend: Literal["sqlite", "supabase"] = Field(
        default="sqlite",
        description="Storage backend for caching documentation",
    )
    sqlite_path: Path = Field(
        default=Path("~/.helpermcp/cache.db").expanduser(),
        description="Path to SQLite database",
    )
    supabase_url: str | None = Field(
        default=None,
        description="Supabase project URL",
    )
    supabase_key: str | None = Field(
        default=None,
        description="Supabase anon/service key",
    )

    # Pipeline Configuration - UNRESTRICTED MODE
    max_tools_per_server: int = Field(
        default=500,
        description="Maximum tools per server (set high for unrestricted generation)",
    )
    min_tool_score: float = Field(
        default=0.0,
        description="Minimum score threshold (0.0 = no filtering, all tools pass)",
    )
    max_retries: int = Field(
        default=3,
        description="Maximum retry attempts for self-healing loop",
    )

    # Output Configuration
    output_dir: Path = Field(
        default=Path("./generated_servers"),
        description="Directory for generated MCP servers",
    )


# Global settings instance
settings = HelperMCPSettings()

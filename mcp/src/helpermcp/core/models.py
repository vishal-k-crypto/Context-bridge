"""Data models for HelperMCP pipeline."""

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class AuthType(str, Enum):
    """Authentication type for the target service."""

    API_KEY = "api_key"
    OAUTH2 = "oauth2"
    BASIC = "basic"
    BEARER = "bearer"
    NONE = "none"


class ParameterType(str, Enum):
    """Parameter types for tool parameters."""

    STRING = "string"
    INTEGER = "integer"
    FLOAT = "float"
    BOOLEAN = "boolean"
    ARRAY = "array"
    OBJECT = "object"
    FILE = "file"


class ToolParameter(BaseModel):
    """A parameter for an extracted tool."""

    name: str = Field(..., description="Parameter name")
    type: ParameterType = Field(default=ParameterType.STRING, description="Parameter type")
    description: str = Field(default="", description="Parameter description")
    required: bool = Field(default=True, description="Whether the parameter is required")
    default: Any | None = Field(default=None, description="Default value if any")
    enum_values: list[str] | None = Field(default=None, description="Allowed enum values")
    examples: list[str] = Field(default_factory=list, description="Example values")


class ToolScore(BaseModel):
    """Three-dimensional scoring for tool quality assessment."""

    # LLM Utility: Can the LLM do this internally?
    # 1-3: Math/string ops (sqrt, format)
    # 4-6: Complex logic but no external data
    # 7-10: External API calls, real-time data
    llm_utility: float = Field(default=5.0, ge=0.0, le=10.0)
    llm_utility_reason: str = Field(default="")

    # Determinism: Is output reliable and parsable?
    # 1-3: Raw HTML, unpredictable format
    # 4-6: Semi-structured (XML, varied JSON)
    # 7-10: Typed SDK responses, consistent JSON schema
    determinism: float = Field(default=5.0, ge=0.0, le=10.0)
    determinism_reason: str = Field(default="")

    # Token Efficiency: Data density vs noise
    # 1-3: 50KB+ responses, lots of noise
    # 4-6: 1-10KB, some filtering needed
    # 7-10: <1KB, pure structured data
    token_efficiency: float = Field(default=5.0, ge=0.0, le=10.0)
    token_efficiency_reason: str = Field(default="")

    # Aggregate score (weighted average)
    aggregate: float = Field(default=0.0, ge=0.0, le=10.0)

    # Pass/fail threshold (7.5)
    passed: bool = Field(default=False)

    def calculate_aggregate(self, weights: tuple[float, float, float] = (0.4, 0.35, 0.25)) -> float:
        """Calculate weighted aggregate score."""
        from helpermcp.core import settings
        
        w_util, w_det, w_eff = weights
        self.aggregate = round(
            self.llm_utility * w_util +
            self.determinism * w_det +
            self.token_efficiency * w_eff,
            2
        )
        # Use settings threshold (default 0.0 = all tools pass)
        self.passed = self.aggregate >= settings.min_tool_score
        return self.aggregate


class ExtractedTool(BaseModel):
    """A tool extracted from documentation by the Architect agent."""

    name: str = Field(..., description="Tool function name (snake_case)")
    display_name: str = Field(..., description="Human-readable tool name")
    description: str = Field(..., description="What the tool does")
    intent: str = Field(default="", description="Intent extracted from documentation context")
    parameters: list[ToolParameter] = Field(default_factory=list, description="Tool parameters")
    return_type: str = Field(default="dict", description="Return type annotation")
    return_description: str = Field(default="", description="What the tool returns")

    # Legacy scoring (for backwards compatibility)
    score: float = Field(default=0.0, ge=0.0, le=10.0, description="Tool value score (0-10)")
    score_reasoning: str = Field(default="", description="Why this score was assigned")

    # Enhanced three-dimensional scoring
    detailed_score: ToolScore | None = Field(default=None, description="Detailed scoring breakdown")

    # Source information
    source_url: str | None = Field(default=None, description="URL where this tool was found")
    api_endpoint: str | None = Field(default=None, description="API endpoint if applicable")
    http_method: str | None = Field(default=None, description="HTTP method if REST API")
    response_format: str = Field(default="json", description="Expected response format")
    estimated_response_size: str = Field(default="<1KB", description="Typical response size")

    # Code generation hints
    requires_auth: bool = Field(default=True, description="Whether tool requires authentication")
    is_async: bool = Field(default=True, description="Whether to generate async function")
    example_code: str | None = Field(default=None, description="Example usage from docs")
    generated_code: str | None = Field(default=None, description="Generated FastMCP code")

    # Certification status
    certified: bool = Field(default=False, description="Passed 3-strike certification")
    certification_attempts: int = Field(default=0, description="Number of certification attempts")



class DiscoveryResult(BaseModel):
    """Result from the Scout agent's discovery process."""

    target_name: str = Field(..., description="Name of the target service")
    discovered_at: datetime = Field(default_factory=datetime.now)
    
    # SDK Information
    sdk_name: str | None = Field(default=None, description="Official SDK package name")
    sdk_version: str | None = Field(default=None, description="SDK version if found")
    sdk_install_command: str | None = Field(default=None, description="pip install command")
    
    # Documentation URLs
    docs_url: str | None = Field(default=None, description="Main documentation URL")
    api_reference_url: str | None = Field(default=None, description="API reference URL")
    quickstart_url: str | None = Field(default=None, description="Quickstart guide URL")
    
    # Authentication
    auth_type: AuthType = Field(default=AuthType.API_KEY, description="Authentication type")
    auth_header_name: str | None = Field(default=None, description="Auth header name")
    auth_env_var: str | None = Field(default=None, description="Suggested env var for auth")
    
    # Raw content
    markdown_docs: str = Field(default="", description="Scraped documentation in markdown")
    raw_endpoints: list[dict[str, Any]] = Field(
        default_factory=list,
        description="Raw API endpoint data before processing",
    )


class TestResult(BaseModel):
    """Result from testing a single tool in the sandbox."""

    tool_name: str = Field(..., description="Name of the tested tool")
    passed: bool = Field(..., description="Whether the test passed")
    execution_time_ms: float = Field(default=0.0, description="Execution time in milliseconds")
    stdout: str = Field(default="", description="Standard output from test")
    stderr: str = Field(default="", description="Standard error from test")
    error_message: str | None = Field(default=None, description="Error message if failed")


class GeneratedMCPServer(BaseModel):
    """A fully generated MCP server ready for deployment."""

    service_name: str = Field(..., description="Name of the target service")
    package_name: str = Field(..., description="Python package name")
    generated_at: datetime = Field(default_factory=datetime.now)
    
    # Tools
    tools: list[ExtractedTool] = Field(default_factory=list, description="Included tools")
    tools_count: int = Field(default=0, description="Number of tools")
    
    # Generated code
    server_code: str = Field(default="", description="Main server.py code")
    init_code: str = Field(default="", description="__init__.py code")
    requirements: list[str] = Field(default_factory=list, description="Requirements")
    
    # Test results
    test_results: list[TestResult] = Field(default_factory=list, description="Test results")
    all_tests_passed: bool = Field(default=False, description="Whether all tests passed")
    
    # Output paths
    output_dir: str | None = Field(default=None, description="Path to generated files")


class PipelineState(BaseModel):
    """State for the LangGraph orchestration pipeline."""

    # Input
    target: str = Field(..., description="Target service name")
    
    # Pipeline stages
    discovery_result: DiscoveryResult | None = Field(default=None)
    extracted_tools: list[ExtractedTool] = Field(default_factory=list)
    filtered_tools: list[ExtractedTool] = Field(default_factory=list)
    generated_server: GeneratedMCPServer | None = Field(default=None)
    
    # Control flow
    current_stage: str = Field(default="discovery", description="Current pipeline stage")
    retry_count: int = Field(default=0, description="Number of retries")
    error_message: str | None = Field(default=None, description="Last error if any")
    
    # Logging
    logs: list[str] = Field(default_factory=list, description="Pipeline execution logs")

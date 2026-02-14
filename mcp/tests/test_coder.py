"""Unit tests for the Coder agent."""

import pytest

from helpermcp.agents.coder import CoderAgent
from helpermcp.core import (
    AuthType,
    DiscoveryResult,
    ExtractedTool,
    ParameterType,
    ToolParameter,
)


class TestCoderAgent:
    """Tests for CoderAgent."""

    @pytest.fixture
    def coder(self):
        """Create a Coder agent instance."""
        return CoderAgent()

    def test_generate_package_name(self, coder):
        """Test package name generation."""
        assert coder._generate_package_name("Stripe") == "stripe_mcp"
        assert coder._generate_package_name("GitHub API") == "github_api_mcp"
        assert coder._generate_package_name("Slack") == "slack_mcp"

    def test_get_default_value(self, coder):
        """Test default value generation for types."""
        assert coder._get_default_value(ParameterType.STRING) == '""'
        assert coder._get_default_value(ParameterType.INTEGER) == "0"
        assert coder._get_default_value(ParameterType.BOOLEAN) == "False"
        assert coder._get_default_value(ParameterType.ARRAY) == "[]"

    def test_generate_requirements(self, coder):
        """Test requirements generation."""
        discovery = DiscoveryResult(
            target_name="Stripe",
            sdk_name="stripe",
            sdk_install_command="pip install stripe",
        )
        
        reqs = coder._generate_requirements(discovery)
        assert "fastmcp>=2.0" in reqs
        assert "httpx>=0.27.0" in reqs
        assert any("stripe" in r for r in reqs)

    def test_get_base_url(self, coder):
        """Test base URL extraction."""
        discovery = DiscoveryResult(
            target_name="Stripe",
            api_reference_url="https://stripe.com/docs/api",
        )
        
        url = coder._get_base_url(discovery)
        assert "stripe" in url.lower()

    def test_generate_tool_code_rest(self, coder):
        """Test code generation for REST API tool."""
        tool = ExtractedTool(
            name="list_users",
            display_name="List Users",
            description="List all users",
            api_endpoint="/users",
            http_method="GET",
        )
        
        discovery = DiscoveryResult(target_name="Test")
        code = coder._generate_tool_code(tool, discovery)
        
        assert "@mcp.tool()" in code
        assert "async def list_users" in code
        assert "client.get" in code

    def test_generate_tool_code_with_params(self, coder):
        """Test code generation with parameters."""
        tool = ExtractedTool(
            name="create_message",
            display_name="Create Message",
            description="Create a new message",
            parameters=[
                ToolParameter(name="channel", type=ParameterType.STRING, required=True),
                ToolParameter(name="text", type=ParameterType.STRING, required=True),
            ],
            api_endpoint="/messages",
            http_method="POST",
        )
        
        discovery = DiscoveryResult(target_name="Test")
        code = coder._generate_tool_code(tool, discovery)
        
        assert "channel: str" in code
        assert "text: str" in code
        assert "client.post" in code


class TestCodeGeneration:
    """Tests for full code generation."""

    @pytest.fixture
    def coder(self):
        return CoderAgent()

    @pytest.mark.asyncio
    async def test_generate_server(self, coder):
        """Test full server generation."""
        discovery = DiscoveryResult(
            target_name="TestService",
            sdk_name="testservice",
            auth_type=AuthType.API_KEY,
            auth_env_var="TEST_API_KEY",
        )
        
        tools = [
            ExtractedTool(
                name="get_status",
                display_name="Get Status",
                description="Get service status",
                score=7.0,
            ),
        ]
        
        server = await coder.generate(discovery, tools)
        
        assert server.service_name == "TestService"
        assert server.package_name == "testservice_mcp"
        assert server.tools_count == 1
        assert "fastmcp" in server.server_code.lower()
        assert "TEST_API_KEY" in server.server_code

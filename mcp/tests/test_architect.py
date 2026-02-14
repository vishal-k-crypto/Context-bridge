"""Unit tests for the enhanced Architect agent with three-dimensional scoring."""

import pytest

from helpermcp.agents.architect import ArchitectAgent
from helpermcp.core import ExtractedTool, ParameterType, ToolParameter, ToolScore


class TestArchitectAgent:
    """Tests for ArchitectAgent."""

    @pytest.fixture
    def architect(self):
        """Create an Architect agent instance."""
        return ArchitectAgent()

    def test_score_llm_utility_low(self, architect):
        """Test LLM utility scoring for low-value functions."""
        tool = ExtractedTool(
            name="format_date",
            display_name="Format Date",
            description="Format a date string",
        )
        score, reason = architect._score_llm_utility(tool)
        assert score <= 3.0
        assert "LLM can perform this internally" in reason

    def test_score_llm_utility_high(self, architect):
        """Test LLM utility scoring for high-value functions."""
        tool = ExtractedTool(
            name="send_message",
            display_name="Send Message",
            description="Send a message to a user",
            api_endpoint="/messages",
        )
        score, reason = architect._score_llm_utility(tool)
        assert score >= 8.0
        assert "External API" in reason or "High-value" in reason

    def test_score_determinism_json(self, architect):
        """Test determinism scoring for JSON responses."""
        tool = ExtractedTool(
            name="get_user",
            display_name="Get User",
            description="Get user data",
            response_format="json",
        )
        score, reason = architect._score_determinism(tool)
        assert score >= 8.0
        assert "JSON" in reason

    def test_score_determinism_html(self, architect):
        """Test determinism scoring for HTML responses."""
        tool = ExtractedTool(
            name="get_page",
            display_name="Get Page",
            description="Get HTML page",
            response_format="html",
        )
        score, reason = architect._score_determinism(tool)
        assert score <= 4.0
        assert "HTML" in reason or "Unstructured" in reason

    def test_score_token_efficiency_small(self, architect):
        """Test token efficiency for small responses."""
        tool = ExtractedTool(
            name="get_status",
            display_name="Get Status",
            description="Get status",
            estimated_response_size="<1KB",
        )
        score, reason = architect._score_token_efficiency(tool)
        assert score >= 9.0
        assert "Compact" in reason or "<1KB" in reason

    def test_score_token_efficiency_large(self, architect):
        """Test token efficiency for large responses."""
        tool = ExtractedTool(
            name="list_all",
            display_name="List All",
            description="List all items",
            estimated_response_size="50KB+",
        )
        score, reason = architect._score_token_efficiency(tool)
        assert score <= 4.0
        assert "Large" in reason


class TestToolScore:
    """Tests for ToolScore model."""

    def test_aggregate_calculation(self):
        """Test aggregate score calculation."""
        score = ToolScore(
            llm_utility=9.0,
            determinism=8.0,
            token_efficiency=7.0,
        )
        
        # Default weights: (0.4, 0.35, 0.25)
        # 9*0.4 + 8*0.35 + 7*0.25 = 3.6 + 2.8 + 1.75 = 8.15
        aggregate = score.calculate_aggregate()
        assert aggregate == 8.15
        assert score.passed is True

    def test_threshold_fail(self):
        """Test aggregate score below threshold."""
        score = ToolScore(
            llm_utility=5.0,
            determinism=5.0,
            token_efficiency=5.0,
        )
        
        # 5*0.4 + 5*0.35 + 5*0.25 = 2.0 + 1.75 + 1.25 = 5.0
        aggregate = score.calculate_aggregate()
        assert aggregate == 5.0
        assert score.passed is False


class TestFullScoring:
    """Tests for full tool scoring pipeline."""

    @pytest.fixture
    def architect(self):
        return ArchitectAgent()

    @pytest.mark.asyncio
    async def test_score_tool_full_high_value(self, architect):
        """Test full scoring for a high-value tool."""
        tool = ExtractedTool(
            name="create_payment",
            display_name="Create Payment",
            description="Create a payment transaction via Stripe API",
            api_endpoint="/v1/payments",
            http_method="POST",
            response_format="json",
            estimated_response_size="<1KB",
            parameters=[
                ToolParameter(name="amount", type=ParameterType.INTEGER),
                ToolParameter(name="currency", type=ParameterType.STRING),
            ],
        )
        
        # Mock discovery
        from helpermcp.core import DiscoveryResult
        discovery = DiscoveryResult(target_name="Stripe")
        
        scored_tool = await architect._score_tool_full(tool, discovery)
        
        assert scored_tool.detailed_score is not None
        assert scored_tool.detailed_score.aggregate >= 7.5
        assert scored_tool.detailed_score.passed is True

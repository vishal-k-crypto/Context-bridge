"""Unit tests for the Scout agent."""

import pytest

from helpermcp.agents.scout import ScoutAgent, SearchResult


class TestScoutAgent:
    """Tests for ScoutAgent."""

    @pytest.fixture
    def scout(self):
        """Create a Scout agent instance."""
        return ScoutAgent()

    def test_guess_sdk_name(self, scout):
        """Test SDK name guessing."""
        assert scout._guess_sdk_name("Stripe") == "stripe"
        assert scout._guess_sdk_name("GitHub") == "github"
        assert scout._guess_sdk_name("Slack API") == "slack-api"

    def test_detect_auth_type_api_key(self, scout):
        """Test API key auth detection."""
        from helpermcp.core import AuthType, DiscoveryResult
        
        result = DiscoveryResult(
            target_name="Test",
            markdown_docs="Use your API_KEY in the header"
        )
        
        result = scout._detect_auth_type("Test", result)
        assert result.auth_type == AuthType.API_KEY

    def test_detect_auth_type_oauth(self, scout):
        """Test OAuth2 auth detection."""
        from helpermcp.core import AuthType, DiscoveryResult
        
        result = DiscoveryResult(
            target_name="Test",
            markdown_docs="Authenticate using OAuth2 authorization_code flow"
        )
        
        result = scout._detect_auth_type("Test", result)
        assert result.auth_type == AuthType.OAUTH2

    def test_detect_auth_type_bearer(self, scout):
        """Test Bearer token auth detection."""
        from helpermcp.core import AuthType, DiscoveryResult
        
        result = DiscoveryResult(
            target_name="Test",
            markdown_docs="Pass the Bearer token in Authorization header"
        )
        
        result = scout._detect_auth_type("Test", result)
        assert result.auth_type == AuthType.BEARER


class TestSearchResult:
    """Tests for SearchResult model."""

    def test_search_result_creation(self):
        """Test creating a search result."""
        result = SearchResult(
            title="Stripe Python SDK",
            url="https://github.com/stripe/stripe-python",
            snippet="Official Stripe Python client"
        )
        
        assert result.title == "Stripe Python SDK"
        assert "stripe" in result.url

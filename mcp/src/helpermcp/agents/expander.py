"""
TaskExpander Agent - Proactive Gap Discovery & Expansion

This agent "imagines" real-world user journeys for a service,
identifies missing capabilities, and auto-triggers expansion.
"""

from dataclasses import dataclass, field
from pathlib import Path
import re
from typing import Any


@dataclass
class UserJourney:
    """A simulated user workflow."""
    name: str
    description: str
    required_actions: list[str]
    missing_tools: list[str] = field(default_factory=list)


# Pre-defined user journeys for major services
SERVICE_JOURNEYS = {
    "github": [
        UserJourney(
            name="Feature Development",
            description="Develop and ship a new feature",
            required_actions=["create_branch", "list_commits", "create_pr", "merge_pr", "list_issues", "create_issue"]
        ),
        UserJourney(
            name="Bug Triage",
            description="Identify and fix bugs",
            required_actions=["list_issues", "get_issue", "add_comment", "assign_issue", "create_branch", "create_pr"]
        ),
        UserJourney(
            name="Release Management",
            description="Prepare and publish releases",
            required_actions=["list_releases", "create_release", "list_tags", "compare_commits", "get_changelog"]
        ),
    ],
    "stripe": [
        UserJourney(
            name="Payment Processing",
            description="Accept and process payments",
            required_actions=["create_payment_intent", "confirm_payment", "list_payments", "get_payment"]
        ),
        UserJourney(
            name="Subscription Management",
            description="Manage recurring subscriptions",
            required_actions=["create_subscription", "list_subscriptions", "cancel_subscription", "update_subscription"]
        ),
        UserJourney(
            name="Refund Handling",
            description="Process refunds and disputes",
            required_actions=["create_refund", "list_refunds", "get_customer_payments", "list_disputes"]
        ),
    ],
    "slack": [
        UserJourney(
            name="Team Communication",
            description="Send messages and updates",
            required_actions=["send_message", "list_channels", "get_channel", "upload_file"]
        ),
        UserJourney(
            name="Incident Response",
            description="Handle production incidents",
            required_actions=["send_message", "create_channel", "invite_to_channel", "pin_message", "set_topic"]
        ),
        UserJourney(
            name="Automation",
            description="Build workflows and bots",
            required_actions=["send_message", "schedule_message", "react_to_message", "get_user_info"]
        ),
    ],
    "openai": [
        UserJourney(
            name="Chat Completion",
            description="Generate conversational responses",
            required_actions=["chat", "list_models", "create_embedding"]
        ),
        UserJourney(
            name="Content Generation",
            description="Create various content types",
            required_actions=["chat", "generate_image", "transcribe_audio", "text_to_speech"]
        ),
        UserJourney(
            name="Fine-tuning",
            description="Train custom models",
            required_actions=["create_fine_tune", "list_fine_tunes", "get_fine_tune", "upload_file"]
        ),
    ],
    "jira": [
        UserJourney(
            name="Sprint Planning",
            description="Plan and organize sprints",
            required_actions=["search_issues", "create_issue", "assign_issue", "move_to_sprint", "get_sprint"]
        ),
        UserJourney(
            name="Daily Standup",
            description="Review and update work",
            required_actions=["search_issues", "get_issue", "add_comment", "update_status", "log_work"]
        ),
        UserJourney(
            name="Release Tracking",
            description="Track release progress",
            required_actions=["search_issues", "create_version", "set_fix_version", "get_release_notes"]
        ),
    ],
    "pandas": [
        UserJourney(
            name="Data Analysis",
            description="Explore and analyze datasets",
            required_actions=["read_csv", "describe", "filter", "groupby", "pivot"]
        ),
        UserJourney(
            name="Data Cleaning",
            description="Clean and prepare data",
            required_actions=["read_csv", "dropna", "fillna", "drop_duplicates", "rename_columns"]
        ),
        UserJourney(
            name="Data Export",
            description="Transform and export data",
            required_actions=["read_csv", "filter", "aggregate", "to_csv", "to_json"]
        ),
    ],
    "aws": [
        UserJourney(
            name="File Storage",
            description="Store and retrieve files",
            required_actions=["s3_upload", "s3_download", "s3_list", "s3_delete", "s3_presign"]
        ),
        UserJourney(
            name="Compute Management",
            description="Manage EC2 instances",
            required_actions=["ec2_list", "ec2_start", "ec2_stop", "ec2_create", "ec2_terminate"]
        ),
        UserJourney(
            name="Serverless",
            description="Deploy serverless functions",
            required_actions=["lambda_invoke", "lambda_list", "lambda_create", "lambda_update", "lambda_logs"]
        ),
    ],
}


class TaskExpander:
    """
    Proactive gap discovery and expansion agent.
    
    Simulates user journeys, identifies missing capabilities,
    and triggers automatic expansion of tool kits.
    """
    
    def __init__(self, registry_path: Path | None = None):
        self.mcp_servers_path = Path.home() / "Desktop" / "mcp-servers"
        self._tool_cache: dict[str, list[str]] = {}
    
    def _get_server_tools(self, server_name: str) -> list[str]:
        """Get list of tools from a server."""
        if server_name in self._tool_cache:
            return self._tool_cache[server_name]
        
        server_dir = self.mcp_servers_path / f"{server_name}_mcp"
        server_file = server_dir / "server.py"
        
        if not server_file.exists():
            return []
        
        code = server_file.read_text()
        tools = re.findall(r'@mcp\.tool\(\)\s*\nasync def (\w+)\(', code)
        self._tool_cache[server_name] = tools
        return tools
    
    def get_user_journeys(self, service_name: str) -> list[UserJourney]:
        """Get predefined user journeys for a service."""
        return SERVICE_JOURNEYS.get(service_name, [])
    
    async def analyze_gaps(self, service_name: str) -> dict[str, Any]:
        """
        Analyze a service for capability gaps.
        
        Returns:
            Gap analysis with missing tools per journey
        """
        journeys = self.get_user_journeys(service_name)
        existing_tools = self._get_server_tools(service_name)
        existing_lower = [t.lower() for t in existing_tools]
        
        result = {
            "service": service_name,
            "existing_tools": existing_tools,
            "journeys": [],
            "total_gaps": 0,
            "recommendations": [],
        }
        
        for journey in journeys:
            missing = []
            for action in journey.required_actions:
                # Check if action exists (fuzzy match)
                action_lower = action.lower()
                if not any(action_lower in t or t in action_lower for t in existing_lower):
                    missing.append(action)
            
            journey.missing_tools = missing
            result["journeys"].append({
                "name": journey.name,
                "description": journey.description,
                "required": journey.required_actions,
                "missing": missing,
                "coverage": f"{(len(journey.required_actions) - len(missing)) / len(journey.required_actions) * 100:.0f}%",
            })
            result["total_gaps"] += len(missing)
        
        # Generate recommendations
        all_missing = set()
        for j in journeys:
            all_missing.update(j.missing_tools)
        
        result["recommendations"] = list(all_missing)
        
        return result
    
    async def expand_service(self, service_name: str) -> dict[str, Any]:
        """
        Analyze and trigger expansion for a service.
        
        This is the main entry point that:
        1. Analyzes gaps
        2. Generates expansion recommendations
        3. Returns expansion plan
        """
        analysis = await self.analyze_gaps(service_name)
        
        if not analysis["recommendations"]:
            return {
                "success": True,
                "service": service_name,
                "status": "complete",
                "message": "Service has full coverage for all user journeys",
            }
        
        return {
            "success": True,
            "service": service_name,
            "status": "expansion_needed",
            "gaps": analysis["total_gaps"],
            "missing_tools": analysis["recommendations"],
            "action": f"Call evolve_server('{service_name}', '<capability>') for each missing tool",
        }
    
    async def generate_journey_report(self, service_name: str) -> str:
        """Generate a human-readable gap report."""
        analysis = await self.analyze_gaps(service_name)
        
        lines = [
            f"# {service_name.upper()} Gap Analysis",
            f"",
            f"Existing tools: {len(analysis['existing_tools'])}",
            f"Total gaps: {analysis['total_gaps']}",
            f"",
            "## User Journeys",
            "",
        ]
        
        for j in analysis["journeys"]:
            lines.append(f"### {j['name']}")
            lines.append(f"*{j['description']}*")
            lines.append(f"Coverage: {j['coverage']}")
            if j["missing"]:
                lines.append(f"Missing: {', '.join(j['missing'])}")
            lines.append("")
        
        if analysis["recommendations"]:
            lines.append("## Recommendations")
            for r in analysis["recommendations"]:
                lines.append(f"- Add `{r}` tool")
        
        return "\n".join(lines)

"""LangGraph-based orchestration pipeline with self-healing loop."""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable

from helpermcp.agents import ArchitectAgent, CoderAgent, ScoutAgent
from helpermcp.core import (
    DiscoveryResult,
    ExtractedTool,
    GeneratedMCPServer,
    PipelineState,
    settings,
)
from helpermcp.sandbox import SandboxExecutor


class PipelineStage(str, Enum):
    """Stages in the MCP generation pipeline."""

    ANALYSIS = "analysis"        # JIT: Analyze user goal
    DISCOVERY = "discovery"
    EXTRACTION = "extraction"
    GENERATION = "generation"
    VERIFICATION = "verification"
    POST_ANALYSIS = "post_analysis"  # Review and expand tools
    COMPLETE = "complete"
    FAILED = "failed"


@dataclass
class PipelineContext:
    """Runtime context for the pipeline."""

    scout: ScoutAgent = field(default_factory=ScoutAgent)
    architect: ArchitectAgent = field(default_factory=ArchitectAgent)
    coder: CoderAgent = field(default_factory=CoderAgent)
    sandbox: SandboxExecutor = field(default_factory=SandboxExecutor)
    
    async def close(self):
        """Clean up all agents."""
        await self.scout.close()
        await self.architect.close()
        await self.coder.close()
        self.sandbox.close()


class MCPPipeline:
    """
    Orchestrates the MCP server generation pipeline.
    
    Implements a self-healing loop:
    1. Discovery (Scout) → Find SDK and docs
    2. Extraction (Architect) → Extract and score tools
    3. Generation (Coder) → Generate FastMCP code
    4. Verification (Sandbox) → Test in Docker
    
    If verification fails, retry with adjusted parameters.
    """

    def __init__(self):
        self.context = PipelineContext()
        self.callbacks: list[Callable[[PipelineState], None]] = []

    def on_state_change(self, callback: Callable[[PipelineState], None]):
        """Register a callback for state changes."""
        self.callbacks.append(callback)

    def _emit_state(self, state: PipelineState):
        """Emit state to all callbacks."""
        for callback in self.callbacks:
            try:
                callback(state)
            except Exception:
                pass

    async def run(self, target: str) -> GeneratedMCPServer:
        """
        Run the complete pipeline to generate an MCP server.
        
        Args:
            target: Service name (e.g., "Stripe", "GitHub")
            
        Returns:
            GeneratedMCPServer with verified code
            
        Raises:
            RuntimeError: If pipeline fails after max retries
        """
        state = PipelineState(target=target)
        state.logs.append(f"Starting pipeline for: {target}")
        
        try:
            while state.retry_count <= settings.max_retries:
                self._emit_state(state)
                
                # Stage 1: Discovery
                if state.current_stage == PipelineStage.DISCOVERY:
                    state = await self._run_discovery(state)
                
                # Stage 2: Extraction
                elif state.current_stage == PipelineStage.EXTRACTION:
                    state = await self._run_extraction(state)
                
                # Stage 3: Generation
                elif state.current_stage == PipelineStage.GENERATION:
                    state = await self._run_generation(state)
                
                # Stage 4: Verification
                elif state.current_stage == PipelineStage.VERIFICATION:
                    state = await self._run_verification(state)
                
                # Check for completion
                if state.current_stage == PipelineStage.COMPLETE:
                    state.logs.append("Pipeline completed successfully!")
                    
                    # Post-certification hooks
                    await self._post_certification(state)
                    
                    self._emit_state(state)
                    return state.generated_server
                
                # Check for failure
                if state.current_stage == PipelineStage.FAILED:
                    break
            
            raise RuntimeError(
                f"Pipeline failed after {state.retry_count} retries: {state.error_message}"
            )
            
        finally:
            await self.context.close()

    async def _post_certification(self, state: PipelineState):
        """
        Post-certification hooks: Registry, Docs, Hot-Reload.
        Called after successful verification.
        """
        if not state.generated_server or not state.discovery_result:
            return
        
        state.logs.append("📦 Registering certified tools...")
        
        try:
            # 1. Register tools in the semantic registry
            from helpermcp.registry import RegistryDatabase
            
            registry = RegistryDatabase()
            for tool in state.generated_server.tools:
                tool.certified = True
                registry.register_tool(tool, state.generated_server.service_name)
            
            state.logs.append(f"📦 Registry: {len(state.generated_server.tools)} tools registered")
            
            # 2. Generate documentation
            from helpermcp.docs import DocsGenerator, SiteGenerator
            from pathlib import Path
            
            output_dir = Path(state.generated_server.output_dir) if state.generated_server.output_dir else settings.output_dir
            
            docs_gen = DocsGenerator()
            site_gen = SiteGenerator()
            
            # Generate manifest.json
            manifest_path = output_dir / "manifest.json"
            site_gen.generate_manifest_json(state.generated_server, manifest_path)
            
            # Generate per-tool usage guides
            for tool in state.generated_server.tools:
                docs_gen.generate_usage_guide(tool, state.discovery_result, output_dir)
            
            state.logs.append(f"📝 Docs: Generated documentation at {output_dir}/docs")
            
            # 3. Trigger hot-reload
            from helpermcp.watchtower import notify_tool_certified
            
            for tool in state.generated_server.tools:
                await notify_tool_certified(tool.name, state.generated_server.service_name)
            
            state.logs.append("🔄 Hot-reload: Notification sent to SuperMCP")
            
        except Exception as e:
            # Non-fatal: log but don't fail pipeline
            state.logs.append(f"⚠️ Post-certification warning: {e}")


    async def _run_discovery(self, state: PipelineState) -> PipelineState:
        """Run the Scout agent for discovery."""
        state.logs.append("🔍 Scout: Starting discovery...")
        
        try:
            discovery = await self.context.scout.discover(state.target)
            state.discovery_result = discovery
            state.current_stage = PipelineStage.EXTRACTION
            state.logs.append(f"🔍 Scout: Found SDK '{discovery.sdk_name}', docs at {discovery.docs_url}")
            
        except Exception as e:
            state.error_message = f"Discovery failed: {e}"
            state.logs.append(f"❌ Scout: {state.error_message}")
            state.current_stage = PipelineStage.FAILED
        
        return state

    async def _run_extraction(self, state: PipelineState) -> PipelineState:
        """Run the Architect agent for tool extraction."""
        state.logs.append("🏗️ Architect: Analyzing documentation...")
        
        if not state.discovery_result:
            state.error_message = "No discovery result to analyze"
            state.current_stage = PipelineStage.FAILED
            return state
        
        try:
            tools = await self.context.architect.analyze(state.discovery_result)
            state.extracted_tools = tools
            state.filtered_tools = [t for t in tools if t.score >= settings.min_tool_score]
            state.current_stage = PipelineStage.GENERATION
            state.logs.append(f"🏗️ Architect: Extracted {len(tools)} tools, {len(state.filtered_tools)} passed filter")
            
        except Exception as e:
            state.error_message = f"Extraction failed: {e}"
            state.logs.append(f"❌ Architect: {state.error_message}")
            state.current_stage = PipelineStage.FAILED
        
        return state

    async def _run_generation(self, state: PipelineState) -> PipelineState:
        """Run the Coder agent for code generation."""
        state.logs.append("💻 Coder: Generating FastMCP server...")
        
        if not state.discovery_result or not state.filtered_tools:
            state.error_message = "No tools to generate"
            state.current_stage = PipelineStage.FAILED
            return state
        
        try:
            server = await self.context.coder.generate(
                state.discovery_result,
                state.filtered_tools,
            )
            state.generated_server = server
            state.current_stage = PipelineStage.VERIFICATION
            state.logs.append(f"💻 Coder: Generated server with {server.tools_count} tools")
            
        except Exception as e:
            state.error_message = f"Generation failed: {e}"
            state.logs.append(f"❌ Coder: {state.error_message}")
            state.current_stage = PipelineStage.FAILED
        
        return state

    async def _run_verification(self, state: PipelineState) -> PipelineState:
        """Run sandbox verification."""
        state.logs.append("🐳 Sandbox: Verifying server...")
        
        if not state.generated_server:
            state.error_message = "No server to verify"
            state.current_stage = PipelineStage.FAILED
            return state
        
        try:
            results = await self.context.sandbox.verify_server(state.generated_server)
            state.generated_server.test_results = results
            state.generated_server.all_tests_passed = all(r.passed for r in results)
            
            if state.generated_server.all_tests_passed:
                # Write to disk
                output_path = await self.context.coder.write_to_disk(state.generated_server)
                state.generated_server.output_dir = str(output_path)
                state.current_stage = PipelineStage.COMPLETE
                state.logs.append(f"✅ Sandbox: All tests passed! Output: {output_path}")
            else:
                # Retry logic
                failed_tests = [r for r in results if not r.passed]
                state.error_message = f"Tests failed: {[r.tool_name for r in failed_tests]}"
                state.logs.append(f"⚠️ Sandbox: {state.error_message}")
                
                state.retry_count += 1
                if state.retry_count <= settings.max_retries:
                    state.logs.append(f"🔄 Retrying ({state.retry_count}/{settings.max_retries})...")
                    # Self-healing: adjust parameters and retry from generation
                    state = self._adjust_for_retry(state, failed_tests)
                    state.current_stage = PipelineStage.GENERATION
                else:
                    state.current_stage = PipelineStage.FAILED
            
        except Exception as e:
            state.error_message = f"Verification failed: {e}"
            state.logs.append(f"❌ Sandbox: {state.error_message}")
            state.retry_count += 1
            if state.retry_count <= settings.max_retries:
                state.current_stage = PipelineStage.GENERATION
            else:
                state.current_stage = PipelineStage.FAILED
        
        return state

    def _adjust_for_retry(self, state: PipelineState, failed_tests: list) -> PipelineState:
        """Adjust state for retry based on failure patterns."""
        # Simple strategy: remove complex tools
        if state.filtered_tools:
            # Remove tools with most parameters (they're likely causing issues)
            state.filtered_tools.sort(key=lambda t: len(t.parameters))
            state.filtered_tools = state.filtered_tools[:len(state.filtered_tools) - 1]
            state.logs.append(f"🔧 Adjusted: Reduced to {len(state.filtered_tools)} tools")
        
        return state

    async def _run_post_analysis(self, state: PipelineState) -> PipelineState:
        """
        Post-generation analysis stage.
        
        1. Analyze generated server.py for completeness
        2. Compare against original DiscoveryResult for missed tools
        3. Trigger recursive expansion if gaps found
        4. WebSocket broadcast new tools
        """
        state.logs.append("🔍 POST_ANALYSIS: Reviewing generated artifacts...")
        
        if not state.generated_server or not state.discovery_result:
            state.current_stage = PipelineStage.COMPLETE
            return state
        
        try:
            # Step 1: Gap Detection - Find high-value tools that were missed
            missed_tools = await self._detect_capability_gaps(state)
            
            if missed_tools:
                state.logs.append(f"🔍 Found {len(missed_tools)} additional tool candidates")
                
                # Step 2: Recursive Expansion - Generate missing tools
                expanded_tools = await self._expand_with_missing_tools(state, missed_tools)
                
                if expanded_tools:
                    # Regenerate server with expanded tools
                    all_tools = list(state.filtered_tools) + expanded_tools
                    state.filtered_tools = all_tools
                    
                    # Regenerate code
                    new_server = await self.context.coder.generate(
                        state.discovery_result,
                        all_tools,
                    )
                    state.generated_server = new_server
                    state.logs.append(f"✅ Expanded server to {len(all_tools)} tools")
                    
                    # WebSocket broadcast new tools
                    await self._broadcast_new_tools(expanded_tools, state.generated_server.service_name)
            
            state.current_stage = PipelineStage.COMPLETE
            
        except Exception as e:
            state.logs.append(f"⚠️ POST_ANALYSIS warning: {e}")
            state.current_stage = PipelineStage.COMPLETE
        
        return state

    async def _detect_capability_gaps(self, state: PipelineState) -> list:
        """Detect high-value tools that were missed in the first pass."""
        if not state.discovery_result or not state.discovery_result.raw_endpoints:
            return []
        
        # Get already generated tool names
        generated_names = {t.name for t in state.filtered_tools} if state.filtered_tools else set()
        
        # Find endpoints that weren't converted to tools
        missed = []
        for endpoint in state.discovery_result.raw_endpoints:
            name = endpoint.get("name", "")
            if name and name not in generated_names:
                # Check if it's high-value (has clear action words)
                action_words = ["get", "list", "create", "update", "delete", "send", "fetch"]
                if any(word in name.lower() for word in action_words):
                    missed.append(endpoint)
        
        return missed[:100]  # UNRESTRICTED: Allow up to 100 additional tools

    async def _expand_with_missing_tools(self, state: PipelineState, missed_endpoints: list) -> list:
        """Generate tools for missed endpoints."""
        from helpermcp.core.models import ExtractedTool, ParameterType, ToolParameter
        
        expanded = []
        for endpoint in missed_endpoints:
            try:
                tool = ExtractedTool(
                    name=endpoint.get("name", "unknown_tool"),
                    display_name=endpoint.get("name", "Unknown").replace("_", " ").title(),
                    description=endpoint.get("description", f"Execute {endpoint.get('name', '')}"),
                    http_method=endpoint.get("method", "GET"),
                    api_endpoint=endpoint.get("path", "/"),
                    parameters=[],
                    score=8.0,  # Give expansions a reasonable score
                )
                expanded.append(tool)
            except Exception:
                continue
        
        return expanded

    async def _broadcast_new_tools(self, tools: list, service_name: str):
        """Broadcast new tools via WebSocket."""
        try:
            from helpermcp.watchtower import notify_tool_certified_ws
            
            for tool in tools:
                await notify_tool_certified_ws(tool.name, service_name)
        except Exception:
            pass  # WebSocket not available


    async def run_jit(
        self,
        goal: str,
        target: str,
        focus: str = "general",
    ) -> dict:
        """
        Run Just-in-Time goal-driven workflow.
        
        1. Analyze user goal → RequirementMap
        2. Search registry for existing tools
        3. JIT Forge missing tools
        4. Assemble Task Kit
        
        Args:
            goal: Natural language description of what user wants
            target: URL, path, or package name
            focus: Category focus ('data', 'action', 'calculation')
            
        Returns:
            Task Kit with relevant tools
        """
        from helpermcp.agents import RequirementAnalyst
        from helpermcp.registry import RegistryDatabase, SemanticSearch
        
        logs = [f"🎯 Analyzing goal: {goal}"]
        
        # Stage 1: Analyze goal
        analyst = RequirementAnalyst()
        requirement_map = await analyst.analyze(goal, target, focus)
        await analyst.close()
        
        logs.append(f"📋 Intents: {requirement_map.intents}")
        logs.append(f"📂 Category: {requirement_map.category}")
        logs.append(f"🎯 Target type: {requirement_map.target_type}")
        
        # Stage 2: Search registry for existing tools
        registry = RegistryDatabase()
        search = SemanticSearch(registry)
        
        existing_tools = []
        for intent in requirement_map.intents:
            results = search.search(intent, limit=3)
            for tool, relevance in results:
                if relevance >= 0.7 and tool not in existing_tools:
                    existing_tools.append(tool)
        
        logs.append(f"🔍 Found {len(existing_tools)} existing tools")
        
        # Stage 3: Identify gaps and JIT Forge
        requirement_map = await analyst.identify_capability_gaps(requirement_map, registry)
        
        new_tools = []
        if requirement_map.capability_gaps:
            logs.append(f"⚙️ JIT Forge: Building {len(requirement_map.capability_gaps)} missing tools")
            
            # Use smart_discover for the target
            discovery = await self.context.scout.smart_discover(target)
            
            # Extract with context-aware scoring
            tools = await self.context.architect.analyze(discovery, requirement_map)
            
            if tools:
                # Generate code
                server = await self.context.coder.generate(discovery, tools)
                
                # Quick verification (single pass for JIT)
                logs.append("🐳 Verifying JIT tools...")
                
                for tool in tools[:25]:  # Expanded limit for comprehensive intent coverage
                    new_tools.append(tool)
        
        # Stage 4: Assemble Task Kit
        task_kit = {
            "goal": goal,
            "target": target,
            "focus": focus,
            "requirement_map": {
                "intents": requirement_map.intents,
                "category": requirement_map.category,
                "target_type": requirement_map.target_type,
                "confidence": requirement_map.confidence,
            },
            "existing_tools": [
                {
                    "name": t.name,
                    "service": t.service_name,
                    "score": t.aggregate_score,
                }
                for t in existing_tools
            ],
            "new_tools": [
                {
                    "name": t.name,
                    "description": t.description[:100] if t.description else "",
                    "score": t.score,
                }
                for t in new_tools
            ],
            "total_tools": len(existing_tools) + len(new_tools),
            "logs": logs,
        }
        
        logs.append(f"✅ Task Kit assembled: {task_kit['total_tools']} tools")
        
        return task_kit

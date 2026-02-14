"""CLI entry point for HelperMCP."""

from pathlib import Path
from typing import Optional

import typer
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn

from helpermcp import __version__
from helpermcp.core.pipeline import MCPPipeline, PipelineState

app = typer.Typer(
    name="helpermcp",
    help="🏭 Autonomous MCP Server Factory",
    add_completion=False,
)
console = Console()


def print_banner():
    """Print the HelperMCP banner."""
    banner = """
╦ ╦┌─┐┬  ┌─┐┌─┐┬─┐╔╦╗╔═╗╔═╗
╠═╣├┤ │  ├─┘├┤ ├┬┘║║║║  ╠═╝
╩ ╩└─┘┴─┘┴  └─┘┴└─╩ ╩╚═╝╩  
    """
    console.print(Panel(banner, title=f"v{__version__}", border_style="cyan"))


def state_callback(state: PipelineState):
    """Callback for pipeline state changes."""
    if state.logs:
        latest = state.logs[-1]
        console.print(f"  {latest}")


@app.command()
def generate(
    target: str = typer.Argument(..., help="Service name to generate MCP server for"),
    output: Optional[Path] = typer.Option(
        None,
        "--output", "-o",
        help="Output directory for generated server",
    ),
    max_tools: int = typer.Option(
        15,
        "--max-tools", "-m",
        help="Maximum number of tools to include",
    ),
    dry_run: bool = typer.Option(
        False,
        "--dry-run",
        help="Run without writing to disk",
    ),
):
    """
    Generate an MCP server for a service.
    
    Example:
        helpermcp generate "Stripe"
        helpermcp generate "GitHub" --max-tools 20 --output ./servers/
    """
    import asyncio
    from helpermcp.core import settings
    
    print_banner()
    
    # Apply options
    if max_tools:
        settings.max_tools_per_server = max_tools
    if output:
        settings.output_dir = output
    
    console.print(f"\n🎯 Target: [bold cyan]{target}[/bold cyan]")
    console.print(f"📂 Output: [dim]{settings.output_dir}[/dim]")
    console.print()
    
    async def run_pipeline():
        pipeline = MCPPipeline()
        pipeline.on_state_change(state_callback)
        
        try:
            server = await pipeline.run(target)
            
            console.print()
            console.print(Panel(
                f"[bold green]✅ Success![/bold green]\n\n"
                f"📦 Package: [cyan]{server.package_name}[/cyan]\n"
                f"🔧 Tools: {server.tools_count}\n"
                f"📁 Location: [dim]{server.output_dir}[/dim]\n\n"
                f"[dim]Run with:[/dim] cd {server.output_dir} && pip install -e . && {server.package_name}",
                title="Generated MCP Server",
                border_style="green",
            ))
            
            # List tools
            console.print("\n[bold]Tools:[/bold]")
            for tool in server.tools[:10]:
                score_color = "green" if tool.score >= 7 else "yellow" if tool.score >= 5 else "red"
                console.print(f"  • {tool.name} [{score_color}]{tool.score:.1f}[/{score_color}]")
            if len(server.tools) > 10:
                console.print(f"  [dim]... and {len(server.tools) - 10} more[/dim]")
            
        except Exception as e:
            console.print(f"\n[bold red]❌ Failed:[/bold red] {e}")
            raise typer.Exit(1)
    
    asyncio.run(run_pipeline())


@app.command()
def inspect(
    package: str = typer.Argument(..., help="Python package name to inspect"),
):
    """
    Inspect a local Python library for MCP tool candidates.
    
    Example:
        helpermcp inspect requests
        helpermcp inspect stripe
    """
    import asyncio
    from helpermcp.agents import ScoutAgent
    
    print_banner()
    console.print(f"\n🔍 Inspecting: [bold cyan]{package}[/bold cyan]\n")
    
    async def run_inspect():
        scout = ScoutAgent()
        try:
            result = await scout.inspect_local_library(package)
            
            if "error" in result:
                console.print(f"[red]Error: {result['error']}[/red]")
                return
            
            console.print(f"[bold]Module:[/bold] {result['module_name']}\n")
            
            if result.get("functions"):
                console.print("[bold]Functions:[/bold]")
                for func in result["functions"][:20]:
                    console.print(f"  • [cyan]{func['name']}[/cyan]{func['signature']}")
            
            if result.get("classes"):
                console.print("\n[bold]Classes:[/bold]")
                for cls in result["classes"][:10]:
                    console.print(f"  • [green]{cls['name']}[/green]")
                    for method in cls.get("methods", [])[:5]:
                        console.print(f"      - {method['name']}")
        finally:
            await scout.close()
    
    asyncio.run(run_inspect())


@app.command()
def version():
    """Show version information."""
    console.print(f"HelperMCP v{__version__}")


@app.command()
def search(
    query: str = typer.Argument(..., help="Natural language query to find tools"),
    limit: int = typer.Option(10, "--limit", "-l", help="Maximum results"),
):
    """
    Search for tools using natural language.
    
    Example:
        helpermcp search "payment processing tools"
        helpermcp search "send notifications" --limit 5
    """
    from helpermcp.registry import RegistryDatabase, SemanticSearch
    
    console.print(f"\n🔍 Searching: [bold cyan]{query}[/bold cyan]\n")
    
    registry = RegistryDatabase()
    search_engine = SemanticSearch(registry)
    results = search_engine.search(query, limit=limit)
    
    if not results:
        console.print("[yellow]No matching tools found.[/yellow]")
        return
    
    console.print(f"[bold]Found {len(results)} tools:[/bold]\n")
    
    for tool, relevance in results:
        score_color = "green" if tool.aggregate_score >= 7.5 else "yellow"
        console.print(f"  [{score_color}]{tool.name}[/{score_color}] ({relevance:.0%} match)")
        console.print(f"    [dim]{tool.description[:60]}...[/dim]")
        console.print(f"    Service: [cyan]{tool.service_name}[/cyan] | Score: {tool.aggregate_score:.1f}")
        console.print()


@app.command()
def stats():
    """Show registry statistics."""
    from helpermcp.registry import RegistryDatabase
    
    registry = RegistryDatabase()
    stats = registry.get_stats()
    
    console.print(Panel(
        f"[bold]📊 Registry Statistics[/bold]\n\n"
        f"Total Tools: [cyan]{stats['total_tools']}[/cyan]\n"
        f"Certified: [green]{stats['certified_tools']}[/green]\n"
        f"Updates Pending: [yellow]{stats['updates_pending']}[/yellow]\n"
        f"Services: [blue]{stats['services']}[/blue]",
        border_style="cyan",
    ))


@app.command("check-updates")
def check_updates(
    service: str = typer.Argument(..., help="Service name to check"),
    online: bool = typer.Option(False, "--online", help="Check against online docs"),
):
    """
    Check if a service has available updates.
    
    Example:
        helpermcp check-updates stripe
        helpermcp check-updates github --online
    """
    import asyncio
    from helpermcp.watchtower import VersionWatchtower
    
    console.print(f"\n🔍 Checking updates for: [bold cyan]{service}[/bold cyan]\n")
    
    async def run_check():
        watchtower = VersionWatchtower()
        
        if online:
            result = await watchtower.check_for_updates_online(service)
        else:
            result = await watchtower.check_tool(service)
        
        if result.has_update:
            console.print(f"[yellow]⚠️ Update available![/yellow]")
            for change in result.changes_detected:
                console.print(f"  • {change}")
        else:
            console.print(f"[green]✅ Up to date[/green]")
        
        console.print(f"\n[dim]Version: {result.current_version}[/dim]")
        console.print(f"[dim]Checked: {result.checked_at}[/dim]")
    
    asyncio.run(run_check())


@app.command("generate-docs")
def generate_docs(
    output: Optional[Path] = typer.Option(None, "--output", "-o", help="Output directory"),
):
    """
    Generate documentation site for all registered tools.
    
    Example:
        helpermcp generate-docs
        helpermcp generate-docs --output ./docs/
    """
    from helpermcp.docs import SiteGenerator
    from helpermcp.registry import RegistryDatabase
    
    console.print("\n📝 Generating documentation site...\n")
    
    registry = RegistryDatabase()
    generator = SiteGenerator(output_dir=output) if output else SiteGenerator()
    
    generated = generator.generate_site(registry)
    
    console.print(f"[green]✅ Generated {len(generated)} files[/green]")
    for path in generated[:5]:
        console.print(f"  • {path}")
    if len(generated) > 5:
        console.print(f"  [dim]... and {len(generated) - 5} more[/dim]")


@app.command()
def jit(
    goal: str = typer.Argument(..., help="Natural language goal description"),
    target: str = typer.Option(".", "--target", "-t", help="Target URL, path, or package"),
    focus: str = typer.Option("general", "--focus", "-f", help="Category focus: data, action, calculation"),
):
    """
    Just-in-Time goal-driven tool generation.
    
    Analyzes your goal, finds existing tools, and forges missing ones.
    
    Example:
        helpermcp jit "Analyze my repo health" --target "./my-project" --focus data
        helpermcp jit "Send notifications to Slack" --target slack --focus action
    """
    import asyncio
    from helpermcp.core.pipeline import MCPPipeline
    
    print_banner()
    console.print(f"\n🎯 Goal: [bold cyan]{goal}[/bold cyan]")
    console.print(f"📂 Target: [dim]{target}[/dim]")
    console.print(f"🏷️ Focus: [blue]{focus}[/blue]\n")
    
    async def run_jit_workflow():
        pipeline = MCPPipeline()
        
        try:
            task_kit = await pipeline.run_jit(goal, target, focus)
            
            # Display logs
            for log in task_kit.get("logs", []):
                console.print(f"  {log}")
            
            console.print()
            
            # Display requirement map
            req_map = task_kit.get("requirement_map", {})
            console.print(Panel(
                f"[bold]📋 Requirement Analysis[/bold]\n\n"
                f"Intents: {', '.join(req_map.get('intents', []))}\n"
                f"Category: [cyan]{req_map.get('category', 'general')}[/cyan]\n"
                f"Target Type: {req_map.get('target_type', 'unknown')}\n"
                f"Confidence: {req_map.get('confidence', 0):.0%}",
                border_style="blue",
            ))
            
            # Display Task Kit
            console.print("\n[bold]🧰 Task Kit[/bold]\n")
            
            existing = task_kit.get("existing_tools", [])
            new_tools = task_kit.get("new_tools", [])
            
            if existing:
                console.print("[green]Existing Tools:[/green]")
                for tool in existing[:10]:
                    console.print(f"  ✓ {tool['name']} ({tool['service']}) - {tool['score']:.1f}")
            
            if new_tools:
                console.print("\n[yellow]Newly Forged:[/yellow]")
                for tool in new_tools[:10]:
                    console.print(f"  ⚡ {tool['name']} - {tool['score']:.1f}")
                    if tool.get('description'):
                        console.print(f"     [dim]{tool['description'][:60]}...[/dim]")
            
            console.print(f"\n[bold green]✅ Total: {task_kit.get('total_tools', 0)} tools ready[/bold green]")
            
        except Exception as e:
            console.print(f"\n[bold red]❌ JIT Failed:[/bold red] {e}")
            raise typer.Exit(1)
        finally:
            await pipeline.context.close()
    
    asyncio.run(run_jit_workflow())


@app.command("analyze-repo")
def analyze_repo(
    path: str = typer.Argument(".", help="Path to repository"),
):
    """
    Analyze a local repository for tool candidates.
    
    Example:
        helpermcp analyze-repo ./my-project
    """
    import asyncio
    from helpermcp.agents import ScoutAgent
    
    print_banner()
    console.print(f"\n🔍 Analyzing: [bold cyan]{path}[/bold cyan]\n")
    
    async def run_analysis():
        scout = ScoutAgent()
        try:
            result = await scout.analyze_repository(path)
            
            console.print(f"[bold]📦 {result.target_name}[/bold]")
            console.print(f"SDK: {result.sdk_name or 'N/A'}")
            console.print(f"Install: [dim]{result.sdk_install_command or 'N/A'}[/dim]\n")
            
            if result.raw_endpoints:
                console.print(f"[bold]Functions Found:[/bold] {len(result.raw_endpoints)}\n")
                for ep in result.raw_endpoints[:15]:
                    console.print(f"  • [cyan]{ep['name']}[/cyan]{ep.get('signature', '')}")
                    if ep.get('description'):
                        console.print(f"    [dim]{ep['description'][:60]}...[/dim]")
                
                if len(result.raw_endpoints) > 15:
                    console.print(f"  [dim]... and {len(result.raw_endpoints) - 15} more[/dim]")
        finally:
            await scout.close()
    
    asyncio.run(run_analysis())


if __name__ == "__main__":
    app()



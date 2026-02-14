"""WebSocket Server - Real-time tool synchronization."""

import asyncio
import json
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Callable, Set

from helpermcp.core import settings


@dataclass
class ToolUpdate:
    """A tool update notification."""
    
    event: str  # "tool_added", "tool_updated", "tool_removed"
    tool_name: str
    service_name: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    data: dict = field(default_factory=dict)

    def to_json(self) -> str:
        return json.dumps({
            "event": self.event,
            "tool_name": self.tool_name,
            "service_name": self.service_name,
            "timestamp": self.timestamp,
            "data": self.data,
        })


class ToolSyncServer:
    """
    WebSocket server for real-time tool synchronization.
    
    Replaces SIGHUP notifications with a live stream so newly
    certified tools are instantly available to connected clients.
    """

    def __init__(self, host: str = "localhost", port: int = 8765):
        self.host = host
        self.port = port
        self._clients: Set = set()
        self._server = None
        self._running = False

    async def start(self):
        """Start the WebSocket server."""
        try:
            import websockets
        except ImportError:
            print("WebSocket support requires: pip install websockets")
            return
        
        self._running = True
        self._server = await websockets.serve(
            self._handle_client,
            self.host,
            self.port,
        )
        
        print(f"🔌 ToolSync WebSocket server running on ws://{self.host}:{self.port}")

    async def stop(self):
        """Stop the WebSocket server."""
        self._running = False
        
        # Close all client connections
        if self._clients:
            await asyncio.gather(*[
                client.close()
                for client in self._clients
            ], return_exceptions=True)
        
        if self._server:
            self._server.close()
            await self._server.wait_closed()

    async def _handle_client(self, websocket, path):
        """Handle a client connection."""
        self._clients.add(websocket)
        
        try:
            # Send initial tool list
            await self._send_initial_state(websocket)
            
            # Keep connection alive and handle messages
            async for message in websocket:
                await self._handle_message(websocket, message)
                
        except Exception as e:
            print(f"Client error: {e}")
        finally:
            self._clients.discard(websocket)

    async def _send_initial_state(self, websocket):
        """Send current tool state to new client."""
        from helpermcp.registry import RegistryDatabase
        
        registry = RegistryDatabase()
        stats = registry.get_stats()
        tools = registry.list_tools(certified_only=True)
        
        initial = {
            "event": "connected",
            "stats": stats,
            "tools": [
                {
                    "name": t.name,
                    "service": t.service_name,
                    "score": t.aggregate_score,
                }
                for t in tools[:50]  # Limit initial payload
            ],
        }
        
        await websocket.send(json.dumps(initial))

    async def _handle_message(self, websocket, message: str):
        """Handle incoming message from client."""
        try:
            data = json.loads(message)
            action = data.get("action")
            
            if action == "ping":
                await websocket.send(json.dumps({"event": "pong"}))
            
            elif action == "list_tools":
                service = data.get("service")
                await self._send_tools_list(websocket, service)
            
            elif action == "get_tool":
                tool_name = data.get("name")
                await self._send_tool_details(websocket, tool_name)
                
        except json.JSONDecodeError:
            pass

    async def _send_tools_list(self, websocket, service: str | None):
        """Send filtered tools list."""
        from helpermcp.registry import RegistryDatabase
        
        registry = RegistryDatabase()
        tools = registry.list_tools(service_name=service, certified_only=True)
        
        await websocket.send(json.dumps({
            "event": "tools_list",
            "tools": [
                {
                    "name": t.name,
                    "display_name": t.display_name,
                    "service": t.service_name,
                    "description": t.description[:100],
                    "score": t.aggregate_score,
                }
                for t in tools
            ],
        }))

    async def _send_tool_details(self, websocket, tool_name: str):
        """Send detailed tool information."""
        from helpermcp.registry import RegistryDatabase
        
        registry = RegistryDatabase()
        tool = registry.get_tool(tool_name)
        
        if tool:
            await websocket.send(json.dumps({
                "event": "tool_details",
                "tool": {
                    "name": tool.name,
                    "display_name": tool.display_name,
                    "service": tool.service_name,
                    "description": tool.description,
                    "intent": tool.intent,
                    "parameters": json.loads(tool.parameters_json),
                    "score": {
                        "llm_utility": tool.llm_utility,
                        "determinism": tool.determinism,
                        "token_efficiency": tool.token_efficiency,
                        "aggregate": tool.aggregate_score,
                    },
                    "certified": tool.certified,
                },
            }))
        else:
            await websocket.send(json.dumps({
                "event": "error",
                "message": f"Tool not found: {tool_name}",
            }))

    async def broadcast_new_tool(self, tool_name: str, service_name: str):
        """Broadcast new tool notification to all clients."""
        update = ToolUpdate(
            event="tool_added",
            tool_name=tool_name,
            service_name=service_name,
        )
        
        await self._broadcast(update.to_json())

    async def broadcast_tool_updated(self, tool_name: str, service_name: str):
        """Broadcast tool update notification."""
        update = ToolUpdate(
            event="tool_updated",
            tool_name=tool_name,
            service_name=service_name,
        )
        
        await self._broadcast(update.to_json())

    async def broadcast_tool_removed(self, tool_name: str, service_name: str):
        """Broadcast tool removal notification."""
        update = ToolUpdate(
            event="tool_removed",
            tool_name=tool_name,
            service_name=service_name,
        )
        
        await self._broadcast(update.to_json())

    async def _broadcast(self, message: str):
        """Broadcast message to all connected clients."""
        if not self._clients:
            return
        
        await asyncio.gather(*[
            client.send(message)
            for client in self._clients
        ], return_exceptions=True)


# Global server instance
_sync_server: ToolSyncServer | None = None


async def get_sync_server(start: bool = True) -> ToolSyncServer:
    """Get or create the global sync server."""
    global _sync_server
    
    if _sync_server is None:
        _sync_server = ToolSyncServer()
        if start:
            await _sync_server.start()
    
    return _sync_server


async def notify_tool_certified_ws(tool_name: str, service_name: str):
    """
    Notify via WebSocket when a tool is certified.
    
    This is called from the pipeline post-certification hook.
    """
    try:
        server = await get_sync_server(start=False)
        if server and server._clients:
            await server.broadcast_new_tool(tool_name, service_name)
    except Exception:
        pass  # WebSocket not available

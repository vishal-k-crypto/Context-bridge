"""Semantic Registry - SQLite database with vector embeddings for tool discovery."""

import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field

from helpermcp.core import ExtractedTool, ToolScore, settings


class ToolManifest(BaseModel):
    """Complete manifest for a registered tool."""

    name: str
    display_name: str
    description: str
    intent: str = ""
    service_name: str
    version: str = "1.0.0"
    
    # Scoring
    llm_utility: float = 0.0
    determinism: float = 0.0
    token_efficiency: float = 0.0
    aggregate_score: float = 0.0
    
    # Status
    certified: bool = False
    certification_date: datetime | None = None
    last_updated: datetime | None = None
    update_available: bool = False
    
    # Metadata
    parameters_json: str = "[]"
    source_url: str | None = None
    api_endpoint: str | None = None
    http_method: str | None = None
    
    # Code
    generated_code: str = ""
    
    # Embedding for vector search
    embedding: list[float] = Field(default_factory=list)
    
    # Failure history for troubleshooting
    failure_history: list[str] = Field(default_factory=list)
    
    # Performance Monitoring (Phase 5)
    call_count: int = 0
    success_count: int = 0
    total_execution_time: float = 0.0
    avg_execution_time: float = 0.0
    success_rate: float = 1.0


class RegistryDatabase:
    """
    SQLite-based registry for certified MCP tools.
    
    Features:
    - Store tool metadata and scores
    - Vector embeddings for semantic search
    - Version tracking for updates
    """

    def __init__(self, db_path: Path | None = None):
        self.db_path = db_path or settings.sqlite_path.parent / "registry.db"
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()
        self._embedder = None

    def _init_db(self):
        """Initialize the database schema."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS tools (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    display_name TEXT NOT NULL,
                    description TEXT,
                    intent TEXT,
                    service_name TEXT NOT NULL,
                    version TEXT DEFAULT '1.0.0',
                    
                    llm_utility REAL DEFAULT 0,
                    determinism REAL DEFAULT 0,
                    token_efficiency REAL DEFAULT 0,
                    aggregate_score REAL DEFAULT 0,
                    
                    certified INTEGER DEFAULT 0,
                    certification_date TEXT,
                    last_updated TEXT,
                    update_available INTEGER DEFAULT 0,
                    
                    parameters_json TEXT DEFAULT '[]',
                    source_url TEXT,
                    api_endpoint TEXT,
                    http_method TEXT,
                    
                    generated_code TEXT,
                    embedding_json TEXT,
                    failure_history_json TEXT DEFAULT '[]',
                    
                    call_count INTEGER DEFAULT 0,
                    success_count INTEGER DEFAULT 0,
                    total_execution_time REAL DEFAULT 0,
                    avg_execution_time REAL DEFAULT 0,
                    success_rate REAL DEFAULT 1.0,
                    
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_tools_service 
                ON tools(service_name)
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_tools_certified 
                ON tools(certified)
            """)
            
            conn.commit()

    def _get_embedder(self):
        """Lazy-load sentence transformer for embeddings."""
        if self._embedder is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._embedder = SentenceTransformer("all-MiniLM-L6-v2")
            except ImportError:
                # Fallback: no embeddings
                self._embedder = None
        return self._embedder

    def _generate_embedding(self, text: str) -> list[float]:
        """Generate embedding vector for text."""
        embedder = self._get_embedder()
        if embedder is None:
            return []
        
        embedding = embedder.encode(text, convert_to_numpy=True)
        return embedding.tolist()

    def register_tool(self, tool: ExtractedTool, service_name: str) -> int:
        """
        Register a certified tool in the registry.
        
        Returns:
            Tool ID in the registry
        """
        # Generate embedding from description + intent
        search_text = f"{tool.display_name} {tool.description} {tool.intent}"
        embedding = self._generate_embedding(search_text)
        
        # Extract scores
        llm_utility = 0.0
        determinism = 0.0
        token_efficiency = 0.0
        aggregate = 0.0
        
        if tool.detailed_score:
            llm_utility = tool.detailed_score.llm_utility
            determinism = tool.detailed_score.determinism
            token_efficiency = tool.detailed_score.token_efficiency
            aggregate = tool.detailed_score.aggregate
        
        # Serialize parameters
        params_json = json.dumps([
            {
                "name": p.name,
                "type": p.type.value if hasattr(p.type, 'value') else str(p.type),
                "description": p.description,
                "required": p.required,
                "examples": p.examples,
            }
            for p in tool.parameters
        ])
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                INSERT OR REPLACE INTO tools (
                    name, display_name, description, intent, service_name,
                    llm_utility, determinism, token_efficiency, aggregate_score,
                    certified, certification_date,
                    parameters_json, source_url, api_endpoint, http_method,
                    generated_code, embedding_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                tool.name,
                tool.display_name,
                tool.description,
                tool.intent,
                service_name,
                llm_utility,
                determinism,
                token_efficiency,
                aggregate,
                1 if tool.certified else 0,
                datetime.now().isoformat() if tool.certified else None,
                params_json,
                tool.source_url,
                tool.api_endpoint,
                tool.http_method,
                tool.generated_code or "",
                json.dumps(embedding),
            ))
            
            conn.commit()
            return cursor.lastrowid

    def get_tool(self, name: str) -> ToolManifest | None:
        """Get a tool by name."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute(
                "SELECT * FROM tools WHERE name = ?",
                (name,)
            )
            row = cursor.fetchone()
            
            if row is None:
                return None
            
            return self._row_to_manifest(row)

    def list_tools(
        self,
        service_name: str | None = None,
        certified_only: bool = True,
    ) -> list[ToolManifest]:
        """List tools in the registry."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            query = "SELECT * FROM tools WHERE 1=1"
            params = []
            
            if certified_only:
                query += " AND certified = 1"
            
            if service_name:
                query += " AND service_name = ?"
                params.append(service_name)
            
            query += " ORDER BY aggregate_score DESC"
            
            cursor = conn.execute(query, params)
            return [self._row_to_manifest(row) for row in cursor.fetchall()]

    def mark_update_available(self, name: str):
        """Mark a tool as having an available update."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "UPDATE tools SET update_available = 1 WHERE name = ?",
                (name,)
            )
            conn.commit()

    def add_failure(self, name: str, failure_message: str):
        """Add a failure to a tool's history."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute(
                "SELECT failure_history_json FROM tools WHERE name = ?",
                (name,)
            )
            row = cursor.fetchone()
            
            if row:
                history = json.loads(row["failure_history_json"] or "[]")
                history.append({
                    "timestamp": datetime.now().isoformat(),
                    "message": failure_message,
                })
                # Keep last 10 failures
                history = history[-10:]
                
                conn.execute(
                    "UPDATE tools SET failure_history_json = ? WHERE name = ?",
                    (json.dumps(history), name)
                )
                conn.commit()

    def record_execution(self, name: str, execution_time: float, success: bool):
        """Record a tool execution for performance monitoring."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute(
                "SELECT call_count, success_count, total_execution_time FROM tools WHERE name = ?",
                (name,)
            )
            row = cursor.fetchone()
            
            if row:
                call_count = (row["call_count"] or 0) + 1
                success_count = (row["success_count"] or 0) + (1 if success else 0)
                total_time = (row["total_execution_time"] or 0) + execution_time
                avg_time = total_time / call_count
                rate = success_count / call_count
                
                conn.execute("""
                    UPDATE tools SET 
                        call_count = ?,
                        success_count = ?,
                        total_execution_time = ?,
                        avg_execution_time = ?,
                        success_rate = ?
                    WHERE name = ?
                """, (call_count, success_count, total_time, avg_time, rate, name))
                conn.commit()

    def get_failing_tools(self, threshold: float = 0.9) -> list[ToolManifest]:
        """Get tools with success rate below threshold (for auto-heal)."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("""
                SELECT * FROM tools 
                WHERE success_rate < ? AND call_count >= 5
                ORDER BY success_rate ASC
            """, (threshold,))
            return [self._row_to_manifest(row) for row in cursor.fetchall()]

    def _row_to_manifest(self, row: sqlite3.Row) -> ToolManifest:
        """Convert a database row to ToolManifest."""
        return ToolManifest(
            name=row["name"],
            display_name=row["display_name"],
            description=row["description"] or "",
            intent=row["intent"] or "",
            service_name=row["service_name"],
            version=row["version"] or "1.0.0",
            llm_utility=row["llm_utility"] or 0,
            determinism=row["determinism"] or 0,
            token_efficiency=row["token_efficiency"] or 0,
            aggregate_score=row["aggregate_score"] or 0,
            certified=bool(row["certified"]),
            certification_date=datetime.fromisoformat(row["certification_date"]) if row["certification_date"] else None,
            last_updated=datetime.fromisoformat(row["last_updated"]) if row["last_updated"] else None,
            update_available=bool(row["update_available"]),
            parameters_json=row["parameters_json"] or "[]",
            source_url=row["source_url"],
            api_endpoint=row["api_endpoint"],
            http_method=row["http_method"],
            generated_code=row["generated_code"] or "",
            embedding=json.loads(row["embedding_json"]) if row["embedding_json"] else [],
            failure_history=json.loads(row["failure_history_json"]) if row["failure_history_json"] else [],
        )

    def get_stats(self) -> dict[str, Any]:
        """Get registry statistics."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT 
                    COUNT(*) as total,
                    SUM(certified) as certified,
                    SUM(update_available) as updates_pending,
                    COUNT(DISTINCT service_name) as services
                FROM tools
            """)
            row = cursor.fetchone()
            
            return {
                "total_tools": row[0] or 0,
                "certified_tools": row[1] or 0,
                "updates_pending": row[2] or 0,
                "services": row[3] or 0,
            }

    def close(self):
        """Close any resources."""
        pass  # SQLite connections are auto-closed

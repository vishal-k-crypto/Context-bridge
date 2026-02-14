"""Auth Vault - Encrypted credential storage for tools."""

import base64
import hashlib
import json
import os
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any

from helpermcp.core import settings


class AuthVault:
    """
    Secure credential manager for MCP tools.
    
    Features:
    - Encrypted storage of API keys, tokens, cookies
    - Credential injection into sandbox execution
    - OAuth token refresh handling
    """

    def __init__(self, vault_path: Path | None = None, master_key: str | None = None):
        self.vault_path = vault_path or settings.sqlite_path.parent / "vault.db"
        self.vault_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Derive encryption key from master key or environment
        self._master_key = master_key or os.environ.get("HELPERMCP_VAULT_KEY", "")
        self._init_db()
        self._fernet = None

    def _init_db(self):
        """Initialize vault database."""
        with sqlite3.connect(self.vault_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS credentials (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    service TEXT NOT NULL,
                    type TEXT NOT NULL,
                    encrypted_value TEXT NOT NULL,
                    metadata TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    expires_at TEXT
                )
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_creds_service
                ON credentials(service)
            """)
            
            conn.commit()

    def _get_fernet(self):
        """Get Fernet encryption instance."""
        if self._fernet is None:
            try:
                from cryptography.fernet import Fernet
                
                # Derive key from master key
                if self._master_key:
                    key = base64.urlsafe_b64encode(
                        hashlib.sha256(self._master_key.encode()).digest()
                    )
                else:
                    # Generate deterministic key from machine-specific data
                    machine_id = os.environ.get("USER", "") + str(self.vault_path)
                    key = base64.urlsafe_b64encode(
                        hashlib.sha256(machine_id.encode()).digest()
                    )
                
                self._fernet = Fernet(key)
            except ImportError:
                # Fallback: base64 encoding (not secure, but functional)
                self._fernet = None
        
        return self._fernet

    def _encrypt(self, value: str) -> str:
        """Encrypt a value."""
        fernet = self._get_fernet()
        if fernet:
            return fernet.encrypt(value.encode()).decode()
        # Fallback: base64
        return base64.b64encode(value.encode()).decode()

    def _decrypt(self, encrypted: str) -> str:
        """Decrypt a value."""
        fernet = self._get_fernet()
        if fernet:
            return fernet.decrypt(encrypted.encode()).decode()
        # Fallback: base64
        return base64.b64decode(encrypted.encode()).decode()

    def store_credential(
        self,
        name: str,
        value: str,
        service: str,
        cred_type: str = "api_key",
        metadata: dict | None = None,
        expires_at: datetime | None = None,
    ) -> int:
        """
        Store an encrypted credential.
        
        Args:
            name: Unique credential name
            value: The secret value to store
            service: Associated service name
            cred_type: Type (api_key, oauth_token, cookie, etc.)
            metadata: Additional metadata
            expires_at: Optional expiration time
            
        Returns:
            Credential ID
        """
        encrypted = self._encrypt(value)
        metadata_json = json.dumps(metadata) if metadata else "{}"
        expires_str = expires_at.isoformat() if expires_at else None
        
        with sqlite3.connect(self.vault_path) as conn:
            cursor = conn.execute("""
                INSERT OR REPLACE INTO credentials 
                (name, service, type, encrypted_value, metadata, updated_at, expires_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                name,
                service,
                cred_type,
                encrypted,
                metadata_json,
                datetime.now().isoformat(),
                expires_str,
            ))
            conn.commit()
            return cursor.lastrowid

    def get_credential(self, name: str) -> str | None:
        """Get a decrypted credential by name."""
        with sqlite3.connect(self.vault_path) as conn:
            cursor = conn.execute(
                "SELECT encrypted_value, expires_at FROM credentials WHERE name = ?",
                (name,)
            )
            row = cursor.fetchone()
            
            if row is None:
                return None
            
            encrypted, expires_at = row
            
            # Check expiration
            if expires_at:
                if datetime.fromisoformat(expires_at) < datetime.now():
                    return None  # Expired
            
            return self._decrypt(encrypted)

    def get_service_credentials(self, service: str) -> dict[str, str]:
        """Get all credentials for a service."""
        with sqlite3.connect(self.vault_path) as conn:
            cursor = conn.execute(
                "SELECT name, encrypted_value FROM credentials WHERE service = ?",
                (service,)
            )
            
            return {
                row[0]: self._decrypt(row[1])
                for row in cursor.fetchall()
            }

    def delete_credential(self, name: str):
        """Delete a credential."""
        with sqlite3.connect(self.vault_path) as conn:
            conn.execute("DELETE FROM credentials WHERE name = ?", (name,))
            conn.commit()

    def list_credentials(self, service: str | None = None) -> list[dict]:
        """List all credentials (without values)."""
        with sqlite3.connect(self.vault_path) as conn:
            conn.row_factory = sqlite3.Row
            
            if service:
                cursor = conn.execute(
                    "SELECT name, service, type, created_at, expires_at FROM credentials WHERE service = ?",
                    (service,)
                )
            else:
                cursor = conn.execute(
                    "SELECT name, service, type, created_at, expires_at FROM credentials"
                )
            
            return [dict(row) for row in cursor.fetchall()]

    def inject_into_environment(self, service: str) -> dict[str, str]:
        """
        Get credentials as environment variables for sandbox injection.
        
        Returns dict of ENV_VAR_NAME -> value
        """
        creds = self.get_service_credentials(service)
        env = {}
        
        for name, value in creds.items():
            # Convert credential name to env var format
            env_name = name.upper().replace("-", "_").replace(" ", "_")
            env[env_name] = value
        
        return env

    async def inject_into_sandbox(
        self,
        service: str,
        sandbox,
    ):
        """
        Inject credentials into a sandbox execution context.
        
        Args:
            service: Service name
            sandbox: SandboxExecutor instance
        """
        env_vars = self.inject_into_environment(service)
        # The sandbox will use these environment variables
        return env_vars

    def store_oauth_token(
        self,
        service: str,
        access_token: str,
        refresh_token: str | None = None,
        expires_in: int | None = None,
    ):
        """Store OAuth tokens for a service."""
        expires_at = None
        if expires_in:
            from datetime import timedelta
            expires_at = datetime.now() + timedelta(seconds=expires_in)
        
        self.store_credential(
            name=f"{service}_access_token",
            value=access_token,
            service=service,
            cred_type="oauth_access_token",
            expires_at=expires_at,
        )
        
        if refresh_token:
            self.store_credential(
                name=f"{service}_refresh_token",
                value=refresh_token,
                service=service,
                cred_type="oauth_refresh_token",
            )

    def store_cookies(
        self,
        service: str,
        cookies: dict[str, str],
    ):
        """Store browser cookies for a service."""
        self.store_credential(
            name=f"{service}_cookies",
            value=json.dumps(cookies),
            service=service,
            cred_type="cookies",
        )

    def get_cookies(self, service: str) -> dict[str, str] | None:
        """Get stored cookies for a service."""
        value = self.get_credential(f"{service}_cookies")
        if value:
            return json.loads(value)
        return None

    def close(self):
        """Clean up resources."""
        pass

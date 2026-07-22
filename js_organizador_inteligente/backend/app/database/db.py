"""Camada de acesso ao banco de dados SQLite.

Guarda o índice interno pesquisável de clientes, documentos, histórico de
movimentações (para auditoria/undo), preferências aprendidas com o usuário,
duplicidades detectadas, backups e logs. Todo o processamento é local.
"""
from __future__ import annotations

import json
import sqlite3
import threading
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator

SCHEMA = """
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    base_path TEXT NOT NULL,
    area_do_direito TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    original_name TEXT NOT NULL,
    current_name TEXT NOT NULL,
    current_path TEXT NOT NULL,
    doc_type TEXT,
    category TEXT,
    subcategory TEXT,
    confidence REAL,
    extracted_json TEXT,
    ocr_text TEXT,
    hash_sha256 TEXT,
    status TEXT NOT NULL DEFAULT 'ativo',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_documents_client ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_hash ON documents(hash_sha256);
CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON documents(doc_type);

CREATE TABLE IF NOT EXISTS movements_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    from_path TEXT,
    to_path TEXT,
    action TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'sistema',
    timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doc_type TEXT NOT NULL,
    keyword TEXT,
    target_category TEXT NOT NULL,
    target_subcategory TEXT,
    weight INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(doc_type, target_category, target_subcategory)
);

CREATE TABLE IF NOT EXISTS duplicates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    duplicate_of_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    action_taken TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    backup_path TEXT NOT NULL,
    reason TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trash (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER,
    original_path TEXT NOT NULL,
    trash_path TEXT NOT NULL,
    deleted_at TEXT NOT NULL DEFAULT (datetime('now')),
    restored INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT NOT NULL,
    module TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);
"""


class Database:
    """Wrapper fino sobre sqlite3, seguro para uso a partir de uma única app."""

    def __init__(self, db_path: str | Path):
        self.db_path = str(db_path)
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        self._local = threading.local()
        self._init_schema()

    @property
    def conn(self) -> sqlite3.Connection:
        if not hasattr(self._local, "conn"):
            self._local.conn = sqlite3.connect(self.db_path, check_same_thread=False)
            self._local.conn.row_factory = sqlite3.Row
            self._local.conn.execute("PRAGMA foreign_keys = ON")
        return self._local.conn

    def _init_schema(self) -> None:
        self.conn.executescript(SCHEMA)
        self.conn.commit()

    @contextmanager
    def cursor(self) -> Iterator[sqlite3.Cursor]:
        cur = self.conn.cursor()
        try:
            yield cur
            self.conn.commit()
        except Exception:
            self.conn.rollback()
            raise
        finally:
            cur.close()

    def execute(self, query: str, params: tuple = ()) -> sqlite3.Cursor:
        with self.cursor() as cur:
            cur.execute(query, params)
            return cur

    def fetchone(self, query: str, params: tuple = ()) -> sqlite3.Row | None:
        cur = self.conn.execute(query, params)
        return cur.fetchone()

    def fetchall(self, query: str, params: tuple = ()) -> list[sqlite3.Row]:
        cur = self.conn.execute(query, params)
        return cur.fetchall()

    def close(self) -> None:
        if hasattr(self._local, "conn"):
            self._local.conn.close()
            del self._local.conn


def row_to_dict(row: sqlite3.Row | None) -> dict[str, Any] | None:
    if row is None:
        return None
    d = dict(row)
    if d.get("extracted_json"):
        try:
            d["extracted_json"] = json.loads(d["extracted_json"])
        except (json.JSONDecodeError, TypeError):
            pass
    return d


_db_instance: Database | None = None


def get_db(db_path: str | Path | None = None) -> Database:
    global _db_instance
    if _db_instance is None:
        if db_path is None:
            from app.config import get_config

            db_path = get_config().database_path
        _db_instance = Database(db_path)
    return _db_instance


def reset_db() -> None:
    """Usado em testes para forçar recriação da instância global."""
    global _db_instance
    if _db_instance is not None:
        _db_instance.close()
    _db_instance = None

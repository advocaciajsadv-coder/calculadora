"""Funções de acesso a dados (CRUD) usadas pelos módulos e pela API."""
from __future__ import annotations

import json
from typing import Any

from app.database.db import Database, row_to_dict


class ClientRepository:
    def __init__(self, db: Database):
        self.db = db

    def create(self, name: str, base_path: str, area_do_direito: str | None = None) -> dict[str, Any]:
        cur = self.db.execute(
            "INSERT INTO clients (name, base_path, area_do_direito) VALUES (?, ?, ?)",
            (name, base_path, area_do_direito),
        )
        return self.get(cur.lastrowid)

    def get(self, client_id: int) -> dict[str, Any] | None:
        return row_to_dict(self.db.fetchone("SELECT * FROM clients WHERE id = ?", (client_id,)))

    def get_by_name(self, name: str) -> dict[str, Any] | None:
        return row_to_dict(self.db.fetchone("SELECT * FROM clients WHERE name = ?", (name,)))

    def list(self) -> list[dict[str, Any]]:
        return [row_to_dict(r) for r in self.db.fetchall("SELECT * FROM clients ORDER BY name")]


class DocumentRepository:
    def __init__(self, db: Database):
        self.db = db

    def create(
        self,
        client_id: int,
        original_name: str,
        current_name: str,
        current_path: str,
        doc_type: str | None,
        category: str | None,
        subcategory: str | None,
        confidence: float | None,
        extracted: dict | None,
        ocr_text: str | None,
        hash_sha256: str | None,
    ) -> dict[str, Any]:
        cur = self.db.execute(
            """INSERT INTO documents
               (client_id, original_name, current_name, current_path, doc_type,
                category, subcategory, confidence, extracted_json, ocr_text, hash_sha256)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                client_id,
                original_name,
                current_name,
                current_path,
                doc_type,
                category,
                subcategory,
                confidence,
                json.dumps(extracted or {}, ensure_ascii=False),
                ocr_text,
                hash_sha256,
            ),
        )
        return self.get(cur.lastrowid)

    def get(self, document_id: int) -> dict[str, Any] | None:
        return row_to_dict(self.db.fetchone("SELECT * FROM documents WHERE id = ?", (document_id,)))

    def find_by_hash(self, client_id: int, hash_sha256: str) -> list[dict[str, Any]]:
        rows = self.db.fetchall(
            "SELECT * FROM documents WHERE client_id = ? AND hash_sha256 = ? AND status = 'ativo'",
            (client_id, hash_sha256),
        )
        return [row_to_dict(r) for r in rows]

    def list_by_client(self, client_id: int) -> list[dict[str, Any]]:
        rows = self.db.fetchall(
            "SELECT * FROM documents WHERE client_id = ? AND status = 'ativo' ORDER BY current_name",
            (client_id,),
        )
        return [row_to_dict(r) for r in rows]

    def update_location(self, document_id: int, current_name: str, current_path: str,
                         category: str | None = None, subcategory: str | None = None) -> None:
        self.db.execute(
            """UPDATE documents SET current_name = ?, current_path = ?,
               category = COALESCE(?, category), subcategory = COALESCE(?, subcategory),
               updated_at = datetime('now') WHERE id = ?""",
            (current_name, current_path, category, subcategory, document_id),
        )

    def set_status(self, document_id: int, status: str) -> None:
        self.db.execute(
            "UPDATE documents SET status = ?, updated_at = datetime('now') WHERE id = ?",
            (status, document_id),
        )

    def search_raw(self, sql_where: str, params: tuple) -> list[dict[str, Any]]:
        rows = self.db.fetchall(f"SELECT * FROM documents WHERE {sql_where}", params)
        return [row_to_dict(r) for r in rows]

    def all_for_client(self, client_id: int) -> list[dict[str, Any]]:
        return self.list_by_client(client_id)


class PreferenceRepository:
    def __init__(self, db: Database):
        self.db = db

    def upsert(self, doc_type: str, target_category: str, target_subcategory: str | None,
               keyword: str | None = None) -> None:
        existing = self.db.fetchone(
            """SELECT id, weight FROM preferences
               WHERE doc_type = ? AND target_category = ? AND
                     (target_subcategory IS ? OR target_subcategory = ?)""",
            (doc_type, target_category, target_subcategory, target_subcategory),
        )
        if existing:
            self.db.execute(
                "UPDATE preferences SET weight = weight + 1, keyword = ?, updated_at = datetime('now') WHERE id = ?",
                (keyword, existing["id"]),
            )
        else:
            self.db.execute(
                """INSERT INTO preferences (doc_type, keyword, target_category, target_subcategory, weight)
                   VALUES (?, ?, ?, ?, 1)""",
                (doc_type, keyword, target_category, target_subcategory),
            )

    def best_for(self, doc_type: str) -> dict[str, Any] | None:
        row = self.db.fetchone(
            """SELECT * FROM preferences WHERE doc_type = ?
               ORDER BY weight DESC, updated_at DESC LIMIT 1""",
            (doc_type,),
        )
        return row_to_dict(row)


class LogRepository:
    def __init__(self, db: Database):
        self.db = db

    def add(self, level: str, module: str, message: str) -> None:
        self.db.execute(
            "INSERT INTO logs (level, module, message) VALUES (?, ?, ?)",
            (level, module, message),
        )

    def recent(self, limit: int = 200) -> list[dict[str, Any]]:
        rows = self.db.fetchall("SELECT * FROM logs ORDER BY id DESC LIMIT ?", (limit,))
        return [row_to_dict(r) for r in rows]


class MovementRepository:
    def __init__(self, db: Database):
        self.db = db

    def add(self, document_id: int | None, from_path: str | None, to_path: str | None,
            action: str, source: str = "sistema") -> None:
        self.db.execute(
            """INSERT INTO movements_history (document_id, from_path, to_path, action, source)
               VALUES (?, ?, ?, ?, ?)""",
            (document_id, from_path, to_path, action, source),
        )

    def history_for_document(self, document_id: int) -> list[dict[str, Any]]:
        rows = self.db.fetchall(
            "SELECT * FROM movements_history WHERE document_id = ? ORDER BY id", (document_id,)
        )
        return [row_to_dict(r) for r in rows]

    def added_since(self, since_iso: str) -> list[dict[str, Any]]:
        rows = self.db.fetchall(
            "SELECT * FROM movements_history WHERE timestamp >= ? AND action = 'importado' ORDER BY id",
            (since_iso,),
        )
        return [row_to_dict(r) for r in rows]

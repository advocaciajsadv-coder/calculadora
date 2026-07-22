"""Backup automático, lixeira (recuperação de excluídos) e histórico.

- Antes de qualquer sobrescrita, uma cópia versionada é salva em
  `backups_dir/<client>/<document_id>/`.
- Exclusões nunca apagam o arquivo de fato: ele é movido para `trash_dir`
  com metadados, podendo ser restaurado a qualquer momento.
- `run_full_backup` gera um snapshot .zip de toda a pasta de um cliente.
"""
from __future__ import annotations

import shutil
import zipfile
from datetime import datetime
from pathlib import Path

from app.database.db import Database, row_to_dict


class BackupManager:
    def __init__(self, db: Database, backups_dir: str | Path, trash_dir: str | Path,
                 max_backups_per_document: int = 5):
        self.db = db
        self.backups_dir = Path(backups_dir)
        self.trash_dir = Path(trash_dir)
        self.max_backups_per_document = max_backups_per_document
        self.backups_dir.mkdir(parents=True, exist_ok=True)
        self.trash_dir.mkdir(parents=True, exist_ok=True)

    def backup_document(self, document_id: int, file_path: Path, reason: str = "alteracao") -> Path:
        doc_backup_dir = self.backups_dir / str(document_id)
        doc_backup_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        backup_path = doc_backup_dir / f"{timestamp}_{file_path.name}"
        shutil.copy2(file_path, backup_path)

        self.db.execute(
            "INSERT INTO backups (document_id, backup_path, reason) VALUES (?, ?, ?)",
            (document_id, str(backup_path), reason),
        )
        self._prune_old_backups(document_id, doc_backup_dir)
        return backup_path

    def _prune_old_backups(self, document_id: int, doc_backup_dir: Path) -> None:
        backups = sorted(doc_backup_dir.iterdir(), key=lambda p: p.stat().st_mtime)
        excess = len(backups) - self.max_backups_per_document
        for old in backups[:max(excess, 0)]:
            old.unlink(missing_ok=True)

    def move_to_trash(self, document_id: int | None, file_path: Path) -> Path:
        self.trash_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        trash_path = self.trash_dir / f"{timestamp}_{file_path.name}"
        shutil.move(str(file_path), trash_path)

        self.db.execute(
            "INSERT INTO trash (document_id, original_path, trash_path) VALUES (?, ?, ?)",
            (document_id, str(file_path), str(trash_path)),
        )
        return trash_path

    def restore_from_trash(self, trash_id: int) -> Path:
        row = self.db.fetchone("SELECT * FROM trash WHERE id = ?", (trash_id,))
        if row is None:
            raise ValueError(f"Item de lixeira {trash_id} não encontrado.")
        item = row_to_dict(row)
        original_path = Path(item["original_path"])
        trash_path = Path(item["trash_path"])
        original_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(trash_path), original_path)
        self.db.execute("UPDATE trash SET restored = 1 WHERE id = ?", (trash_id,))
        return original_path

    def list_trash(self) -> list[dict]:
        rows = self.db.fetchall("SELECT * FROM trash WHERE restored = 0 ORDER BY deleted_at DESC")
        return [row_to_dict(r) for r in rows]

    def run_full_backup(self, client_base_path: Path, client_name: str) -> Path:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        zip_path = self.backups_dir / f"{client_name}_{timestamp}.zip"
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for file_path in client_base_path.rglob("*"):
                if file_path.is_file():
                    zf.write(file_path, file_path.relative_to(client_base_path.parent))
        return zip_path

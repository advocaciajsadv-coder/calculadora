"""Wiring central dos módulos (injeção de dependências simples, sem framework)."""
from __future__ import annotations

from app.config import AppConfig, get_config
from app.database.db import Database, get_db
from app.database.repository import (
    ClientRepository,
    DocumentRepository,
    LogRepository,
    MovementRepository,
    PreferenceRepository,
)
from app.modules.backup.backup_manager import BackupManager
from app.modules.folder_organizer.organizer import DocumentOrganizer
from app.modules.logs.logger import LiveLogger, get_logger


class AppContext:
    """Agrega todas as dependências vivas da aplicação."""

    def __init__(self, config: AppConfig | None = None, db: Database | None = None):
        self.config = config or get_config()
        self.config.ensure_directories()
        self.db = db or get_db(self.config.database_path)

        self.client_repo = ClientRepository(self.db)
        self.document_repo = DocumentRepository(self.db)
        self.preference_repo = PreferenceRepository(self.db)
        self.log_repo = LogRepository(self.db)
        self.movement_repo = MovementRepository(self.db)

        self.logger: LiveLogger = get_logger(self.log_repo)
        self.backup_manager = BackupManager(
            self.db, self.config.backups_dir, self.config.trash_dir, self.config.max_backups_per_document
        )
        self.organizer = DocumentOrganizer(
            self.config, self.document_repo, self.movement_repo, self.preference_repo,
            self.logger, self.backup_manager,
        )


_context: AppContext | None = None


def get_context() -> AppContext:
    global _context
    if _context is None:
        _context = AppContext()
    return _context


def reset_context() -> None:
    global _context
    _context = None

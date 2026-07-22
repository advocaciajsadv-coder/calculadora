from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest

from app.config import AppConfig
from app.database.db import Database
from app.database.repository import (
    ClientRepository,
    DocumentRepository,
    LogRepository,
    MovementRepository,
    PreferenceRepository,
)


@pytest.fixture()
def tmp_config(tmp_path) -> AppConfig:
    config = AppConfig(data_dir=str(tmp_path / "data"))
    config.ensure_directories()
    return config


@pytest.fixture()
def db(tmp_config) -> Database:
    database = Database(tmp_config.database_path)
    yield database
    database.close()


@pytest.fixture()
def repos(db):
    return {
        "clients": ClientRepository(db),
        "documents": DocumentRepository(db),
        "preferences": PreferenceRepository(db),
        "logs": LogRepository(db),
        "movements": MovementRepository(db),
    }

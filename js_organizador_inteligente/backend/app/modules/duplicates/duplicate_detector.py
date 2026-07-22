"""Detecção de arquivos duplicados por hash de conteúdo (SHA-256).

Duas comparações são feitas: hash de bytes brutos do arquivo (detecta cópias
idênticas) — comparação sempre restrita ao mesmo cliente/pasta raiz.
"""
from __future__ import annotations

import hashlib
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

DuplicateAction = Literal["ignorar", "substituir", "manter_ambos"]


def compute_hash(path: Path, chunk_size: int = 1024 * 1024) -> str:
    sha256 = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(chunk_size), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


@dataclass
class DuplicateCheck:
    is_duplicate: bool
    existing_document: dict | None = None


def check_duplicate(document_repo, client_id: int, file_hash: str) -> DuplicateCheck:
    matches = document_repo.find_by_hash(client_id, file_hash)
    if matches:
        return DuplicateCheck(is_duplicate=True, existing_document=matches[0])
    return DuplicateCheck(is_duplicate=False, existing_document=None)


def resolve_duplicate_name(target_dir: Path, filename: str) -> Path:
    """Usado na política 'manter_ambos': gera um nome alternativo não colidente."""
    from app.modules.renaming.renamer import resolve_collision

    return resolve_collision(target_dir, filename)

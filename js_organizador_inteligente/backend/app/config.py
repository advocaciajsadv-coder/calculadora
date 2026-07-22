"""Configurações do JS Organizador Inteligente.

Centraliza todas as opções configuráveis pelo usuário (módulo "Configurações"
da arquitetura). O arquivo de configuração é um JSON local, nunca enviado
para nenhum servidor externo.
"""
from __future__ import annotations

import json
import os
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Literal

APP_NAME = "JS Organizador Inteligente"

AIProviderName = Literal["local", "openai"]
DuplicatePolicy = Literal["ignorar", "substituir", "manter_ambos"]


def _default_data_dir() -> Path:
    """Diretório de dados do usuário (equivalente a %APPDATA% no Windows)."""
    appdata = os.environ.get("APPDATA")
    if appdata:
        return Path(appdata) / "JSOrganizadorInteligente"
    return Path.home() / ".js_organizador_inteligente"


@dataclass
class AppConfig:
    # Diretórios
    data_dir: str = field(default_factory=lambda: str(_default_data_dir()))
    database_path: str = ""
    backups_dir: str = ""
    trash_dir: str = ""
    logs_dir: str = ""

    # Interface
    theme: Literal["claro", "escuro", "sistema"] = "sistema"

    # IA / Classificação
    ai_provider: AIProviderName = "local"  # offline por padrão
    openai_api_key: str | None = None
    openai_model: str = "gpt-5.5"
    confidence_threshold: float = 0.90  # abaixo disso -> 99 - Não Identificados
    ai_allowed_to_send_external: bool = False  # exige autorização explícita do usuário

    # OCR
    tesseract_cmd: str | None = None  # caminho customizado do tesseract (Windows)
    ocr_language: str = "por"

    # Conversão
    delete_originals_after_conversion: bool = False
    libreoffice_cmd: str | None = None  # caminho do soffice.exe para conversão de DOC/DOCX

    # Duplicidade
    default_duplicate_policy: DuplicatePolicy = "manter_ambos"

    # Backup
    auto_backup_enabled: bool = True
    auto_backup_interval_minutes: int = 60
    max_backups_per_document: int = 5

    # Segurança
    encryption_enabled: bool = False

    def __post_init__(self) -> None:
        base = Path(self.data_dir)
        if not self.database_path:
            self.database_path = str(base / "organizador.db")
        if not self.backups_dir:
            self.backups_dir = str(base / "backups")
        if not self.trash_dir:
            self.trash_dir = str(base / "lixeira")
        if not self.logs_dir:
            self.logs_dir = str(base / "logs")

    def ensure_directories(self) -> None:
        for path in (self.data_dir, self.backups_dir, self.trash_dir, self.logs_dir):
            Path(path).mkdir(parents=True, exist_ok=True)

    @property
    def config_file(self) -> Path:
        return Path(self.data_dir) / "config.json"

    def save(self) -> None:
        self.ensure_directories()
        self.config_file.write_text(
            json.dumps(asdict(self), indent=2, ensure_ascii=False), encoding="utf-8"
        )

    @classmethod
    def load(cls, data_dir: str | None = None) -> "AppConfig":
        base = Path(data_dir) if data_dir else _default_data_dir()
        config_file = base / "config.json"
        if config_file.exists():
            raw = json.loads(config_file.read_text(encoding="utf-8"))
            return cls(**raw)
        cfg = cls(data_dir=str(base))
        cfg.save()
        return cfg


_current_config: AppConfig | None = None


def get_config() -> AppConfig:
    global _current_config
    if _current_config is None:
        _current_config = AppConfig.load()
        _current_config.ensure_directories()
    return _current_config


def set_config(config: AppConfig) -> None:
    global _current_config
    _current_config = config
    config.save()

"""Modelos Pydantic usados pela API."""
from __future__ import annotations

from pydantic import BaseModel


class ClientCreate(BaseModel):
    name: str
    root_path: str
    area_do_direito: str | None = None


class ImportRequest(BaseModel):
    client_id: int
    source_folder: str
    duplicate_policy: str | None = None


class ManualMoveRequest(BaseModel):
    document_id: int
    category: str
    subcategory: str | None = None


class SearchRequest(BaseModel):
    client_id: int
    query: str


class AssistantRequest(BaseModel):
    client_id: int
    question: str


class ConfigUpdate(BaseModel):
    theme: str | None = None
    ai_provider: str | None = None
    openai_api_key: str | None = None
    openai_model: str | None = None
    confidence_threshold: float | None = None
    ai_allowed_to_send_external: bool | None = None
    tesseract_cmd: str | None = None
    ocr_language: str | None = None
    delete_originals_after_conversion: bool | None = None
    libreoffice_cmd: str | None = None
    default_duplicate_policy: str | None = None
    auto_backup_enabled: bool | None = None
    auto_backup_interval_minutes: int | None = None
    encryption_enabled: bool | None = None


class RestoreTrashRequest(BaseModel):
    trash_id: int

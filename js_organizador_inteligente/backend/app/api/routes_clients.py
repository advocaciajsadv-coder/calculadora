"""Rotas de clientes/processos: criação e listagem."""
from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.api.schemas import ClientCreate
from app.dependencies import get_context
from app.modules.folder_organizer.structure import create_client_structure

router = APIRouter(prefix="/clients", tags=["clients"])


@router.post("")
def create_client(payload: ClientCreate):
    ctx = get_context()

    existing = ctx.client_repo.get_by_name(payload.name)
    if existing:
        raise HTTPException(status_code=409, detail="Já existe um cliente com esse nome.")

    root = Path(payload.root_path)
    root.mkdir(parents=True, exist_ok=True)
    base_path = create_client_structure(root, payload.name)

    client = ctx.client_repo.create(payload.name, str(base_path), payload.area_do_direito)
    ctx.logger.sucesso("clientes", f"Cliente '{payload.name}' criado com estrutura de pastas em {base_path}.")
    return client


@router.get("")
def list_clients():
    return get_context().client_repo.list()


@router.get("/{client_id}")
def get_client(client_id: int):
    ctx = get_context()
    client = ctx.client_repo.get(client_id)
    if client is None:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")
    return client


@router.get("/{client_id}/documents")
def list_client_documents(client_id: int):
    return get_context().document_repo.list_by_client(client_id)

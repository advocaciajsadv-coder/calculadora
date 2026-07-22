"""Rotas de pesquisa inteligente e assistente jurídico."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.api.schemas import AssistantRequest, SearchRequest
from app.dependencies import get_context
from app.modules.search.legal_assistant import ask as assistant_ask
from app.modules.search.nl_search import execute_query

router = APIRouter(tags=["search"])


@router.post("/search")
def search(payload: SearchRequest):
    ctx = get_context()
    client = ctx.client_repo.get(payload.client_id)
    if client is None:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")
    return execute_query(ctx.document_repo, ctx.movement_repo, payload.client_id, payload.query)


@router.post("/assistant/ask")
def assistant(payload: AssistantRequest):
    ctx = get_context()
    client = ctx.client_repo.get(payload.client_id)
    if client is None:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")
    return assistant_ask(
        ctx.document_repo, ctx.movement_repo, payload.client_id,
        client.get("area_do_direito"), payload.question,
    )

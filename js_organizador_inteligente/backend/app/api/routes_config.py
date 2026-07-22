"""Rotas de configuração do aplicativo."""
from __future__ import annotations

from dataclasses import asdict

from fastapi import APIRouter

from app.api.schemas import ConfigUpdate
from app.config import set_config
from app.dependencies import get_context

router = APIRouter(prefix="/config", tags=["config"])


@router.get("")
def get_config_route():
    ctx = get_context()
    config_dict = asdict(ctx.config)
    config_dict.pop("openai_api_key", None)  # nunca expor a chave via API
    return config_dict


@router.put("")
def update_config(payload: ConfigUpdate):
    ctx = get_context()
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    for key, value in updates.items():
        setattr(ctx.config, key, value)
    set_config(ctx.config)
    ctx.logger.info("configuracoes", "Configurações atualizadas.")
    config_dict = asdict(ctx.config)
    config_dict.pop("openai_api_key", None)
    return config_dict

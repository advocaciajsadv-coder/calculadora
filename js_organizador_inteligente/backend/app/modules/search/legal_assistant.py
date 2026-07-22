"""Assistente Jurídico de Documentos.

Responde perguntas do tipo "quais documentos ainda faltam", "existe
procuração assinada?", "há CNIS atualizado?" combinando a pesquisa em
linguagem natural (nl_search) com uma checklist de documentos esperados por
área do direito.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from app.modules.search.nl_search import execute_query

# Checklist mínimo de documentos esperados por área do direito. Usado para
# responder "quais documentos ainda faltam para este processo?".
CHECKLISTS: dict[str, list[str]] = {
    "Trabalhista": ["Carteira de Trabalho", "Holerite", "TRCT", "FGTS", "Procuração", "Petição Inicial"],
    "Previdenciário": ["CNIS", "Extrato do INSS", "Laudo Médico", "Procuração", "Petição Inicial"],
    "Cível": ["Procuração", "Contrato", "Petição Inicial"],
    "Família": ["Certidão de Nascimento", "Certidão de Casamento", "Procuração", "Petição Inicial"],
}

BASE_CHECKLIST = ["RG", "CPF", "Comprovante de Residência", "Procuração"]


def missing_documents(document_repo, client_id: int, area_do_direito: str | None) -> list[str]:
    docs = document_repo.list_by_client(client_id)
    present_types = {d.get("doc_type") for d in docs if d.get("doc_type")}

    expected = list(BASE_CHECKLIST)
    if area_do_direito and area_do_direito in CHECKLISTS:
        expected += CHECKLISTS[area_do_direito]

    seen = set()
    ordered_missing = []
    for doc_type in expected:
        if doc_type in seen:
            continue
        seen.add(doc_type)
        if doc_type not in present_types:
            ordered_missing.append(doc_type)
    return ordered_missing


def ask(document_repo, movement_repo, client_id: int, area_do_direito: str | None, question: str) -> dict[str, Any]:
    """Ponto de entrada único do assistente jurídico."""
    normalized = question.lower()

    if "falta" in normalized or "faltam" in normalized:
        missing = missing_documents(document_repo, client_id, area_do_direito)
        if missing:
            resposta = "Documentos ainda não encontrados: " + ", ".join(missing) + "."
        else:
            resposta = "Todos os documentos da checklist básica foram encontrados."
        return {"tipo": "checklist", "resposta": resposta, "faltando": missing}

    if "duplicad" in normalized:
        result = execute_query(document_repo, movement_repo, client_id, question)
        n = len(result.get("resultados", []))
        resposta = f"Foram encontradas {n} duplicidade(s)." if n else "Nenhum documento duplicado encontrado."
        return {"tipo": "duplicados", "resposta": resposta, **result}

    if "hoje" in normalized or "adicionad" in normalized:
        result = execute_query(document_repo, movement_repo, client_id, question)
        n = len(result.get("resultados", []))
        resposta = f"{n} arquivo(s) adicionado(s) nas últimas 24 horas." if n else "Nenhum arquivo adicionado hoje."
        return {"tipo": "recentes", "resposta": resposta, **result}

    result = execute_query(document_repo, movement_repo, client_id, question)

    if result["intent"] == "existe":
        resposta = "Sim." if result["existe"] else "Não encontrei esse documento."
        return {"tipo": "existe", "resposta": resposta, **result}

    if result["intent"] == "campo":
        valores = result.get("valores", [])
        if valores:
            resposta = "; ".join(f"{v['documento']}: {v['valor']}" for v in valores)
        else:
            resposta = "Não encontrei esse dado nos documentos indexados."
        return {"tipo": "campo", "resposta": resposta, **result}

    n = len(result.get("resultados", []))
    resposta = f"Encontrei {n} documento(s)." if n else "Não encontrei documentos correspondentes."
    return {"tipo": result["intent"], "resposta": resposta, **result}

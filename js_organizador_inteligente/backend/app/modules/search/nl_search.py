"""Pesquisa inteligente em linguagem natural (PT-BR).

Não depende de nenhum serviço externo: usa reconhecimento de padrões e
palavras-chave sobre a base de regras de classificação (mesmo vocabulário
usado para organizar os documentos), o que garante que "mostrar todos os
CNIS" funcione totalmente offline. Quando um provedor de IA externo estiver
habilitado, ele pode ser plugado para interpretar frases fora do padrão,
mas não é necessário para o funcionamento básico.
"""
from __future__ import annotations

import unicodedata
from dataclasses import dataclass
from dataclasses import field as dataclass_field
from datetime import datetime, timedelta
from typing import Any, Literal

from app.modules.classification.rules import RULES

IntentKind = Literal["listar", "existe", "campo", "duplicados", "recentes", "categoria", "desconhecido"]

CATEGORY_TERMS: dict[str, str] = {
    "documentos pessoais": "01 - Documentos Pessoais",
    "pessoais": "01 - Documentos Pessoais",
    "provas": "02 - Provas",
    "peticoes": "03 - Petições",
    "peticao": "03 - Petições",
    "documentos assinados": "04 - Documentos Assinados",
    "assinados": "04 - Documentos Assinados",
    "documentos do caso": "05 - Documentos do Caso",
    "nao identificados": "99 - Não Identificados",
}

FIELD_TERMS: dict[str, str] = {
    "cid": "cid",
    "cpf": "cpf",
    "rg": "rg",
    "numero do processo": "numero_processo",
    "numero de processo": "numero_processo",
    "processo": "numero_processo",
    "beneficio": "numero_beneficio",
    "numero do beneficio": "numero_beneficio",
    "nb": "numero_beneficio",
    "oab": "numero_oab",
    "advogado": "advogado",
    "medico": "medico_responsavel",
    "medico responsavel": "medico_responsavel",
    "empresa": "empresa",
    "cnpj": "cnpj",
    "data": "datas",
}


def _normalize(text: str) -> str:
    text = text.lower().strip()
    text = "".join(c for c in unicodedata.normalize("NFKD", text) if not unicodedata.combining(c))
    return text


@dataclass
class QueryIntent:
    kind: IntentKind
    doc_type: str | None = None
    category: str | None = None
    field: str | None = None
    raw_query: str = ""
    extra: dict[str, Any] = dataclass_field(default_factory=dict)


def _match_doc_type(normalized: str) -> str | None:
    best: tuple[str, int] | None = None
    for rule in RULES:
        for kw in rule.keywords + (rule.doc_type,):
            kw_norm = _normalize(kw)
            if kw_norm and kw_norm in normalized:
                score = len(kw_norm)
                if best is None or score > best[1]:
                    best = (rule.doc_type, score)
    return best[0] if best else None


def _match_category(normalized: str) -> str | None:
    for term, category in CATEGORY_TERMS.items():
        if term in normalized:
            return category
    return None


def _match_field(normalized: str) -> str | None:
    for term, field_name in sorted(FIELD_TERMS.items(), key=lambda kv: -len(kv[0])):
        if term in normalized:
            return field_name
    return None


def parse_query(query: str) -> QueryIntent:
    normalized = _normalize(query)

    if any(t in normalized for t in ("duplicad",)):
        return QueryIntent(kind="duplicados", raw_query=query)

    if any(t in normalized for t in ("adicionado hoje", "adicionados hoje", "chegaram hoje", "hoje")):
        return QueryIntent(kind="recentes", raw_query=query, extra={"periodo": "hoje"})

    field_name = _match_field(normalized)
    if field_name and any(t in normalized for t in ("qual", "quais")):
        doc_type = _match_doc_type(normalized)
        return QueryIntent(kind="campo", field=field_name, doc_type=doc_type, raw_query=query)

    if any(t in normalized for t in ("existe", "ha ", "tem ", "possui")):
        doc_type = _match_doc_type(normalized)
        category = _match_category(normalized)
        return QueryIntent(kind="existe", doc_type=doc_type, category=category, raw_query=query)

    if any(t in normalized for t in ("mostrar", "mostre", "listar", "liste", "quais documentos")):
        doc_type = _match_doc_type(normalized)
        category = _match_category(normalized)
        if doc_type:
            return QueryIntent(kind="listar", doc_type=doc_type, raw_query=query)
        if category:
            return QueryIntent(kind="categoria", category=category, raw_query=query)
        return QueryIntent(kind="listar", raw_query=query)

    doc_type = _match_doc_type(normalized)
    if doc_type:
        return QueryIntent(kind="listar", doc_type=doc_type, raw_query=query)

    category = _match_category(normalized)
    if category:
        return QueryIntent(kind="categoria", category=category, raw_query=query)

    return QueryIntent(kind="desconhecido", raw_query=query)


def execute_query(document_repo, movement_repo, client_id: int, query: str) -> dict[str, Any]:
    """Executa a intenção interpretada e retorna um payload pronto para a UI."""
    intent = parse_query(query)
    docs = document_repo.list_by_client(client_id)

    if intent.kind == "listar" and intent.doc_type:
        results = [d for d in docs if d.get("doc_type") == intent.doc_type]
        return {"intent": "listar", "doc_type": intent.doc_type, "resultados": results}

    if intent.kind == "categoria" and intent.category:
        results = [d for d in docs if d.get("category") == intent.category]
        return {"intent": "categoria", "categoria": intent.category, "resultados": results}

    if intent.kind == "existe":
        if intent.doc_type:
            results = [d for d in docs if d.get("doc_type") == intent.doc_type]
        elif intent.category:
            results = [d for d in docs if d.get("category") == intent.category]
        else:
            results = []
        return {
            "intent": "existe",
            "existe": len(results) > 0,
            "doc_type": intent.doc_type,
            "categoria": intent.category,
            "resultados": results,
        }

    if intent.kind == "campo" and intent.field:
        candidates = docs
        if intent.doc_type:
            candidates = [d for d in candidates if d.get("doc_type") == intent.doc_type]
        values = []
        for d in candidates:
            extracted = d.get("extracted_json") or {}
            if isinstance(extracted, dict) and extracted.get(intent.field):
                values.append({"documento": d["current_name"], "valor": extracted[intent.field]})
        return {"intent": "campo", "campo": intent.field, "valores": values}

    if intent.kind == "duplicados":
        from app.database.db import row_to_dict

        rows = document_repo.db.fetchall(
            """SELECT du.*, d1.current_name AS doc_name, d2.current_name AS duplicate_name
               FROM duplicates du
               JOIN documents d1 ON d1.id = du.document_id
               JOIN documents d2 ON d2.id = du.duplicate_of_id
               WHERE d1.client_id = ?""",
            (client_id,),
        )
        return {"intent": "duplicados", "resultados": [row_to_dict(r) for r in rows]}

    if intent.kind == "recentes":
        since = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d 00:00:00")
        movimentos = movement_repo.added_since(since)
        return {"intent": "recentes", "resultados": movimentos}

    # Fallback: busca textual simples no nome/tipo/OCR.
    normalized = _normalize(query)
    results = [
        d for d in docs
        if normalized in _normalize(d.get("current_name", ""))
        or normalized in _normalize(d.get("doc_type") or "")
        or normalized in _normalize((d.get("ocr_text") or "")[:5000])
    ]
    return {"intent": "busca_livre", "resultados": results}

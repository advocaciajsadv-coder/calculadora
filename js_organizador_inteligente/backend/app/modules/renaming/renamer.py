"""Renomeação automática e padronizada dos arquivos.

Cada tipo de documento tem um template de nome. Campos ausentes são
omitidos silenciosamente (o nome nunca fica com "None" ou campos vazios).
"""
from __future__ import annotations

import re
from pathlib import Path

from app.modules.extraction.extractor import ExtractedData

INVALID_CHARS_RE = re.compile(r'[<>:"/\\|?*]')

# Templates por tipo de documento. Placeholders disponíveis:
# {tipo} {cliente} {medico} {data} {empresa}
TEMPLATES: dict[str, str] = {
    "RG": "RG - {cliente}",
    "CPF": "CPF - {cliente}",
    "CNH": "CNH - {cliente}",
    "Comprovante de Residência": "Comprovante de Residência - {cliente}",
    "Certidão de Nascimento": "Certidão de Nascimento - {cliente}",
    "Certidão de Casamento": "Certidão de Casamento - {cliente}",
    "Certidão de Óbito": "Certidão de Óbito - {cliente}",
    "CNIS": "CNIS - {cliente}",
    "Extrato do INSS": "Extrato do INSS - {cliente}",
    "Laudo Médico": "Laudo Médico - {cliente} - {medico} - {data}",
    "Receita Médica": "Receita Médica - {cliente} - {medico} - {data}",
    "Atestado": "Atestado - {cliente} - {medico} - {data}",
    "Holerite": "Holerite - {cliente} - {data}",
    "TRCT": "TRCT - {cliente}",
    "FGTS": "Extrato FGTS - {cliente} - {data}",
    "Carteira de Trabalho": "Carteira de Trabalho - {cliente}",
    "Contrato": "Contrato de Honorários - {cliente}",
    "Procuração": "Procuração Assinada - {cliente}",
    "Declaração": "Declaração - {cliente}",
    "Petição Inicial": "Petição Inicial - {cliente}",
    "Contestação": "Contestação - {cliente}",
    "Réplica": "Réplica - {cliente}",
    "Recurso Ordinário": "Recurso Ordinário - {cliente}",
    "Recurso": "Recurso - {cliente}",
    "Sentença": "Sentença - {cliente}",
    "Acórdão": "Acórdão - {cliente}",
    "Foto": "Foto - {cliente} - {data}",
    "Vídeo": "Vídeo - {cliente} - {data}",
    "Áudio": "Áudio - {cliente} - {data}",
    "Conversa de WhatsApp": "Conversa WhatsApp - {cliente} - {data}",
    "Print": "Print - {cliente} - {data}",
}


def sanitize_filename(name: str) -> str:
    cleaned = INVALID_CHARS_RE.sub("", name).strip()
    cleaned = re.sub(r"\s+", " ", cleaned)
    cleaned = re.sub(r"\s*-\s*-\s*", " - ", cleaned)  # remove "- -" de campos vazios
    cleaned = cleaned.strip(" -")
    return cleaned or "Documento"


def build_new_name(doc_type: str | None, extracted: ExtractedData, extension: str) -> str:
    """Monta o novo nome do arquivo (sem colisão) a partir do tipo e dos dados extraídos."""
    template = TEMPLATES.get(doc_type or "", None)
    ext = extension if extension.startswith(".") else f".{extension}"

    if template is None:
        base = doc_type or "Documento"
        if extracted.nome_cliente:
            base = f"{base} - {extracted.nome_cliente}"
        return sanitize_filename(base) + ext.lower()

    data_str = extracted.datas[0].replace("/", "-") if extracted.datas else ""
    values = {
        "cliente": extracted.nome_cliente or "",
        "medico": extracted.medico_responsavel or "",
        "data": data_str,
        "empresa": extracted.empresa or "",
    }

    # Remove placeholders vazios preservando a legibilidade (" - " entre partes).
    parts = []
    for token in template.split(" - "):
        rendered = token.format(**values) if "{" in token else token
        if rendered.strip():
            parts.append(rendered.strip())
    name = " - ".join(parts)
    return sanitize_filename(name) + ext.lower()


def resolve_collision(target_dir: Path, filename: str) -> Path:
    """Garante nome único no diretório de destino, adicionando ' (n)' se necessário."""
    candidate = target_dir / filename
    if not candidate.exists():
        return candidate

    stem = candidate.stem
    suffix = candidate.suffix
    counter = 2
    while True:
        candidate = target_dir / f"{stem} ({counter}){suffix}"
        if not candidate.exists():
            return candidate
        counter += 1

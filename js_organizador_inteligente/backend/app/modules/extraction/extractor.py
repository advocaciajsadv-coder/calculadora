"""Extração inteligente de dados a partir do texto (OCR) e nome do arquivo.

Extrai: nome do cliente, CPF, RG, número do benefício (NB), número do
processo (padrão CNJ), CID, médico responsável, empresa, CNPJ, datas
importantes, advogado e número da OAB. O resultado compõe o índice interno
pesquisável (tabela `documents.extracted_json`).
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

CPF_RE = re.compile(r"\b\d{3}\.\d{3}\.\d{3}-\d{2}\b")
CPF_DIGITS_RE = re.compile(r"\b\d{11}\b")
CNPJ_RE = re.compile(r"\b\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}\b")
RG_RE = re.compile(r"\b\d{1,2}\.?\d{3}\.?\d{3}-?[\dXx]\b")
PROCESSO_CNJ_RE = re.compile(r"\b\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4}\b")
NB_RE = re.compile(r"\b(?:NB|N\.?B\.?|Benef[ií]cio)\s*[:\-]?\s*(\d{3}\.?\d{3}\.?\d{3}-?\d)\b", re.IGNORECASE)
CID_RE = re.compile(r"\b([A-Z]\d{2}(?:\.\d)?)\b")
OAB_RE = re.compile(r"\bOAB[/\-]?\s*([A-Z]{2})\s*[:\-]?\s*(\d{2,6})\b", re.IGNORECASE)
DATE_RE = re.compile(r"\b(\d{2})[/\-](\d{2})[/\-](\d{4})\b")
MEDICO_RE = re.compile(r"\b(?:Dr\.?a?\.?|Doutor|Doutora)[ \t]+([A-ZÀ-Ú][\wÀ-ú]+(?:[ \t]+[A-ZÀ-Ú][\wÀ-ú]+){0,4})")
ADVOGADO_RE = re.compile(
    r"\bAdvogad[oa][ \t]*[:\-]?[ \t]*([A-ZÀ-Ú][\wÀ-ú]+(?:[ \t]+[A-ZÀ-Ú][\wÀ-ú]+){0,4})", re.IGNORECASE
)
EMPRESA_RE = re.compile(
    r"\b([A-ZÀ-Ú][\wÀ-ú.&]+(?:[ \t]+[A-ZÀ-Ú][\wÀ-ú.&]+)*[ \t]+"
    r"(?:LTDA|S\/A|S\.A\.|EIRELI|ME|EPP))\b"
)
NOME_LABEL_RE = re.compile(
    r"\b(?:Nome|Nome do Cliente|Reclamante|Requerente|Autor[a]?)[ \t]*[:\-][ \t]*"
    r"([A-ZÀ-Ú][\wÀ-ú]+(?:[ \t]+[A-ZÀ-Ú][\wÀ-ú]+){1,5})",
    re.IGNORECASE,
)


@dataclass
class ExtractedData:
    nome_cliente: str | None = None
    cpf: str | None = None
    rg: str | None = None
    numero_beneficio: str | None = None
    numero_processo: str | None = None
    cid: str | None = None
    medico_responsavel: str | None = None
    empresa: str | None = None
    cnpj: str | None = None
    datas: list[str] = field(default_factory=list)
    advogado: str | None = None
    numero_oab: str | None = None

    def to_dict(self) -> dict:
        return {
            "nome_cliente": self.nome_cliente,
            "cpf": self.cpf,
            "rg": self.rg,
            "numero_beneficio": self.numero_beneficio,
            "numero_processo": self.numero_processo,
            "cid": self.cid,
            "medico_responsavel": self.medico_responsavel,
            "empresa": self.empresa,
            "cnpj": self.cnpj,
            "datas": self.datas,
            "advogado": self.advogado,
            "numero_oab": self.numero_oab,
        }


def _first(pattern: re.Pattern, text: str) -> str | None:
    m = pattern.search(text)
    return m.group(1) if m and m.groups() else (m.group(0) if m else None)


def extract_fields(text: str, known_client_name: str | None = None) -> ExtractedData:
    """Extrai campos estruturados de um texto (tipicamente vindo do OCR).

    `known_client_name`: quando o documento já pertence a uma pasta de
    cliente conhecida, usamos esse nome como valor mais confiável em vez de
    tentar adivinhar via regex (que é propenso a falso positivo em nomes).
    """
    text = text or ""

    cnpj = _first(CNPJ_RE, text)
    cpf_match = CPF_RE.search(text)
    cpf = cpf_match.group(0) if cpf_match else None

    oab_match = OAB_RE.search(text)
    oab = f"{oab_match.group(1).upper()}{oab_match.group(2)}" if oab_match else None

    nb_match = NB_RE.search(text)
    numero_beneficio = nb_match.group(1) if nb_match else None

    processo_match = PROCESSO_CNJ_RE.search(text)
    numero_processo = processo_match.group(0) if processo_match else None

    cid = None
    cid_match = CID_RE.search(text)
    if cid_match and "CID" in text.upper():
        cid = cid_match.group(1)

    medico = _first(MEDICO_RE, text)
    advogado = _first(ADVOGADO_RE, text)
    empresa = _first(EMPRESA_RE, text)

    nome_cliente = known_client_name or _first(NOME_LABEL_RE, text)

    rg = None
    rg_match = RG_RE.search(text)
    if rg_match and not CPF_DIGITS_RE.fullmatch(re.sub(r"[.\-]", "", rg_match.group(0))):
        rg = rg_match.group(0)

    datas = sorted({f"{d}/{m}/{y}" for d, m, y in DATE_RE.findall(text)})

    return ExtractedData(
        nome_cliente=nome_cliente,
        cpf=cpf,
        rg=rg,
        numero_beneficio=numero_beneficio,
        numero_processo=numero_processo,
        cid=cid,
        medico_responsavel=medico,
        empresa=empresa,
        cnpj=cnpj,
        datas=datas,
        advogado=advogado,
        numero_oab=oab,
    )

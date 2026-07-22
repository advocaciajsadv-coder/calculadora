"""Provedores de IA para classificação e extração de dados.

O produto exige funcionamento 100% offline por padrão ("Nenhum documento
poderá ser enviado para servidores externos sem autorização do usuário").
Por isso o provedor padrão (`local`) é totalmente baseado em regras/heurística
e nunca sai da máquina. O provedor `openai` só é usado se o usuário
configurar explicitamente uma chave de API E autorizar envio externo
(`ai_allowed_to_send_external = True`), servindo para casos ambíguos que a
heurística local não resolveu com confiança suficiente.
"""
from __future__ import annotations

import json
from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.modules.classification.rules import RULES, ClassificationRule


@dataclass
class ClassificationResult:
    doc_type: str | None
    category: str | None
    subcategory: str | None
    confidence: float  # 0.0 a 1.0
    source: str  # "regra", "aprendizado", "ia_local", "ia_openai"


class AIProvider(ABC):
    name: str = "base"

    @abstractmethod
    def classify(self, text: str, filename: str) -> ClassificationResult:
        ...


def _normalize(text: str) -> str:
    import unicodedata

    text = text.lower()
    text = "".join(
        c for c in unicodedata.normalize("NFKD", text) if not unicodedata.combining(c)
    )
    return text


def score_rules(text: str, filename: str) -> list[tuple[ClassificationRule, float]]:
    """Pontua todas as regras contra o texto/nome do arquivo.

    A confiança é derivada de quantas palavras-chave batem e se o termo
    apareceu no nome do arquivo (sinal mais forte) ou no corpo do texto.
    """
    haystack_text = _normalize(text or "")
    haystack_name = _normalize(filename or "")
    scored: list[tuple[ClassificationRule, float]] = []

    for rule in RULES:
        best = 0.0
        for kw in rule.keywords:
            kw_norm = _normalize(kw)
            if kw_norm in haystack_name:
                best = max(best, 0.97)
            elif kw_norm in haystack_text:
                best = max(best, 0.85)
        if best > 0:
            scored.append((rule, best))

    scored.sort(key=lambda pair: pair[1], reverse=True)
    return scored


class LocalHeuristicProvider(AIProvider):
    """Provedor 100% offline baseado em regras/palavras-chave.

    É o "modelo local" citado na arquitetura (substituível por um LLM local
    real, como um modelo GGUF via llama.cpp, sem mudar a interface pública).
    """

    name = "local"

    def classify(self, text: str, filename: str) -> ClassificationResult:
        scored = score_rules(text, filename)
        if not scored:
            return ClassificationResult(None, None, None, 0.0, "ia_local")
        rule, confidence = scored[0]
        return ClassificationResult(rule.doc_type, rule.category, rule.subcategory, confidence, "ia_local")


class OpenAIProvider(AIProvider):
    """Provedor opcional via API da OpenAI (GPT-5.5 ou modelo configurado).

    Só deve ser instanciado quando o usuário configurou `ai_provider=openai`
    e `ai_allowed_to_send_external=True`. Import do SDK é feito de forma
    tardia para que o app funcione mesmo sem o pacote `openai` instalado.
    """

    name = "openai"

    def __init__(self, api_key: str, model: str = "gpt-5.5"):
        self.api_key = api_key
        self.model = model

    def classify(self, text: str, filename: str) -> ClassificationResult:
        try:
            from openai import OpenAI
        except ImportError as exc:  # pragma: no cover
            raise RuntimeError(
                "Pacote 'openai' não instalado. Rode 'pip install openai' ou use o provedor local."
            ) from exc

        doc_types = sorted({rule.doc_type for rule in RULES})
        client = OpenAI(api_key=self.api_key)
        prompt = (
            "Você é um classificador de documentos jurídicos de um escritório de advocacia. "
            f"Classifique o documento abaixo em UM destes tipos: {', '.join(doc_types)} ou 'DESCONHECIDO'. "
            "Responda APENAS um JSON no formato "
            '{"doc_type": "...", "confidence": 0.0} sem texto adicional.\n\n'
            f"Nome do arquivo: {filename}\n"
            f"Texto extraído (trecho): {text[:3000]}"
        )
        response = client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
        )
        content = response.choices[0].message.content or "{}"
        try:
            data = json.loads(content)
        except json.JSONDecodeError:
            return ClassificationResult(None, None, None, 0.0, "ia_openai")

        doc_type = data.get("doc_type")
        confidence = float(data.get("confidence", 0.0))
        rule = next((r for r in RULES if r.doc_type == doc_type), None)
        if rule is None:
            return ClassificationResult(None, None, None, confidence, "ia_openai")
        return ClassificationResult(rule.doc_type, rule.category, rule.subcategory, confidence, "ia_openai")


def build_provider(config) -> AIProvider:
    """Fábrica do provedor de IA a partir da configuração do app."""
    if config.ai_provider == "openai" and config.ai_allowed_to_send_external and config.openai_api_key:
        return OpenAIProvider(api_key=config.openai_api_key, model=config.openai_model)
    return LocalHeuristicProvider()

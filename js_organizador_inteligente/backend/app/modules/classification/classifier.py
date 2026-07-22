"""Classificador de documentos: orquestra regras, aprendizado e IA.

Pipeline de decisão:
1. Roda a heurística local baseada em regras/palavras-chave.
2. Se houver preferência aprendida do usuário para o doc_type detectado
   (o usuário moveu manualmente documentos desse tipo para outro lugar),
   essa preferência tem prioridade sobre a pasta padrão da regra.
3. Se a confiança da heurística local for baixa e um provedor de IA externo
   estiver habilitado e autorizado, consulta-o para tentar resolver o caso.
4. Documentos com confiança final < limiar configurado (padrão 90%) vão
   para "99 - Não Identificados".
"""
from __future__ import annotations

from dataclasses import dataclass

from app.config import AppConfig
from app.database.repository import PreferenceRepository
from app.modules.classification.ai_provider import (
    AIProvider,
    ClassificationResult,
    LocalHeuristicProvider,
    build_provider,
)

NOT_IDENTIFIED_CATEGORY = "99 - Não Identificados"


@dataclass
class FinalClassification:
    doc_type: str | None
    category: str
    subcategory: str | None
    confidence: float
    source: str
    identified: bool


class DocumentClassifier:
    def __init__(self, config: AppConfig, preference_repo: PreferenceRepository | None = None,
                 provider: AIProvider | None = None):
        self.config = config
        self.preference_repo = preference_repo
        self.local_provider = LocalHeuristicProvider()
        self.external_provider = provider or build_provider(config)

    def classify(self, text: str, filename: str) -> FinalClassification:
        result: ClassificationResult = self.local_provider.classify(text, filename)

        if (
            result.confidence < self.config.confidence_threshold
            and self.external_provider.name != "local"
        ):
            try:
                ai_result = self.external_provider.classify(text, filename)
                if ai_result.confidence > result.confidence:
                    result = ai_result
            except Exception:
                # Falhas no provedor externo (rede, chave inválida, etc.) nunca
                # devem interromper o pipeline: seguimos com o resultado local.
                pass

        category = result.category
        subcategory = result.subcategory

        if result.doc_type and self.preference_repo is not None:
            learned = self.preference_repo.best_for(result.doc_type)
            if learned:
                category = learned["target_category"]
                subcategory = learned["target_subcategory"]
                result = ClassificationResult(
                    result.doc_type, category, subcategory, result.confidence, "aprendizado"
                )

        identified = result.confidence >= self.config.confidence_threshold and category is not None
        if not identified:
            return FinalClassification(
                doc_type=result.doc_type,
                category=NOT_IDENTIFIED_CATEGORY,
                subcategory=None,
                confidence=result.confidence,
                source=result.source,
                identified=False,
            )

        return FinalClassification(
            doc_type=result.doc_type,
            category=category,
            subcategory=subcategory,
            confidence=result.confidence,
            source=result.source,
            identified=True,
        )

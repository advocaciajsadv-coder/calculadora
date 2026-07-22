"""Aprendizado de preferências do usuário.

Se o usuário mover manualmente um documento para outra categoria/subpasta,
essa preferência é registrada e passa a ter prioridade sobre a pasta padrão
da regra para aquele tipo de documento em organizações futuras (usado pelo
`DocumentClassifier`, ver modules/classification/classifier.py).
"""
from __future__ import annotations

from app.database.repository import DocumentRepository, MovementRepository, PreferenceRepository
from app.modules.folder_organizer.structure import CLIENT_FOLDER_STRUCTURE


class PreferenceLearner:
    def __init__(self, preference_repo: PreferenceRepository, document_repo: DocumentRepository,
                 movement_repo: MovementRepository):
        self.preference_repo = preference_repo
        self.document_repo = document_repo
        self.movement_repo = movement_repo

    def register_manual_move(self, document_id: int, new_category: str, new_subcategory: str | None) -> None:
        """Chamado pela API quando o usuário arrasta um documento para outra pasta na UI."""
        if new_category not in CLIENT_FOLDER_STRUCTURE:
            raise KeyError(f"Categoria desconhecida: {new_category!r}")

        document = self.document_repo.get(document_id)
        if document is None:
            raise ValueError(f"Documento {document_id} não encontrado.")

        doc_type = document.get("doc_type")
        if doc_type:
            self.preference_repo.upsert(doc_type, new_category, new_subcategory)

        self.movement_repo.add(
            document_id=document_id,
            from_path=document["current_path"],
            to_path=None,
            action="movido_manualmente",
            source="usuario",
        )

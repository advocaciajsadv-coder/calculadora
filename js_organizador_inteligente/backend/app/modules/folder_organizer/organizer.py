"""Orquestrador central: o pipeline completo de organização inteligente.

Para cada arquivo solto que o usuário arrasta/seleciona:
1. Calcula hash e verifica duplicidade.
2. Converte para PDF quando necessário (JPG/JPEG/PNG/DOC/DOCX).
3. Aplica OCR (se for PDF digitalizado) tornando-o pesquisável.
4. Extrai texto e dados estruturados (CPF, RG, CID, processo, etc.).
5. Classifica o documento (regras + aprendizado + IA) com limiar de 90%.
6. Renomeia seguindo o padrão do tipo de documento.
7. Move para a pasta de destino dentro da estrutura fixa do cliente.
8. Indexa no banco (índice pesquisável) e registra histórico/backup/log.

O usuário só precisa arrastar uma pasta ou selecionar uma pasta existente;
tudo o mais é automático.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

from app.config import AppConfig
from app.database.repository import DocumentRepository, LogRepository, MovementRepository, PreferenceRepository
from app.modules.backup.backup_manager import BackupManager
from app.modules.classification.classifier import DocumentClassifier
from app.modules.conversion.converter import ConversionError, convert_to_pdf, needs_conversion
from app.modules.duplicates.duplicate_detector import check_duplicate, compute_hash, resolve_duplicate_name
from app.modules.extraction.extractor import extract_fields
from app.modules.folder_organizer.structure import target_folder
from app.modules.logs.logger import LiveLogger
from app.modules.ocr.ocr_engine import OCRError, apply_ocr, extract_text
from app.modules.renaming.renamer import build_new_name, resolve_collision

SUPPORTED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"}

ProgressCallback = Callable[[str, int, int], None]


@dataclass
class FileProcessingResult:
    original_path: str
    final_path: str | None
    doc_type: str | None
    category: str | None
    subcategory: str | None
    confidence: float
    duplicate: bool
    skipped_reason: str | None = None


@dataclass
class OrganizeSummary:
    total: int = 0
    processados: int = 0
    duplicados: int = 0
    nao_identificados: int = 0
    erros: int = 0
    resultados: list[FileProcessingResult] = field(default_factory=list)


class DocumentOrganizer:
    def __init__(
        self,
        config: AppConfig,
        document_repo: DocumentRepository,
        movement_repo: MovementRepository,
        preference_repo: PreferenceRepository,
        logger: LiveLogger,
        backup_manager: BackupManager,
    ):
        self.config = config
        self.document_repo = document_repo
        self.movement_repo = movement_repo
        self.preference_repo = preference_repo
        self.logger = logger
        self.backup_manager = backup_manager
        self.classifier = DocumentClassifier(config, preference_repo)

    def process_folder(
        self,
        client_id: int,
        client_name: str,
        client_root: Path,
        source_folder: Path,
        duplicate_policy: str | None = None,
        progress_callback: ProgressCallback | None = None,
    ) -> OrganizeSummary:
        duplicate_policy = duplicate_policy or self.config.default_duplicate_policy
        files = sorted(p for p in source_folder.rglob("*") if p.is_file() and p.suffix.lower() in SUPPORTED_EXTENSIONS)

        summary = OrganizeSummary(total=len(files))
        self.logger.info("organizador", f"Iniciando organização de {len(files)} arquivo(s) para '{client_name}'.")

        for index, file_path in enumerate(files, start=1):
            if progress_callback:
                progress_callback(file_path.name, index, len(files))
            try:
                result = self._process_single_file(client_id, client_name, client_root, file_path, duplicate_policy)
                summary.resultados.append(result)
                if result.duplicate:
                    summary.duplicados += 1
                elif result.category == "99 - Não Identificados":
                    summary.nao_identificados += 1
                    summary.processados += 1
                else:
                    summary.processados += 1
            except Exception as exc:  # nunca deixamos um arquivo travar o lote inteiro
                summary.erros += 1
                self.logger.erro("organizador", f"Falha ao processar '{file_path.name}': {exc}")
                summary.resultados.append(
                    FileProcessingResult(
                        original_path=str(file_path), final_path=None, doc_type=None,
                        category=None, subcategory=None, confidence=0.0, duplicate=False,
                        skipped_reason=str(exc),
                    )
                )

        self.logger.sucesso(
            "organizador",
            f"Organização concluída: {summary.processados} processado(s), "
            f"{summary.duplicados} duplicado(s), {summary.nao_identificados} não identificado(s), "
            f"{summary.erros} erro(s).",
        )
        return summary

    def _process_single_file(
        self, client_id: int, client_name: str, client_root: Path, file_path: Path, duplicate_policy: str,
    ) -> FileProcessingResult:
        original_name = file_path.name

        # 1. Converte para PDF quando aplicável.
        working_path = file_path
        if needs_conversion(file_path):
            try:
                working_path = convert_to_pdf(
                    file_path,
                    delete_original=self.config.delete_originals_after_conversion,
                    libreoffice_cmd=self.config.libreoffice_cmd,
                )
                self.logger.info("conversao", f"'{original_name}' convertido para PDF.")
            except ConversionError as exc:
                self.logger.aviso("conversao", f"Não foi possível converter '{original_name}': {exc}")

        # 2. OCR (se PDF).
        ocr_text = ""
        if working_path.suffix.lower() == ".pdf":
            try:
                apply_ocr(working_path, language=self.config.ocr_language)
                ocr_text = extract_text(working_path, language=self.config.ocr_language)
                self.logger.info("ocr", f"OCR aplicado em '{working_path.name}'.")
            except OCRError as exc:
                self.logger.aviso("ocr", f"OCR indisponível para '{working_path.name}': {exc}")

        # 3. Duplicidade (baseada no conteúdo final, já convertido).
        file_hash = compute_hash(working_path)
        dup_check = check_duplicate(self.document_repo, client_id, file_hash)
        is_duplicate = dup_check.is_duplicate
        if is_duplicate:
            handled = self._handle_duplicate(working_path, dup_check.existing_document, duplicate_policy)
            if handled is None:
                return FileProcessingResult(
                    original_path=str(file_path), final_path=None,
                    doc_type=dup_check.existing_document.get("doc_type"),
                    category=dup_check.existing_document.get("category"),
                    subcategory=dup_check.existing_document.get("subcategory"),
                    confidence=1.0, duplicate=True, skipped_reason="duplicado_ignorado",
                )
            working_path = handled  # 'manter_ambos' segue o pipeline com nome alternativo

        # 4. Extração de dados estruturados.
        extracted = extract_fields(ocr_text, known_client_name=client_name)

        # 5. Classificação.
        classification = self.classifier.classify(ocr_text, original_name)

        # 6. Renomeação.
        new_name = build_new_name(classification.doc_type, extracted, working_path.suffix)

        # 7. Move para a pasta de destino.
        dest_dir = target_folder(client_root.parent, client_name, classification.category, classification.subcategory)
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_path = resolve_collision(dest_dir, new_name)
        working_path.replace(dest_path)

        # 8. Indexação + histórico + backup + log.
        document = self.document_repo.create(
            client_id=client_id,
            original_name=original_name,
            current_name=dest_path.name,
            current_path=str(dest_path),
            doc_type=classification.doc_type,
            category=classification.category,
            subcategory=classification.subcategory,
            confidence=classification.confidence,
            extracted=extracted.to_dict(),
            ocr_text=ocr_text,
            hash_sha256=file_hash,
        )
        self.movement_repo.add(document["id"], str(file_path), str(dest_path), action="importado")
        self.backup_manager.backup_document(document["id"], dest_path, reason="importacao")

        if not classification.identified:
            self.logger.aviso(
                "classificacao",
                f"'{original_name}' não identificado com confiança suficiente "
                f"({classification.confidence:.0%}) — movido para 99 - Não Identificados.",
            )
        else:
            self.logger.sucesso(
                "classificacao",
                f"'{original_name}' identificado como '{classification.doc_type}' "
                f"({classification.confidence:.0%}) → {classification.category}"
                + (f"/{classification.subcategory}" if classification.subcategory else ""),
            )

        return FileProcessingResult(
            original_path=str(file_path),
            final_path=str(dest_path),
            doc_type=classification.doc_type,
            category=classification.category,
            subcategory=classification.subcategory,
            confidence=classification.confidence,
            duplicate=is_duplicate,
            skipped_reason=f"duplicado_{duplicate_policy}" if is_duplicate else None,
        )

    def _handle_duplicate(self, working_path: Path, existing_document: dict, policy: str) -> Path | None:
        if policy == "ignorar":
            self.logger.aviso("duplicidade", f"'{working_path.name}' ignorado (duplicata de '{existing_document['current_name']}').")
            working_path.unlink(missing_ok=True)
            return None

        if policy == "substituir":
            existing_path = Path(existing_document["current_path"])
            self.backup_manager.backup_document(existing_document["id"], existing_path, reason="antes_de_substituir")
            existing_path.unlink(missing_ok=True)
            self.document_repo.set_status(existing_document["id"], "substituido")
            self.logger.aviso("duplicidade", f"'{existing_document['current_name']}' substituído por '{working_path.name}'.")
            return working_path

        # manter_ambos: segue o pipeline normalmente; a colisão de nome é resolvida na etapa de mover.
        self.logger.info("duplicidade", f"'{working_path.name}' mantido junto com a duplicata existente.")
        return working_path

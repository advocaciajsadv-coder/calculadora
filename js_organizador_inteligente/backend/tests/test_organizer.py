from pathlib import Path

import pytest

from app.database.repository import (
    ClientRepository,
    DocumentRepository,
    LogRepository,
    MovementRepository,
    PreferenceRepository,
)
from app.modules.backup.backup_manager import BackupManager
from app.modules.folder_organizer.organizer import DocumentOrganizer
from app.modules.folder_organizer.structure import create_client_structure
from app.modules.logs.logger import LiveLogger


@pytest.fixture()
def organizer(tmp_config, db, monkeypatch):
    # OCR/tesseract não está disponível na sandbox de testes: fixamos o
    # comportamento para que o pipeline seja exercitado ponta a ponta usando
    # apenas o nome do arquivo para classificação (como acontece de fato
    # quando o PDF já tem camada de texto vazia/reconhecível).
    monkeypatch.setattr("app.modules.folder_organizer.organizer.apply_ocr", lambda *a, **k: None)
    monkeypatch.setattr("app.modules.folder_organizer.organizer.extract_text", lambda *a, **k: "")

    document_repo = DocumentRepository(db)
    movement_repo = MovementRepository(db)
    preference_repo = PreferenceRepository(db)
    client_repo = ClientRepository(db)
    logger = LiveLogger(LogRepository(db))
    backup_manager = BackupManager(db, tmp_config.backups_dir, tmp_config.trash_dir)

    organizer = DocumentOrganizer(tmp_config, document_repo, movement_repo, preference_repo, logger, backup_manager)
    organizer.client_repo = client_repo  # exposto apenas para os testes criarem clientes
    return organizer


def test_process_folder_classifies_renames_and_moves(tmp_path, organizer):
    root = tmp_path / "clientes"
    root.mkdir()
    base = create_client_structure(root, "João da Silva")
    client = organizer.client_repo.create("João da Silva", str(base))

    source = tmp_path / "entrada"
    source.mkdir()
    (source / "RG - joao.pdf").write_bytes(b"%PDF-1.4 conteudo de teste")
    (source / "arquivo_aleatorio.pdf").write_bytes(b"%PDF-1.4 sem palavras chave conhecidas")

    summary = organizer.process_folder(
        client_id=client["id"], client_name="João da Silva", client_root=base, source_folder=source,
    )

    assert summary.total == 2
    assert summary.processados == 2
    assert summary.erros == 0

    rg_result = next(r for r in summary.resultados if "RG" in r.original_path)
    assert rg_result.category == "01 - Documentos Pessoais"
    assert rg_result.subcategory == "Identificação"
    assert Path(rg_result.final_path).exists()

    unknown_result = next(r for r in summary.resultados if "arquivo_aleatorio" in r.original_path)
    assert unknown_result.category == "99 - Não Identificados"


def test_process_folder_detects_duplicate_and_keeps_both(tmp_path, organizer):
    root = tmp_path / "clientes"
    root.mkdir()
    base = create_client_structure(root, "Maria")
    client = organizer.client_repo.create("Maria", str(base))

    source1 = tmp_path / "entrada1"
    source1.mkdir()
    (source1 / "CPF - maria.pdf").write_bytes(b"%PDF-1.4 mesmo conteudo")

    organizer.process_folder(client_id=client["id"], client_name="Maria", client_root=base, source_folder=source1)

    source2 = tmp_path / "entrada2"
    source2.mkdir()
    (source2 / "CPF - maria.pdf").write_bytes(b"%PDF-1.4 mesmo conteudo")

    summary2 = organizer.process_folder(
        client_id=client["id"], client_name="Maria", client_root=base, source_folder=source2,
        duplicate_policy="manter_ambos",
    )
    assert summary2.duplicados == 1

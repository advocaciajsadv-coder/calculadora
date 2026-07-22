from pathlib import Path

from app.modules.extraction.extractor import ExtractedData
from app.modules.renaming.renamer import build_new_name, resolve_collision, sanitize_filename


def test_build_new_name_simple_document():
    extracted = ExtractedData(nome_cliente="João da Silva")
    name = build_new_name("RG", extracted, ".pdf")
    assert name == "RG - João da Silva.pdf"


def test_build_new_name_with_medico_and_data():
    extracted = ExtractedData(nome_cliente="João da Silva", medico_responsavel="Carlos", datas=["15/03/2026"])
    name = build_new_name("Laudo Médico", extracted, ".pdf")
    assert name == "Laudo Médico - João da Silva - Carlos - 15-03-2026.pdf"


def test_build_new_name_without_client_name_omits_gap():
    extracted = ExtractedData()
    name = build_new_name("Petição Inicial", extracted, ".pdf")
    assert name == "Petição Inicial.pdf"


def test_build_new_name_unknown_doc_type_falls_back():
    extracted = ExtractedData(nome_cliente="Maria")
    name = build_new_name(None, extracted, ".pdf")
    assert name == "Documento - Maria.pdf"


def test_sanitize_filename_removes_invalid_chars():
    cleaned = sanitize_filename('Nome<>:"/\\|?*Teste')
    assert cleaned == "NomeTeste"


def test_resolve_collision_appends_counter(tmp_path):
    (tmp_path / "Contrato.pdf").write_text("x")
    resolved = resolve_collision(tmp_path, "Contrato.pdf")
    assert resolved == tmp_path / "Contrato (2).pdf"

    (tmp_path / "Contrato (2).pdf").write_text("x")
    resolved = resolve_collision(tmp_path, "Contrato.pdf")
    assert resolved == tmp_path / "Contrato (3).pdf"


def test_resolve_collision_no_conflict(tmp_path):
    resolved = resolve_collision(tmp_path, "Novo.pdf")
    assert resolved == tmp_path / "Novo.pdf"

from app.modules.duplicates.duplicate_detector import check_duplicate, compute_hash


def test_compute_hash_is_deterministic(tmp_path):
    f1 = tmp_path / "a.pdf"
    f2 = tmp_path / "b.pdf"
    f1.write_bytes(b"conteudo identico")
    f2.write_bytes(b"conteudo identico")
    assert compute_hash(f1) == compute_hash(f2)


def test_compute_hash_differs_for_different_content(tmp_path):
    f1 = tmp_path / "a.pdf"
    f2 = tmp_path / "b.pdf"
    f1.write_bytes(b"conteudo A")
    f2.write_bytes(b"conteudo B")
    assert compute_hash(f1) != compute_hash(f2)


def test_check_duplicate_detects_existing_document(repos, tmp_path):
    client = repos["clients"].create("Cliente Teste", str(tmp_path))
    f = tmp_path / "doc.pdf"
    f.write_bytes(b"conteudo")
    file_hash = compute_hash(f)

    repos["documents"].create(
        client_id=client["id"], original_name="doc.pdf", current_name="RG - Cliente.pdf",
        current_path=str(f), doc_type="RG", category="01 - Documentos Pessoais",
        subcategory="Identificação", confidence=0.97, extracted={}, ocr_text="", hash_sha256=file_hash,
    )

    result = check_duplicate(repos["documents"], client["id"], file_hash)
    assert result.is_duplicate is True
    assert result.existing_document["doc_type"] == "RG"


def test_check_duplicate_no_match(repos, tmp_path):
    client = repos["clients"].create("Cliente Teste", str(tmp_path))
    result = check_duplicate(repos["documents"], client["id"], "hash_inexistente")
    assert result.is_duplicate is False

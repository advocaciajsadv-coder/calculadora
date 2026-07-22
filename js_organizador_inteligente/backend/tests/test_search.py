from app.modules.search.nl_search import execute_query, parse_query


def test_parse_query_listar_cnis():
    intent = parse_query("Mostrar todos os CNIS.")
    assert intent.kind == "listar"
    assert intent.doc_type == "CNIS"


def test_parse_query_existe_procuracao():
    intent = parse_query("Existe procuração?")
    assert intent.kind == "existe"
    assert intent.doc_type == "Procuração"


def test_parse_query_campo_cid():
    intent = parse_query("Qual o CID do cliente?")
    assert intent.kind == "campo"
    assert intent.field == "cid"


def test_parse_query_categoria_assinados():
    intent = parse_query("Mostrar documentos assinados.")
    assert intent.kind == "categoria"
    assert intent.category == "04 - Documentos Assinados"


def test_parse_query_duplicados():
    intent = parse_query("Há documentos duplicados?")
    assert intent.kind == "duplicados"


def test_execute_query_listar_returns_matching_documents(repos, tmp_path):
    client = repos["clients"].create("Cliente Teste", str(tmp_path))
    repos["documents"].create(
        client_id=client["id"], original_name="a.pdf", current_name="CNIS - Cliente.pdf",
        current_path=str(tmp_path / "a.pdf"), doc_type="CNIS", category="05 - Documentos do Caso",
        subcategory="Previdenciário", confidence=0.97, extracted={}, ocr_text="", hash_sha256="h1",
    )
    repos["documents"].create(
        client_id=client["id"], original_name="b.pdf", current_name="RG - Cliente.pdf",
        current_path=str(tmp_path / "b.pdf"), doc_type="RG", category="01 - Documentos Pessoais",
        subcategory="Identificação", confidence=0.97, extracted={}, ocr_text="", hash_sha256="h2",
    )

    result = execute_query(repos["documents"], repos["movements"], client["id"], "Mostrar todos os CNIS.")
    assert result["intent"] == "listar"
    assert len(result["resultados"]) == 1
    assert result["resultados"][0]["doc_type"] == "CNIS"


def test_execute_query_campo_returns_extracted_value(repos, tmp_path):
    client = repos["clients"].create("Cliente Teste", str(tmp_path))
    repos["documents"].create(
        client_id=client["id"], original_name="a.pdf", current_name="Laudo Médico - Cliente.pdf",
        current_path=str(tmp_path / "a.pdf"), doc_type="Laudo Médico", category="05 - Documentos do Caso",
        subcategory="Médico", confidence=0.97, extracted={"cid": "M54.5"}, ocr_text="", hash_sha256="h3",
    )
    result = execute_query(repos["documents"], repos["movements"], client["id"], "Qual o CID do cliente?")
    assert result["intent"] == "campo"
    assert result["valores"][0]["valor"] == "M54.5"

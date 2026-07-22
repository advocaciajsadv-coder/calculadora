from app.modules.extraction.extractor import extract_fields

SAMPLE_TEXT = """
LAUDO MEDICO PERICIAL
Nome: Maria Aparecida dos Santos
CPF: 123.456.789-00
RG: 12.345.678-9
Processo n. 0001234-56.2025.5.02.0001
NB: 623.456.789-0
CID: M54.5
Dr. Carlos Eduardo Pereira
Advogado: José Roberto Advogado
OAB/SP 123456
Empresa XYZ COMERCIO LTDA
CNPJ: 12.345.678/0001-90
Data do exame: 15/03/2026
"""


def test_extract_cpf():
    data = extract_fields(SAMPLE_TEXT)
    assert data.cpf == "123.456.789-00"


def test_extract_cnpj():
    data = extract_fields(SAMPLE_TEXT)
    assert data.cnpj == "12.345.678/0001-90"


def test_extract_processo_cnj():
    data = extract_fields(SAMPLE_TEXT)
    assert data.numero_processo == "0001234-56.2025.5.02.0001"


def test_extract_numero_beneficio():
    data = extract_fields(SAMPLE_TEXT)
    assert data.numero_beneficio == "623.456.789-0"


def test_extract_cid():
    data = extract_fields(SAMPLE_TEXT)
    assert data.cid == "M54.5"


def test_extract_medico():
    data = extract_fields(SAMPLE_TEXT)
    assert data.medico_responsavel == "Carlos Eduardo Pereira"


def test_extract_oab():
    data = extract_fields(SAMPLE_TEXT)
    assert data.numero_oab == "SP123456"


def test_extract_datas():
    data = extract_fields(SAMPLE_TEXT)
    assert "15/03/2026" in data.datas


def test_known_client_name_overrides_regex():
    data = extract_fields(SAMPLE_TEXT, known_client_name="Cliente Conhecido")
    assert data.nome_cliente == "Cliente Conhecido"

from app.modules.classification.ai_provider import LocalHeuristicProvider
from app.modules.classification.classifier import DocumentClassifier, NOT_IDENTIFIED_CATEGORY


def test_local_provider_matches_by_filename():
    provider = LocalHeuristicProvider()
    result = provider.classify(text="", filename="RG - João da Silva.pdf")
    assert result.doc_type == "RG"
    assert result.category == "01 - Documentos Pessoais"
    assert result.subcategory == "Identificação"
    assert result.confidence >= 0.9


def test_local_provider_matches_cnis_by_text():
    provider = LocalHeuristicProvider()
    result = provider.classify(text="CADASTRO NACIONAL DE INFORMACOES SOCIAIS - CNIS", filename="arquivo123.pdf")
    assert result.doc_type == "CNIS"
    assert result.category == "05 - Documentos do Caso"
    assert result.subcategory == "Previdenciário"


def test_classifier_sends_unknown_documents_to_not_identified(tmp_config, repos):
    classifier = DocumentClassifier(tmp_config, repos["preferences"])
    result = classifier.classify(text="documento qualquer sem palavras-chave conhecidas", filename="scan001.pdf")
    assert result.identified is False
    assert result.category == NOT_IDENTIFIED_CATEGORY


def test_classifier_respects_confidence_threshold(tmp_config, repos):
    tmp_config.confidence_threshold = 0.99
    classifier = DocumentClassifier(tmp_config, repos["preferences"])
    result = classifier.classify(text="", filename="Procuração.pdf")
    # 0.97 de confiança no nome do arquivo é menor que o limiar de 0.99
    assert result.identified is False


def test_classifier_applies_learned_preference(tmp_config, repos):
    repos["preferences"].upsert("Procuração", "04 - Documentos Assinados", "ZapSign")
    classifier = DocumentClassifier(tmp_config, repos["preferences"])
    result = classifier.classify(text="", filename="Procuração.pdf")
    assert result.category == "04 - Documentos Assinados"
    assert result.subcategory == "ZapSign"
    assert result.source == "aprendizado"

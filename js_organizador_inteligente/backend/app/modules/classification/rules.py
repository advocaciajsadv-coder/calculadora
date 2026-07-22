"""Base de regras de classificação de documentos.

Cada regra mapeia um tipo de documento (doc_type canônico) para
(categoria, subcategoria) dentro da estrutura fixa de pastas, além de uma
lista de palavras-chave/expressões usadas para reconhecer o documento a
partir do nome do arquivo e/ou do texto extraído por OCR.

A ordem importa: regras mais específicas devem vir antes de regras mais
genéricas quando há sobreposição de palavras-chave.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ClassificationRule:
    doc_type: str          # nome canônico do tipo de documento
    category: str          # pasta principal (ex.: "01 - Documentos Pessoais")
    subcategory: str | None  # subpasta (ex.: "Identificação") ou None
    keywords: tuple[str, ...]  # termos que, se encontrados, indicam este tipo


RULES: tuple[ClassificationRule, ...] = (
    # Documentos Pessoais
    ClassificationRule("RG", "01 - Documentos Pessoais", "Identificação",
                        ("rg", "registro geral", "carteira de identidade", "identidade civil")),
    ClassificationRule("CPF", "01 - Documentos Pessoais", "Identificação",
                        ("cpf", "cadastro de pessoa fisica", "cadastro de pessoa física")),
    ClassificationRule("CNH", "01 - Documentos Pessoais", "Identificação",
                        ("cnh", "carteira nacional de habilitacao", "carteira nacional de habilitação",
                         "carteira de motorista")),
    ClassificationRule("Comprovante de Residência", "01 - Documentos Pessoais", "Endereço",
                        ("comprovante de residencia", "comprovante de residência", "conta de luz",
                         "conta de agua", "conta de água", "fatura de energia", "comprovante de endereco",
                         "comprovante de endereço")),
    ClassificationRule("Certidão de Nascimento", "01 - Documentos Pessoais", "Certidões",
                        ("certidao de nascimento", "certidão de nascimento")),
    ClassificationRule("Certidão de Casamento", "01 - Documentos Pessoais", "Certidões",
                        ("certidao de casamento", "certidão de casamento")),
    ClassificationRule("Certidão de Óbito", "01 - Documentos Pessoais", "Certidões",
                        ("certidao de obito", "certidão de óbito")),

    # Provas
    ClassificationRule("Foto", "02 - Provas", "Fotos",
                        ("foto", "fotografia", "imagem")),
    ClassificationRule("Vídeo", "02 - Provas", "Áudios e Vídeos",
                        ("video", "vídeo", "gravacao de video", "gravação de vídeo")),
    ClassificationRule("Áudio", "02 - Provas", "Áudios e Vídeos",
                        ("audio", "áudio", "gravacao de audio", "gravação de áudio")),
    ClassificationRule("Conversa de WhatsApp", "02 - Provas", "Conversas",
                        ("whatsapp", "conversa de whatsapp", "print de conversa")),
    ClassificationRule("Print", "02 - Provas", "Conversas",
                        ("print", "captura de tela", "screenshot")),

    # Petições
    ClassificationRule("Petição Inicial", "03 - Petições", "Iniciais",
                        ("peticao inicial", "petição inicial", "exordial", "inicial trabalhista")),
    ClassificationRule("Contestação", "03 - Petições", "Manifestações",
                        ("contestacao", "contestação")),
    ClassificationRule("Réplica", "03 - Petições", "Manifestações",
                        ("replica", "réplica", "impugnacao a contestacao", "impugnação à contestação")),
    ClassificationRule("Recurso Ordinário", "03 - Petições", "Recursos",
                        ("recurso ordinario", "recurso ordinário", "ro -")),
    ClassificationRule("Recurso", "03 - Petições", "Recursos",
                        ("recurso especial", "recurso extraordinario", "recurso extraordinário",
                         "agravo de instrumento", "embargos de declaracao", "embargos de declaração")),
    ClassificationRule("Sentença", "03 - Petições", "Decisões",
                        ("sentenca", "sentença")),
    ClassificationRule("Acórdão", "03 - Petições", "Decisões",
                        ("acordao", "acórdão")),

    # Documentos Assinados
    ClassificationRule("Contrato", "04 - Documentos Assinados", "Contratos",
                        ("contrato de honorarios", "contrato de honorários", "contrato social", "contrato")),
    ClassificationRule("Procuração", "04 - Documentos Assinados", "Procurações",
                        ("procuracao", "procuração")),
    ClassificationRule("Declaração", "04 - Documentos Assinados", "Declarações",
                        ("declaracao de hipossuficiencia", "declaração de hipossuficiência", "declaracao",
                         "declaração")),

    # Documentos do Caso
    ClassificationRule("Carteira de Trabalho", "05 - Documentos do Caso", "Trabalhista",
                        ("carteira de trabalho", "ctps")),
    ClassificationRule("Holerite", "05 - Documentos do Caso", "Trabalhista",
                        ("holerite", "contracheque", "recibo de pagamento")),
    ClassificationRule("TRCT", "05 - Documentos do Caso", "Trabalhista",
                        ("trct", "termo de rescisao", "termo de rescisão")),
    ClassificationRule("FGTS", "05 - Documentos do Caso", "Trabalhista",
                        ("fgts", "fundo de garantia", "extrato fgts", "extrato do fgts")),
    ClassificationRule("CNIS", "05 - Documentos do Caso", "Previdenciário",
                        ("cnis", "cadastro nacional de informacoes sociais",
                         "cadastro nacional de informações sociais")),
    ClassificationRule("Extrato do INSS", "05 - Documentos do Caso", "Previdenciário",
                        ("extrato do inss", "extrato inss", "carta de concessao", "carta de concessão")),
    ClassificationRule("Laudo Médico", "05 - Documentos do Caso", "Médico",
                        ("laudo medico", "laudo médico", "laudo pericial")),
    ClassificationRule("Receita Médica", "05 - Documentos do Caso", "Médico",
                        ("receita medica", "receita médica", "prescricao medica", "prescrição médica")),
    ClassificationRule("Atestado", "05 - Documentos do Caso", "Médico",
                        ("atestado medico", "atestado médico", "atestado")),
)


def rules_by_doc_type() -> dict[str, ClassificationRule]:
    return {rule.doc_type: rule for rule in RULES}

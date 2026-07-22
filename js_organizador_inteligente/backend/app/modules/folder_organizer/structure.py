"""Geração automática da estrutura de pastas de um cliente/processo.

Regra de negócio fixa do produto: cada pasta principal tem no máximo
QUATRO subpastas. A estrutura abaixo é a estrutura oficial do JS
Organizador Inteligente e é criada integralmente ao cadastrar um novo
cliente/processo.
"""
from __future__ import annotations

from pathlib import Path

MAX_SUBFOLDERS_PER_MAIN_FOLDER = 4

# Estrutura oficial: pasta principal -> subpastas (até 4 cada).
# As chaves usam o prefixo numérico exigido para a ordenação no explorador
# de arquivos do Windows.
CLIENT_FOLDER_STRUCTURE: dict[str, list[str]] = {
    "01 - Documentos Pessoais": ["Identificação", "Endereço", "Certidões", "Outros"],
    "02 - Provas": ["Fotos", "Conversas", "Áudios e Vídeos", "Documentos"],
    "03 - Petições": ["Iniciais", "Manifestações", "Recursos", "Decisões"],
    "04 - Documentos Assinados": ["Contratos", "Procurações", "Declarações", "ZapSign"],
    "05 - Documentos do Caso": ["Trabalhista", "Previdenciário", "Médico", "Financeiro"],
    "06 - Arquivos Recebidos": [],
    "07 - Arquivos Enviados": [],
    "99 - Não Identificados": [],
}

for _main, _subs in CLIENT_FOLDER_STRUCTURE.items():
    if len(_subs) > MAX_SUBFOLDERS_PER_MAIN_FOLDER:
        raise ValueError(
            f"Pasta principal '{_main}' excede o limite de "
            f"{MAX_SUBFOLDERS_PER_MAIN_FOLDER} subpastas."
        )


def sanitize_folder_name(name: str) -> str:
    """Remove caracteres inválidos em nomes de pasta no Windows."""
    invalid = '<>:"/\\|?*'
    cleaned = "".join(c for c in name if c not in invalid).strip()
    return cleaned or "Sem Nome"


def client_base_path(root: Path | str, client_name: str) -> Path:
    return Path(root) / sanitize_folder_name(client_name)


def create_client_structure(root: Path | str, client_name: str) -> Path:
    """Cria (se não existir) toda a árvore de pastas de um cliente e retorna o caminho base."""
    base = client_base_path(root, client_name)
    base.mkdir(parents=True, exist_ok=True)
    for main_folder, subfolders in CLIENT_FOLDER_STRUCTURE.items():
        main_path = base / main_folder
        main_path.mkdir(exist_ok=True)
        for sub in subfolders:
            (main_path / sub).mkdir(exist_ok=True)
    return base


def target_folder(root: Path | str, client_name: str, category: str, subcategory: str | None) -> Path:
    """Resolve o caminho absoluto de destino para uma (categoria, subcategoria)."""
    base = client_base_path(root, client_name)
    if category not in CLIENT_FOLDER_STRUCTURE:
        raise KeyError(f"Categoria desconhecida: {category!r}")
    path = base / category
    if subcategory:
        allowed = CLIENT_FOLDER_STRUCTURE[category]
        if subcategory not in allowed:
            raise KeyError(
                f"Subcategoria {subcategory!r} inválida para {category!r}. "
                f"Permitidas: {allowed}"
            )
        path = path / subcategory
    return path

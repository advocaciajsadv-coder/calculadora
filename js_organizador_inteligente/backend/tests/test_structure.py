from pathlib import Path

from app.modules.folder_organizer.structure import (
    CLIENT_FOLDER_STRUCTURE,
    MAX_SUBFOLDERS_PER_MAIN_FOLDER,
    create_client_structure,
    target_folder,
)


def test_no_main_folder_exceeds_four_subfolders():
    for main_folder, subfolders in CLIENT_FOLDER_STRUCTURE.items():
        assert len(subfolders) <= MAX_SUBFOLDERS_PER_MAIN_FOLDER, main_folder


def test_create_client_structure_creates_all_folders(tmp_path):
    base = create_client_structure(tmp_path, "João da Silva")
    assert base == tmp_path / "João da Silva"
    for main_folder, subfolders in CLIENT_FOLDER_STRUCTURE.items():
        assert (base / main_folder).is_dir()
        for sub in subfolders:
            assert (base / main_folder / sub).is_dir()


def test_target_folder_resolves_category_and_subcategory(tmp_path):
    create_client_structure(tmp_path, "Maria")
    path = target_folder(tmp_path, "Maria", "01 - Documentos Pessoais", "Identificação")
    assert path == tmp_path / "Maria" / "01 - Documentos Pessoais" / "Identificação"


def test_target_folder_rejects_invalid_subcategory(tmp_path):
    create_client_structure(tmp_path, "Maria")
    try:
        target_folder(tmp_path, "Maria", "01 - Documentos Pessoais", "Subpasta Inexistente")
        assert False, "deveria ter lançado KeyError"
    except KeyError:
        pass

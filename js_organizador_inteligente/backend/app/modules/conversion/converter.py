"""Conversão automática de arquivos para PDF.

Suporta: JPG, JPEG, PNG (via Pillow) e DOC/DOCX (via LibreOffice headless,
disponível tanto em Windows quanto Linux/Mac, o que também permite testar
este módulo nesta sandbox). Mantém opção de excluir os originais após a
conversão.
"""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
OFFICE_EXTENSIONS = {".doc", ".docx"}
CONVERTIBLE_EXTENSIONS = IMAGE_EXTENSIONS | OFFICE_EXTENSIONS


class ConversionError(RuntimeError):
    pass


def needs_conversion(path: Path) -> bool:
    return path.suffix.lower() in CONVERTIBLE_EXTENSIONS


def convert_image_to_pdf(path: Path, output_dir: Path | None = None) -> Path:
    try:
        from PIL import Image
    except ImportError as exc:
        raise ConversionError("Pacote 'Pillow' não instalado (pip install Pillow).") from exc

    output_dir = output_dir or path.parent
    output_path = output_dir / f"{path.stem}.pdf"
    with Image.open(path) as img:
        rgb = img.convert("RGB")
        rgb.save(output_path, "PDF")
    return output_path


def _find_libreoffice(custom_cmd: str | None = None) -> str | None:
    if custom_cmd and Path(custom_cmd).exists():
        return custom_cmd
    for candidate in ("soffice", "libreoffice", "soffice.exe"):
        found = shutil.which(candidate)
        if found:
            return found
    return None


def convert_office_to_pdf(path: Path, output_dir: Path | None = None,
                           libreoffice_cmd: str | None = None, timeout: int = 120) -> Path:
    output_dir = output_dir or path.parent
    soffice = _find_libreoffice(libreoffice_cmd)
    if soffice is None:
        raise ConversionError(
            "LibreOffice (soffice) não encontrado. Instale o LibreOffice ou configure "
            "'libreoffice_cmd' nas Configurações para converter DOC/DOCX."
        )

    result = subprocess.run(
        [soffice, "--headless", "--norestore", "--convert-to", "pdf",
         "--outdir", str(output_dir), str(path)],
        capture_output=True, text=True, timeout=timeout,
    )
    output_path = output_dir / f"{path.stem}.pdf"
    if result.returncode != 0 or not output_path.exists():
        raise ConversionError(f"Falha ao converter '{path.name}' para PDF: {result.stderr}")
    return output_path


def convert_to_pdf(path: Path, output_dir: Path | None = None,
                    delete_original: bool = False, libreoffice_cmd: str | None = None) -> Path:
    """Converte um arquivo para PDF, retornando o caminho do novo arquivo.

    Se `path` já for um PDF, retorna o próprio caminho sem nenhuma ação.
    """
    ext = path.suffix.lower()
    if ext == ".pdf":
        return path

    if ext in IMAGE_EXTENSIONS:
        result = convert_image_to_pdf(path, output_dir)
    elif ext in OFFICE_EXTENSIONS:
        result = convert_office_to_pdf(path, output_dir, libreoffice_cmd)
    else:
        raise ConversionError(f"Extensão não suportada para conversão: {ext}")

    if delete_original and result != path:
        path.unlink(missing_ok=True)

    return result

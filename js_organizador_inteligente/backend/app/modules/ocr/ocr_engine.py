"""OCR de documentos digitalizados.

Estratégia:
1. `ocrmypdf` (recomendado): adiciona uma camada de texto invisível ao PDF
   digitalizado, tornando-o totalmente pesquisável sem alterar a aparência
   visual. Ferramenta padrão de mercado para exatamente este caso de uso.
2. Fallback: `pytesseract` + `pdf2image` extraem apenas o texto (sem
   reescrever o PDF) para indexação de busca, usado quando `ocrmypdf` não
   está disponível no sistema.

Tudo roda localmente; nenhum conteúdo é enviado para fora da máquina.
"""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path


class OCRError(RuntimeError):
    pass


def _ocrmypdf_available() -> bool:
    return shutil.which("ocrmypdf") is not None


def pdf_has_text_layer(path: Path, min_chars: int = 20) -> bool:
    try:
        from pypdf import PdfReader
    except ImportError:
        return False
    try:
        reader = PdfReader(str(path))
        text = "".join(page.extract_text() or "" for page in reader.pages)
        return len(text.strip()) >= min_chars
    except Exception:
        return False


def apply_ocr(pdf_path: Path, language: str = "por", force: bool = False) -> Path:
    """Aplica OCR ao PDF, tornando-o pesquisável. Retorna o próprio caminho (in-place)."""
    if not force and pdf_has_text_layer(pdf_path):
        return pdf_path

    if _ocrmypdf_available():
        cmd = ["ocrmypdf", "--language", language, "--skip-text"]
        if force:
            cmd = ["ocrmypdf", "--language", language, "--force-ocr"]
        cmd += [str(pdf_path), str(pdf_path)]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise OCRError(f"ocrmypdf falhou em '{pdf_path.name}': {result.stderr}")
        return pdf_path

    return _ocr_via_pytesseract(pdf_path, language)


def _ocr_via_pytesseract(pdf_path: Path, language: str) -> Path:
    """Fallback: não reescreve o PDF, apenas confirma que é possível extrair texto."""
    try:
        import pytesseract
        from pdf2image import convert_from_path
    except ImportError as exc:
        raise OCRError(
            "Nem 'ocrmypdf' nem 'pytesseract'/'pdf2image' estão disponíveis. "
            "Instale o Tesseract OCR e as dependências Python para habilitar o OCR."
        ) from exc

    images = convert_from_path(str(pdf_path))
    texts = [pytesseract.image_to_string(img, lang=language) for img in images]
    _ = "\n".join(texts)  # usado por extract_text(); aqui só validamos a disponibilidade
    return pdf_path


def extract_text(pdf_path: Path, language: str = "por") -> str:
    """Extrai o texto pesquisável de um PDF (após OCR ou nativo)."""
    try:
        from pypdf import PdfReader

        reader = PdfReader(str(pdf_path))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
        if text.strip():
            return text
    except Exception:
        pass

    try:
        import pytesseract
        from pdf2image import convert_from_path

        images = convert_from_path(str(pdf_path))
        return "\n".join(pytesseract.image_to_string(img, lang=language) for img in images)
    except ImportError:
        return ""

"""Criptografia local (em repouso) para backups e banco de dados sensíveis.

Usa Fernet (AES-128 em CBC + HMAC, via `cryptography`), com a chave gerada
uma única vez e guardada localmente no diretório de dados do usuário — nunca
transmitida. Ativado opcionalmente via `AppConfig.encryption_enabled`.
"""
from __future__ import annotations

from pathlib import Path


class CryptoError(RuntimeError):
    pass


def _load_fernet(key_path: Path):
    try:
        from cryptography.fernet import Fernet
    except ImportError as exc:
        raise CryptoError("Pacote 'cryptography' não instalado (pip install cryptography).") from exc

    if key_path.exists():
        key = key_path.read_bytes()
    else:
        key_path.parent.mkdir(parents=True, exist_ok=True)
        key = Fernet.generate_key()
        key_path.write_bytes(key)
        try:
            key_path.chmod(0o600)
        except (NotImplementedError, PermissionError):
            pass  # Windows não suporta chmod POSIX; a ACL da pasta do usuário já protege o arquivo.
    return Fernet(key)


class LocalEncryption:
    def __init__(self, data_dir: str | Path):
        self.key_path = Path(data_dir) / ".secret.key"
        self._fernet = None

    @property
    def fernet(self):
        if self._fernet is None:
            self._fernet = _load_fernet(self.key_path)
        return self._fernet

    def encrypt_file(self, path: Path) -> Path:
        data = path.read_bytes()
        encrypted = self.fernet.encrypt(data)
        out_path = path.with_suffix(path.suffix + ".enc")
        out_path.write_bytes(encrypted)
        return out_path

    def decrypt_file(self, encrypted_path: Path, output_path: Path | None = None) -> Path:
        data = encrypted_path.read_bytes()
        decrypted = self.fernet.decrypt(data)
        output_path = output_path or encrypted_path.with_suffix("")
        output_path.write_bytes(decrypted)
        return output_path

    def encrypt_bytes(self, data: bytes) -> bytes:
        return self.fernet.encrypt(data)

    def decrypt_bytes(self, token: bytes) -> bytes:
        return self.fernet.decrypt(token)

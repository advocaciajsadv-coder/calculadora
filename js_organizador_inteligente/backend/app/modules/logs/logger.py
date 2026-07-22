"""Logs em tempo real.

Cada evento é persistido no SQLite (histórico) e publicado em uma fila
in-memory (pub/sub) que a camada de API (WebSocket) consome para exibir a
barra de logs em tempo real na interface Flutter, ao estilo do Explorador
de Arquivos do Windows com painel de atividades.
"""
from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from typing import Literal

from app.database.repository import LogRepository

LogLevel = Literal["info", "aviso", "erro", "sucesso"]


@dataclass
class LogEvent:
    level: LogLevel
    module: str
    message: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat(timespec="seconds"))

    def to_dict(self) -> dict:
        return {"level": self.level, "module": self.module, "message": self.message,
                "timestamp": self.timestamp}


class LiveLogger:
    """Logger central: grava no banco e distribui eventos para assinantes (WebSocket)."""

    def __init__(self, log_repo: LogRepository | None = None):
        self.log_repo = log_repo
        self._subscribers: list[asyncio.Queue] = []

    def subscribe(self) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue()
        self._subscribers.append(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue) -> None:
        if queue in self._subscribers:
            self._subscribers.remove(queue)

    def log(self, level: LogLevel, module: str, message: str) -> LogEvent:
        event = LogEvent(level=level, module=module, message=message)
        if self.log_repo is not None:
            self.log_repo.add(level, module, message)
        for queue in list(self._subscribers):
            queue.put_nowait(event.to_dict())
        return event

    def info(self, module: str, message: str) -> LogEvent:
        return self.log("info", module, message)

    def sucesso(self, module: str, message: str) -> LogEvent:
        return self.log("sucesso", module, message)

    def aviso(self, module: str, message: str) -> LogEvent:
        return self.log("aviso", module, message)

    def erro(self, module: str, message: str) -> LogEvent:
        return self.log("erro", module, message)


_logger_instance: LiveLogger | None = None


def get_logger(log_repo: LogRepository | None = None) -> LiveLogger:
    global _logger_instance
    if _logger_instance is None:
        _logger_instance = LiveLogger(log_repo)
    return _logger_instance

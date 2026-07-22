"""WebSocket de logs em tempo real, consumido pela interface Flutter."""
from __future__ import annotations

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.dependencies import get_context

router = APIRouter(tags=["logs"])


@router.websocket("/ws/logs")
async def logs_stream(websocket: WebSocket):
    await websocket.accept()
    ctx = get_context()
    queue = ctx.logger.subscribe()
    try:
        for event in ctx.log_repo.recent(limit=50)[::-1]:
            await websocket.send_json(event)
        while True:
            event = await queue.get()
            await websocket.send_json(event)
    except WebSocketDisconnect:
        pass
    finally:
        ctx.logger.unsubscribe(queue)

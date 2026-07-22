"""Rotas de documentos: importação/organização, movimentação manual, backup/lixeira."""
from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.api.schemas import ImportRequest, ManualMoveRequest, RestoreTrashRequest
from app.dependencies import get_context
from app.modules.folder_organizer.structure import target_folder
from app.modules.learning.preference_learner import PreferenceLearner

router = APIRouter(tags=["documents"])


@router.post("/documents/import")
def import_documents(payload: ImportRequest):
    ctx = get_context()
    client = ctx.client_repo.get(payload.client_id)
    if client is None:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")

    source_folder = Path(payload.source_folder)
    if not source_folder.exists() or not source_folder.is_dir():
        raise HTTPException(status_code=400, detail="Pasta de origem inválida.")

    def progress_callback(filename: str, current: int, total: int) -> None:
        ctx.logger.info("organizador", f"[{current}/{total}] Processando '{filename}'...")

    summary = ctx.organizer.process_folder(
        client_id=client["id"],
        client_name=client["name"],
        client_root=Path(client["base_path"]),
        source_folder=source_folder,
        duplicate_policy=payload.duplicate_policy,
        progress_callback=progress_callback,
    )
    return {
        "total": summary.total,
        "processados": summary.processados,
        "duplicados": summary.duplicados,
        "nao_identificados": summary.nao_identificados,
        "erros": summary.erros,
        "resultados": [r.__dict__ for r in summary.resultados],
    }


@router.post("/documents/move")
def move_document(payload: ManualMoveRequest):
    """Move manualmente um documento (ex.: drag-and-drop na UI) e registra a preferência aprendida."""
    ctx = get_context()
    document = ctx.document_repo.get(payload.document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Documento não encontrado.")

    client = ctx.client_repo.get(document["client_id"])
    dest_dir = target_folder(Path(client["base_path"]).parent, client["name"], payload.category, payload.subcategory)
    dest_dir.mkdir(parents=True, exist_ok=True)

    from app.modules.renaming.renamer import resolve_collision

    current_path = Path(document["current_path"])
    dest_path = resolve_collision(dest_dir, current_path.name)
    current_path.replace(dest_path)

    ctx.document_repo.update_location(document["id"], dest_path.name, str(dest_path),
                                       payload.category, payload.subcategory)

    learner = PreferenceLearner(ctx.preference_repo, ctx.document_repo, ctx.movement_repo)
    learner.register_manual_move(document["id"], payload.category, payload.subcategory)

    ctx.logger.info("aprendizado", f"'{document['current_name']}' movido manualmente. Preferência registrada.")
    return ctx.document_repo.get(document["id"])


@router.get("/documents/{document_id}/history")
def document_history(document_id: int):
    return get_context().movement_repo.history_for_document(document_id)


@router.get("/trash")
def list_trash():
    return get_context().backup_manager.list_trash()


@router.post("/trash/restore")
def restore_trash(payload: RestoreTrashRequest):
    ctx = get_context()
    try:
        restored_path = ctx.backup_manager.restore_from_trash(payload.trash_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    ctx.logger.sucesso("backup", f"Arquivo restaurado da lixeira: {restored_path}")
    return {"restored_path": str(restored_path)}


@router.post("/backup/run/{client_id}")
def run_backup(client_id: int):
    ctx = get_context()
    client = ctx.client_repo.get(client_id)
    if client is None:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")
    zip_path = ctx.backup_manager.run_full_backup(Path(client["base_path"]), client["name"])
    ctx.logger.sucesso("backup", f"Backup completo gerado em {zip_path}")
    return {"backup_path": str(zip_path)}

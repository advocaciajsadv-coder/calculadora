"""Ponto de entrada do backend do JS Organizador Inteligente.

Sobe um servidor HTTP local (FastAPI/uvicorn) consumido exclusivamente pelo
frontend Flutter rodando na mesma máquina. Nada é exposto para fora do
localhost por padrão — todo o processamento é local, conforme exigido pelo
requisito de segurança do produto.
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import routes_clients, routes_config, routes_documents, routes_search, websocket_logs
from app.dependencies import get_context

app = FastAPI(title="JS Organizador Inteligente", version="0.1.0")

# O frontend Flutter Desktop roda embutido/local; liberamos apenas localhost.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://127.0.0.1", "app://.", "null"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_clients.router)
app.include_router(routes_documents.router)
app.include_router(routes_search.router)
app.include_router(routes_config.router)
app.include_router(websocket_logs.router)


@app.on_event("startup")
def on_startup() -> None:
    get_context()  # inicializa banco, config e diretórios


@app.get("/health")
def health():
    return {"status": "ok", "app": "JS Organizador Inteligente"}


def run() -> None:
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8756, reload=False)


if __name__ == "__main__":
    run()

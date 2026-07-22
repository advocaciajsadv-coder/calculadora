# Arquitetura — JS Organizador Inteligente

## Visão geral

```
┌─────────────────────────────┐        HTTP + WebSocket        ┌──────────────────────────────┐
│   Frontend (Flutter/Win)    │  <───────── localhost ───────>  │   Backend (Python/FastAPI)    │
│  Interface, tema, D&D, logs │                                  │  Módulos de IA/OCR/organização│
└─────────────────────────────┘                                  └──────────────────────────────┘
                                                                              │
                                                                              ▼
                                                                     SQLite (índice local)
                                                                     Sistema de arquivos local
```

O frontend nunca acessa disco, IA externa ou banco diretamente — tudo passa
pelo backend local, que roda em `127.0.0.1:8756` e nunca é exposto fora da
máquina. Isso cumpre o requisito de segurança: "todo processamento deverá
ocorrer localmente" e "nenhum documento poderá ser enviado para servidores
externos sem autorização do usuário" (a integração com OpenAI só é ativada
se o usuário configurar explicitamente `ai_provider=openai` **e**
`ai_allowed_to_send_external=true`).

## Módulos do backend (`backend/app/`)

| Módulo | Caminho | Responsabilidade |
|---|---|---|
| Configurações | `config.py` | Config JSON local, tema, provedor de IA, limiar de confiança, políticas |
| Banco de Dados | `database/` | Schema SQLite + repositórios (clients, documents, preferences, logs, etc.) |
| Organização de Pastas | `modules/folder_organizer/` | Estrutura fixa (máx. 4 subpastas/pasta principal) + orquestrador do pipeline |
| IA / Classificação | `modules/classification/` | Regras + provedor local/OpenAI + limiar de confiança de 90% |
| Extração | `modules/extraction/` | Regex/NLP para CPF, RG, CID, processo, OAB, datas, etc. |
| Renomeação | `modules/renaming/` | Templates de nome por tipo de documento |
| Conversão | `modules/conversion/` | JPG/PNG/DOC/DOCX → PDF |
| OCR | `modules/ocr/` | `ocrmypdf`/`pytesseract`, PDF pesquisável |
| Duplicidade | `modules/duplicates/` | Hash SHA-256, políticas ignorar/substituir/manter ambos |
| Pesquisa | `modules/search/` | Interpretação de linguagem natural (PT-BR) + Assistente Jurídico |
| Backup | `modules/backup/` | Versionamento, lixeira/recuperação, snapshot .zip |
| Segurança | `modules/security/` | Criptografia local (Fernet) |
| Logs | `modules/logs/` | Logger central + WebSocket em tempo real |
| Aprendizado | `modules/learning/` | Registra preferências quando o usuário move documentos manualmente |
| API | `api/` | Rotas FastAPI + WebSocket consumidos pelo Flutter |

## Pipeline de organização (`DocumentOrganizer.process_folder`)

Para cada arquivo dentro da pasta selecionada/arrastada pelo usuário:

1. **Conversão** — JPG/JPEG/PNG/DOC/DOCX → PDF (mantém opção de excluir originais).
2. **OCR** — aplica camada de texto pesquisável em PDFs digitalizados.
3. **Duplicidade** — hash SHA-256 comparado aos documentos já indexados do cliente.
4. **Extração** — dados estruturados (CPF, RG, CID, processo, OAB, etc.) viram o índice pesquisável.
5. **Classificação** — regras → preferências aprendidas → IA externa (opcional) → limiar de 90% (abaixo disso vai para `99 - Não Identificados`).
6. **Renomeação** — nome padronizado por tipo de documento.
7. **Movimentação** — para a pasta correta dentro da estrutura fixa do cliente.
8. **Indexação/Backup/Log** — grava no SQLite, cria backup versionado e emite log em tempo real.

## Estrutura de pastas por cliente (regra fixa: máx. 4 subpastas por pasta principal)

```
NOME DO CLIENTE
├── 01 - Documentos Pessoais   (Identificação, Endereço, Certidões, Outros)
├── 02 - Provas                (Fotos, Conversas, Áudios e Vídeos, Documentos)
├── 03 - Petições              (Iniciais, Manifestações, Recursos, Decisões)
├── 04 - Documentos Assinados  (Contratos, Procurações, Declarações, ZapSign)
├── 05 - Documentos do Caso    (Trabalhista, Previdenciário, Médico, Financeiro)
├── 06 - Arquivos Recebidos
├── 07 - Arquivos Enviados
└── 99 - Não Identificados
```

Definida em `backend/app/modules/folder_organizer/structure.py`, com um
teste (`tests/test_structure.py`) que garante que nenhuma pasta principal
jamais exceda 4 subpastas.

## Aprendizado de preferências

Quando o usuário move manualmente um documento (endpoint
`POST /documents/move`, usado pelo drag-and-drop da UI), o
`PreferenceLearner` grava `(doc_type → categoria/subcategoria)` na tabela
`preferences`. Da próxima vez que o `DocumentClassifier` encontrar aquele
tipo de documento, a preferência aprendida tem prioridade sobre a pasta
padrão da regra.

## Modelos por área do Direito

`modules/search/legal_assistant.py` mantém checklists de documentos
esperados por área (Trabalhista, Previdenciário, Cível, Família), usadas
pelo Assistente Jurídico para responder "quais documentos ainda faltam?".
Esses modelos reutilizam a mesma estrutura fixa de pastas — apenas mudam
quais documentos são esperados por tipo de caso.

## Frontend (`frontend/`, Flutter — Windows Desktop)

- `services/api_service.dart` — cliente HTTP do backend local.
- `services/log_stream_service.dart` — assina `/ws/logs` (logs em tempo real).
- `services/backend_launcher.dart` — inicia o backend empacotado junto com o app instalado.
- `widgets/drop_zone.dart` — arrastar-e-soltar (via `desktop_drop`) + seleção de pasta.
- `widgets/explorer_tree.dart` — árvore de pastas ao estilo do Explorador de Arquivos do Windows.
- `widgets/log_panel.dart`, `widgets/progress_panel.dart` — logs e progresso em tempo real.
- `theme/app_theme.dart` + `services/theme_provider.dart` — tema claro/escuro persistido.

## Empacotamento para Windows

1. `backend/pyinstaller.spec` empacota o backend em `js_organizador_backend.exe` (processo local, sem console).
2. `flutter build windows` compila a interface nativa.
3. `installer/windows_installer.iss` (Inno Setup) empacota os dois em um único instalador `.exe`.
4. `installer/build_windows.ps1` automatiza os três passos em uma máquina Windows.

Este processo de build precisa rodar em uma máquina Windows com Python,
Flutter SDK e Inno Setup instalados — não é possível gerar o `.exe` final a
partir de um ambiente Linux.

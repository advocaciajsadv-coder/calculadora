# JS Organizador Inteligente

Aplicativo desktop para Windows que organiza automaticamente os documentos
de um escritório de advocacia: identifica o tipo de documento com IA,
converte para PDF, aplica OCR, renomeia, detecta duplicidades, monta a
estrutura de pastas do cliente e permite pesquisa em linguagem natural —
tudo rodando **localmente**, sem enviar documentos para servidores externos
sem autorização explícita do usuário.

Veja `docs/ARCHITECTURE.md` para o detalhamento completo dos módulos e do
pipeline de organização.

## Estrutura do projeto

```
js_organizador_inteligente/
├── backend/     # Python (FastAPI) — IA, OCR, conversão, banco, regras de negócio
├── frontend/    # Flutter (Windows Desktop) — interface
├── installer/   # Scripts de empacotamento (.exe) para Windows
└── docs/        # Documentação de arquitetura
```

## Rodando em desenvolvimento

### Backend

```bash
cd js_organizador_inteligente/backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m app.main          # sobe em http://127.0.0.1:8756
```

Dependências externas opcionais (instale conforme os recursos que quiser usar):

- **Tesseract OCR** + **ocrmypdf** — necessários para o OCR tornar PDFs digitalizados pesquisáveis.
- **LibreOffice** (`soffice`) — necessário para converter DOC/DOCX em PDF.
- Sem essas ferramentas instaladas, o app continua funcionando normalmente para os demais tipos de arquivo (PDF nativo, JPG/PNG), apenas pulando essas etapas com um aviso no log.

Rodar os testes automatizados:

```bash
cd js_organizador_inteligente/backend
pytest
```

### Frontend

O diretório `frontend/lib/` já contém todo o código-fonte Dart da
interface. Como este projeto não inclui o Flutter SDK, gere o scaffold
nativo do Windows antes da primeira execução:

```bash
cd js_organizador_inteligente/frontend
flutter create --platforms=windows .   # gera a pasta windows/ (não versionada aqui)
flutter pub get
flutter run -d windows                 # com o backend já rodando em outra janela
```

## Gerando o instalador Windows (.exe)

Em uma máquina Windows com Python, Flutter SDK e Inno Setup 6 instalados:

```powershell
cd js_organizador_inteligente\installer
.\build_windows.ps1
```

O instalador final fica em `installer/output/JS-Organizador-Inteligente-Setup-<versão>.exe`.

## Configuração de IA

Por padrão (`ai_provider = "local"`), a classificação é 100% offline, via
regras/heurística (`backend/app/modules/classification/rules.py`). Para
habilitar o GPT-5.5 da OpenAI em casos ambíguos, configure em
`PUT /config`:

```json
{
  "ai_provider": "openai",
  "openai_api_key": "sk-...",
  "ai_allowed_to_send_external": true
}
```

Sem `ai_allowed_to_send_external = true`, nenhum documento é enviado para
fora da máquina, mesmo com uma chave configurada.

## Regras de negócio principais

- Nenhuma pasta principal tem mais de **4 subpastas** (ver `structure.py` e `folder_structure.dart`).
- Documentos classificados com confiança **abaixo de 90%** vão para `99 - Não Identificados`.
- Mover um documento manualmente ensina o classificador para próximas organizações.
- Duplicidades (mesmo hash de conteúdo) seguem a política configurada: ignorar, substituir ou manter ambos.

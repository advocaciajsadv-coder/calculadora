# Guia de Instalação — JS Organizador Inteligente

Duas rotas possíveis: **(A) modo desenvolvimento**, para testar rápido sem
gerar instalador, e **(B) gerar o `.exe` final**, para instalar como
qualquer programa do Windows. Ambas exigem uma **máquina Windows** — não é
possível rodar ou gerar o `.exe` a partir de Linux/Mac.

---

## 0. O que você vai precisar instalar na máquina Windows

| Ferramenta | Para quê | Link |
|---|---|---|
| **Git** | Baixar o código do repositório | https://git-scm.com/download/win |
| **Python 3.11+** | Rodar o backend (IA, OCR, banco de dados) | https://www.python.org/downloads/ — marque "Add Python to PATH" na instalação |
| **Flutter SDK** | Compilar a interface (Windows Desktop) | https://docs.flutter.dev/get-started/install/windows |
| **Visual Studio Build Tools** (com "Desktop development with C++") | O Flutter precisa disso para compilar apps Windows | https://visualstudio.microsoft.com/downloads/ → "Build Tools for Visual Studio" |
| **Tesseract OCR** *(opcional, recomendado)* | OCR em PDFs digitalizados | https://github.com/UB-Mannheim/tesseract/wiki |
| **ocrmypdf** *(opcional, recomendado)* | Deixa o PDF pesquisável de verdade (instala via `pip`, passo abaixo) | — |
| **LibreOffice** *(opcional)* | Converter DOC/DOCX para PDF | https://www.libreoffice.org/download/ |
| **Inno Setup 6** *(só para gerar o instalador)* | Empacota tudo em um `.exe` de instalação | https://jrsoftware.org/isdl.php |

Sem Tesseract/LibreOffice o app funciona normalmente para PDF nativo, JPG e
PNG — só pula OCR/conversão de Word com um aviso no log.

---

## 1. Baixar o código

Abra o **PowerShell** e rode:

```powershell
git clone https://github.com/advocaciajsadv-coder/calculadora.git
cd calculadora
git checkout claude/js-organizador-inteligente-2zvz7p
cd js_organizador_inteligente
```

---

## A. Modo desenvolvimento (mais rápido para testar)

### A1. Subir o backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m app.main
```

Deixe essa janela aberta — o backend fica rodando em
`http://127.0.0.1:8756`. Para conferir que está de pé, abra
`http://127.0.0.1:8756/health` no navegador; deve responder
`{"status":"ok",...}`.

### A2. Rodar a interface (em outra janela do PowerShell)

```powershell
cd js_organizador_inteligente\frontend
flutter create --platforms=windows .
flutter pub get
flutter run -d windows
```

O comando `flutter create --platforms=windows .` só precisa rodar **uma
vez** — ele gera a pasta `windows/` com os arquivos nativos que faltam (não
vieram no repositório porque dependem do Flutter SDK instalado). Depois
disso, o app abre com o backend já conectado.

---

## B. Gerar o instalador final (.exe)

Com Python, Flutter e Inno Setup já instalados:

```powershell
cd js_organizador_inteligente\installer
.\build_windows.ps1
```

Esse script faz os três passos automaticamente:
1. Empacota o backend Python num `.exe` (PyInstaller)
2. Compila a interface Flutter em modo release
3. Gera o instalador com o Inno Setup

O resultado fica em
`installer\output\JS-Organizador-Inteligente-Setup-0.1.0.exe`. Esse arquivo
é o que você distribui/instala normalmente, com ícone na área de trabalho —
não precisa mais do PowerShell depois disso.

---

## Problemas comuns

- **"flutter: comando não encontrado"** → o Flutter SDK não foi adicionado
  ao PATH. Reabra o PowerShell depois de instalar, ou adicione manualmente
  `C:\flutter\bin` ao PATH do Windows.
- **Erro ao compilar o Windows runner** → geralmente falta o "Desktop
  development with C++" no Visual Studio Build Tools.
- **OCR não funciona** → confirme que `tesseract` está no PATH
  (`tesseract --version` no PowerShell deve funcionar) e rode
  `pip install ocrmypdf` dentro do `.venv` do backend.
- **DOC/DOCX não converte** → confirme que o LibreOffice está instalado; se
  o caminho do `soffice.exe` não for padrão, configure `libreoffice_cmd`
  nas Configurações do app.

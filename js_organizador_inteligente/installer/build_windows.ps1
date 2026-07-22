# Script de build completo do JS Organizador Inteligente para Windows.
# Deve ser executado em uma máquina Windows com: Python 3.11+, Flutter SDK,
# e Inno Setup 6 (iscc.exe no PATH) instalados.
#
# Uso (a partir da pasta installer/):
#   .\build_windows.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"
$installerDir = Join-Path $root "installer"

Write-Host "== 1/3 Empacotando backend Python (PyInstaller) ==" -ForegroundColor Cyan
Push-Location $backendDir
python -m venv .venv -ErrorAction SilentlyContinue
. .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pyinstaller pyinstaller.spec --noconfirm
Pop-Location

Write-Host "== 2/3 Compilando frontend Flutter (Windows Release) ==" -ForegroundColor Cyan
Push-Location $frontendDir
flutter pub get
flutter build windows --release
Pop-Location

Write-Host "== 3/3 Gerando instalador (Inno Setup) ==" -ForegroundColor Cyan
Push-Location $installerDir
New-Item -ItemType Directory -Force -Path "output" | Out-Null
iscc windows_installer.iss
Pop-Location

Write-Host "Build concluído. Instalador em installer\output\" -ForegroundColor Green

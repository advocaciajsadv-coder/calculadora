; Script do Inno Setup para o instalador Windows do JS Organizador Inteligente.
; Gera um único .exe que instala:
;   - o backend Python empacotado pelo PyInstaller (js_organizador_backend.exe)
;   - o frontend Flutter compilado (flutter build windows)
;
; Pré-requisitos (rodar em uma máquina Windows):
;   1. backend/dist/js_organizador_backend.exe   (gerado por: pyinstaller pyinstaller.spec)
;   2. frontend/build/windows/x64/runner/Release/*  (gerado por: flutter build windows)
;
; Compilar este script com o Inno Setup Compiler (iscc.exe) ou via
; installer/build_windows.ps1, que automatiza os três passos.

#define MyAppName "JS Organizador Inteligente"
#define MyAppVersion "0.1.0"
#define MyAppPublisher "JS Advocacia"
#define MyAppExeName "js_organizador_inteligente.exe"

[Setup]
AppId={{B6C1E5B0-6A9B-4F1B-9C7B-JSORGANIZADOR1}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
OutputDir=output
OutputBaseFilename=JS-Organizador-Inteligente-Setup-{#MyAppVersion}
Compression=lzma2
SolidCompression=yes
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
DisableProgramGroupPage=yes
WizardStyle=modern
UninstallDisplayIcon={app}\{#MyAppExeName}

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Tasks]
Name: "desktopicon"; Description: "Criar um atalho na área de trabalho"; GroupDescription: "Atalhos adicionais:"

[Files]
; Frontend Flutter (interface).
Source: "..\frontend\build\windows\x64\runner\Release\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs

; Backend Python empacotado (processo local, sem acesso externo).
Source: "..\backend\dist\js_organizador_backend.exe"; DestDir: "{app}\backend"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Abrir {#MyAppName}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{userappdata}\JSOrganizadorInteligente\logs"

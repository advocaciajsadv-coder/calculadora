import 'dart:io';

import 'package:flutter/foundation.dart';

/// Inicia o processo do backend local (js_organizador_backend.exe) junto
/// com a interface, caso ele ainda não esteja rodando. Em desenvolvimento
/// (`flutter run`), o backend deve ser iniciado manualmente
/// (`python -m app.main`) e esta chamada é ignorada silenciosamente se o
/// executável empacotado não for encontrado ao lado do app instalado.
class BackendLauncher {
  Process? _process;

  Future<void> start() async {
    if (!Platform.isWindows) return; // produto é Windows-only

    final exeDir = File(Platform.resolvedExecutable).parent;
    final backendExe = File('${exeDir.path}\\backend\\js_organizador_backend.exe');

    if (!backendExe.existsSync()) {
      debugPrint('Backend empacotado não encontrado em ${backendExe.path}; '
          'assumindo que está rodando manualmente (modo desenvolvimento).');
      return;
    }

    try {
      _process = await Process.start(backendExe.path, [], mode: ProcessStartMode.detached);
    } catch (e) {
      debugPrint('Falha ao iniciar o backend: $e');
    }
  }

  void stop() {
    _process?.kill();
  }
}

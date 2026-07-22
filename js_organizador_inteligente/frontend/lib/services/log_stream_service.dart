import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import '../models/models.dart';

/// Assina o WebSocket de logs em tempo real (/ws/logs) e mantém um
/// histórico curto em memória para a UI (painel de logs, estilo "atividade
/// recente" do Explorador de Arquivos do Windows).
class LogStreamService extends ChangeNotifier {
  final String wsUrl;
  final List<LogEvent> events = [];
  WebSocketChannel? _channel;
  bool connected = false;

  LogStreamService({this.wsUrl = 'ws://127.0.0.1:8756/ws/logs'});

  void connect() {
    if (connected) return;
    try {
      _channel = WebSocketChannel.connect(Uri.parse(wsUrl));
      connected = true;
      _channel!.stream.listen(
        (raw) {
          final data = jsonDecode(raw as String) as Map<String, dynamic>;
          events.insert(0, LogEvent.fromJson(data));
          if (events.length > 300) {
            events.removeRange(300, events.length);
          }
          notifyListeners();
        },
        onDone: () {
          connected = false;
          notifyListeners();
          _scheduleReconnect();
        },
        onError: (_) {
          connected = false;
          notifyListeners();
          _scheduleReconnect();
        },
      );
      notifyListeners();
    } catch (_) {
      connected = false;
      _scheduleReconnect();
    }
  }

  void _scheduleReconnect() {
    Future.delayed(const Duration(seconds: 3), connect);
  }

  @override
  void dispose() {
    _channel?.sink.close();
    super.dispose();
  }
}

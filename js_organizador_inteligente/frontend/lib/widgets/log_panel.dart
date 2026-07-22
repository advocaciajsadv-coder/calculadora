import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/log_stream_service.dart';
import '../theme/app_theme.dart';

/// Painel de logs em tempo real (atividade do sistema).
class LogPanel extends StatelessWidget {
  const LogPanel({super.key});

  IconData _iconFor(String level) {
    switch (level) {
      case 'erro':
        return Icons.error_outline;
      case 'aviso':
        return Icons.warning_amber_outlined;
      case 'sucesso':
        return Icons.check_circle_outline;
      default:
        return Icons.info_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    final logStream = context.watch<LogStreamService>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            children: [
              Icon(
                logStream.connected ? Icons.circle : Icons.circle_outlined,
                size: 10,
                color: logStream.connected ? Colors.green : Colors.grey,
              ),
              const SizedBox(width: 6),
              Text(
                'Logs em tempo real',
                style: Theme.of(context).textTheme.titleSmall,
              ),
            ],
          ),
        ),
        const Divider(height: 1),
        Expanded(
          child: logStream.events.isEmpty
              ? const Center(child: Text('Nenhuma atividade ainda.'))
              : ListView.builder(
                  itemCount: logStream.events.length,
                  itemBuilder: (context, index) {
                    final event = logStream.events[index];
                    return ListTile(
                      dense: true,
                      leading: Icon(
                        _iconFor(event.level),
                        color: logLevelColor(event.level, context),
                        size: 18,
                      ),
                      title: Text(event.message, style: const TextStyle(fontSize: 13)),
                      subtitle: Text(
                        '${event.module} • ${event.timestamp}',
                        style: const TextStyle(fontSize: 11),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}

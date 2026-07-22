import 'package:flutter/material.dart';

import '../models/models.dart';

/// Barra de progresso e resumo do processamento em lote.
class ProgressPanel extends StatelessWidget {
  final bool running;
  final String? currentFile;
  final int current;
  final int total;
  final ImportSummary? summary;

  const ProgressPanel({
    super.key,
    required this.running,
    this.currentFile,
    this.current = 0,
    this.total = 0,
    this.summary,
  });

  @override
  Widget build(BuildContext context) {
    if (!running && summary == null) return const SizedBox.shrink();

    final progressValue = total > 0 ? current / total : null;

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (running) ...[
              Row(
                children: [
                  Expanded(
                    child: Text(
                      currentFile == null
                          ? 'Processando...'
                          : 'Processando: $currentFile',
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (total > 0) Text('$current / $total'),
                ],
              ),
              const SizedBox(height: 8),
              LinearProgressIndicator(value: progressValue),
            ],
            if (!running && summary != null) _SummaryRow(summary: summary!),
          ],
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final ImportSummary summary;
  const _SummaryRow({required this.summary});

  @override
  Widget build(BuildContext context) {
    Widget chip(String label, int value, Color color) => Chip(
          avatar: CircleAvatar(backgroundColor: color, radius: 6),
          label: Text('$label: $value'),
        );

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        chip('Total', summary.total, Colors.blueGrey),
        chip('Organizados', summary.processados, Colors.green),
        chip('Duplicados', summary.duplicados, Colors.orange),
        chip('Não identificados', summary.naoIdentificados, Colors.amber),
        chip('Erros', summary.erros, Colors.red),
      ],
    );
  }
}

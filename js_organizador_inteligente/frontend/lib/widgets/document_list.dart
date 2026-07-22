import 'package:flutter/material.dart';

import '../models/folder_structure.dart';
import '../models/models.dart';

/// Lista de documentos no estilo "detalhes" do Explorador de Arquivos,
/// com suporte a mover manualmente um documento (o que alimenta o
/// aprendizado de preferências do usuário no backend).
class DocumentList extends StatelessWidget {
  final List<DocumentModel> documents;
  final void Function(DocumentModel document, String category, String? subcategory) onMove;

  const DocumentList({super.key, required this.documents, required this.onMove});

  IconData _iconForType(String? docType) {
    if (docType == null) return Icons.insert_drive_file_outlined;
    if (docType.contains('Foto')) return Icons.image_outlined;
    if (docType.contains('Vídeo') || docType.contains('Áudio')) return Icons.play_circle_outline;
    if (docType.contains('Procuração') || docType.contains('Contrato')) return Icons.edit_document;
    return Icons.description_outlined;
  }

  @override
  Widget build(BuildContext context) {
    if (documents.isEmpty) {
      return const Center(child: Text('Nenhum documento nesta pasta.'));
    }

    return ListView.separated(
      itemCount: documents.length,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final doc = documents[index];
        final confidencePct = doc.confidence != null ? '${(doc.confidence! * 100).round()}%' : '-';
        return ListTile(
          leading: Icon(_iconForType(doc.docType)),
          title: Text(doc.currentName),
          subtitle: Text(
            '${doc.docType ?? "Não identificado"} • ${doc.category ?? ""}'
            '${doc.subcategory != null ? " / ${doc.subcategory}" : ""} • confiança $confidencePct',
            overflow: TextOverflow.ellipsis,
          ),
          trailing: PopupMenuButton<String>(
            icon: const Icon(Icons.drive_file_move_outline),
            tooltip: 'Mover para...',
            onSelected: (value) {
              final parts = value.split('::');
              onMove(doc, parts[0], parts.length > 1 ? parts[1] : null);
            },
            itemBuilder: (context) => [
              for (final entry in clientFolderStructure.entries) ...[
                PopupMenuItem(enabled: false, child: Text(entry.key, style: const TextStyle(fontWeight: FontWeight.bold))),
                if (entry.value.isEmpty)
                  PopupMenuItem(value: entry.key, child: Text('  → ${entry.key}')),
                for (final sub in entry.value)
                  PopupMenuItem(value: '${entry.key}::$sub', child: Text('  → $sub')),
              ],
            ],
          ),
        );
      },
    );
  }
}

import 'dart:io';

import 'package:desktop_drop/desktop_drop.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

/// Área de arrastar-e-soltar para importar uma pasta de documentos.
///
/// O usuário só precisa arrastar uma pasta (ou selecionar uma existente) —
/// toda a organização, conversão, OCR e classificação acontece depois,
/// automaticamente, no backend.
class DropZone extends StatefulWidget {
  final void Function(String folderPath) onFolderSelected;
  final bool busy;

  const DropZone({super.key, required this.onFolderSelected, this.busy = false});

  @override
  State<DropZone> createState() => _DropZoneState();
}

class _DropZoneState extends State<DropZone> {
  bool _hovering = false;

  Future<void> _pickFolder() async {
    final path = await FilePicker.platform.getDirectoryPath(
      dialogTitle: 'Selecione a pasta com os documentos',
    );
    if (path != null) {
      widget.onFolderSelected(path);
    }
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return DropTarget(
      onDragEntered: (_) => setState(() => _hovering = true),
      onDragExited: (_) => setState(() => _hovering = false),
      onDragDone: (details) {
        setState(() => _hovering = false);
        if (widget.busy || details.files.isEmpty) return;
        final entity = File(details.files.first.path);
        final dir = entity.parent;
        final path = Directory(details.files.first.path).existsSync()
            ? details.files.first.path
            : dir.path;
        widget.onFolderSelected(path);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 24),
        decoration: BoxDecoration(
          color: _hovering
              ? scheme.primary.withValues(alpha: 0.08)
              : scheme.surfaceContainerHighest.withValues(alpha: 0.3),
          border: Border.all(
            color: _hovering ? scheme.primary : scheme.outlineVariant,
            width: _hovering ? 2 : 1,
            style: BorderStyle.solid,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(Icons.drive_folder_upload_outlined, size: 48, color: scheme.primary),
            const SizedBox(height: 12),
            Text(
              widget.busy
                  ? 'Organizando documentos...'
                  : 'Arraste uma pasta com documentos aqui',
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              'ou',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 8),
            FilledButton.icon(
              onPressed: widget.busy ? null : _pickFolder,
              icon: const Icon(Icons.folder_open),
              label: const Text('Selecionar pasta existente'),
            ),
          ],
        ),
      ),
    );
  }
}

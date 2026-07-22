import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';

const areasDireito = ['Trabalhista', 'Previdenciário', 'Cível', 'Família'];

class NewClientResult {
  final String name;
  final String rootPath;
  final String? areaDoDireito;

  NewClientResult({required this.name, required this.rootPath, this.areaDoDireito});
}

/// Diálogo para cadastro de um novo cliente/processo, criando
/// automaticamente toda a estrutura fixa de pastas.
Future<NewClientResult?> showNewClientDialog(BuildContext context) {
  final nameController = TextEditingController();
  final pathController = TextEditingController();
  String? area;

  return showDialog<NewClientResult>(
    context: context,
    builder: (context) => StatefulBuilder(
      builder: (context, setState) => AlertDialog(
        title: const Text('Novo cliente / processo'),
        content: SizedBox(
          width: 420,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'Nome do cliente'),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: pathController,
                      decoration: const InputDecoration(labelText: 'Pasta raiz (onde criar a estrutura)'),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.folder_open),
                    onPressed: () async {
                      final path = await FilePicker.platform.getDirectoryPath();
                      if (path != null) {
                        pathController.text = path;
                      }
                    },
                  ),
                ],
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: area,
                decoration: const InputDecoration(labelText: 'Área do direito (opcional)'),
                items: areasDireito
                    .map((a) => DropdownMenuItem(value: a, child: Text(a)))
                    .toList(),
                onChanged: (value) => setState(() => area = value),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () {
              if (nameController.text.trim().isEmpty || pathController.text.trim().isEmpty) return;
              Navigator.of(context).pop(
                NewClientResult(
                  name: nameController.text.trim(),
                  rootPath: pathController.text.trim(),
                  areaDoDireito: area,
                ),
              );
            },
            child: const Text('Criar estrutura'),
          ),
        ],
      ),
    ),
  );
}

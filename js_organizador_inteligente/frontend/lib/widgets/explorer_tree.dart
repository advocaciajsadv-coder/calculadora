import 'package:flutter/material.dart';

import '../models/folder_structure.dart';
import '../models/models.dart';

/// Árvore de pastas ao estilo do Explorador de Arquivos do Windows,
/// mostrando a estrutura fixa de categorias/subcategorias e a contagem de
/// documentos em cada uma.
class ExplorerTree extends StatelessWidget {
  final List<DocumentModel> documents;
  final String? selectedCategory;
  final String? selectedSubcategory;
  final void Function(String? category, String? subcategory) onSelect;

  const ExplorerTree({
    super.key,
    required this.documents,
    required this.onSelect,
    this.selectedCategory,
    this.selectedSubcategory,
  });

  int _countFor(String category, [String? subcategory]) {
    return documents
        .where((d) =>
            d.category == category &&
            (subcategory == null || d.subcategory == subcategory))
        .length;
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.symmetric(vertical: 8),
      children: [
        _AllDocumentsTile(
          count: documents.length,
          selected: selectedCategory == null,
          onTap: () => onSelect(null, null),
        ),
        const Divider(height: 16),
        for (final entry in clientFolderStructure.entries)
          _CategoryTile(
            category: entry.key,
            subcategories: entry.value,
            count: _countFor(entry.key),
            selectedCategory: selectedCategory,
            selectedSubcategory: selectedSubcategory,
            countFor: _countFor,
            onSelect: onSelect,
          ),
      ],
    );
  }
}

class _AllDocumentsTile extends StatelessWidget {
  final int count;
  final bool selected;
  final VoidCallback onTap;

  const _AllDocumentsTile({required this.count, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      dense: true,
      selected: selected,
      leading: const Icon(Icons.folder_special_outlined),
      title: const Text('Todos os documentos'),
      trailing: Text('$count'),
      onTap: onTap,
    );
  }
}

class _CategoryTile extends StatefulWidget {
  final String category;
  final List<String> subcategories;
  final int count;
  final String? selectedCategory;
  final String? selectedSubcategory;
  final int Function(String, [String?]) countFor;
  final void Function(String? category, String? subcategory) onSelect;

  const _CategoryTile({
    required this.category,
    required this.subcategories,
    required this.count,
    required this.selectedCategory,
    required this.selectedSubcategory,
    required this.countFor,
    required this.onSelect,
  });

  @override
  State<_CategoryTile> createState() => _CategoryTileState();
}

class _CategoryTileState extends State<_CategoryTile> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final isSelected = widget.selectedCategory == widget.category && widget.selectedSubcategory == null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ListTile(
          dense: true,
          selected: isSelected,
          leading: Icon(widget.subcategories.isEmpty ? Icons.folder_outlined : (_expanded ? Icons.folder_open : Icons.folder)),
          title: Text(widget.category, overflow: TextOverflow.ellipsis),
          trailing: Text('${widget.count}'),
          onTap: () {
            widget.onSelect(widget.category, null);
            if (widget.subcategories.isNotEmpty) {
              setState(() => _expanded = !_expanded);
            }
          },
        ),
        if (_expanded)
          for (final sub in widget.subcategories)
            Padding(
              padding: const EdgeInsets.only(left: 24),
              child: ListTile(
                dense: true,
                selected: widget.selectedCategory == widget.category && widget.selectedSubcategory == sub,
                leading: const Icon(Icons.subdirectory_arrow_right, size: 18),
                title: Text(sub, overflow: TextOverflow.ellipsis),
                trailing: Text('${widget.countFor(widget.category, sub)}'),
                onTap: () => widget.onSelect(widget.category, sub),
              ),
            ),
      ],
    );
  }
}

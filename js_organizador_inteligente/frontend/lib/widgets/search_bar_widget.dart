import 'dart:async';

import 'package:flutter/material.dart';

/// Barra de pesquisa instantânea em linguagem natural.
///
/// Exemplos que o usuário pode digitar: "Mostrar todos os CNIS.",
/// "Existe procuração?", "Qual o CID do cliente?".
class SearchBarWidget extends StatefulWidget {
  final void Function(String query) onSearch;
  final String hintText;

  const SearchBarWidget({
    super.key,
    required this.onSearch,
    this.hintText = 'Pesquisar em linguagem natural (ex.: "mostrar todos os CNIS")',
  });

  @override
  State<SearchBarWidget> createState() => _SearchBarWidgetState();
}

class _SearchBarWidgetState extends State<SearchBarWidget> {
  final _controller = TextEditingController();
  Timer? _debounce;

  void _onChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), () {
      widget.onSearch(value.trim());
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _controller,
      onChanged: _onChanged,
      onSubmitted: (value) => widget.onSearch(value.trim()),
      decoration: InputDecoration(
        prefixIcon: const Icon(Icons.search),
        hintText: widget.hintText,
        filled: true,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(24),
          borderSide: BorderSide.none,
        ),
        suffixIcon: _controller.text.isEmpty
            ? null
            : IconButton(
                icon: const Icon(Icons.clear),
                onPressed: () {
                  _controller.clear();
                  widget.onSearch('');
                },
              ),
      ),
    );
  }
}

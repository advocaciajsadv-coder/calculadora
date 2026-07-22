import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/models.dart';
import '../services/api_service.dart';
import '../services/log_stream_service.dart';
import '../services/theme_provider.dart';
import '../widgets/document_list.dart';
import '../widgets/drop_zone.dart';
import '../widgets/explorer_tree.dart';
import '../widgets/log_panel.dart';
import '../widgets/new_client_dialog.dart';
import '../widgets/progress_panel.dart';
import '../widgets/search_bar_widget.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _api = ApiService();

  List<ClientModel> _clients = [];
  ClientModel? _selectedClient;
  List<DocumentModel> _documents = [];
  List<DocumentModel> _visibleDocuments = [];
  String? _selectedCategory;
  String? _selectedSubcategory;

  bool _importing = false;
  ImportSummary? _lastSummary;
  String? _error;

  @override
  void initState() {
    super.initState();
    context.read<LogStreamService>().connect();
    _loadClients();
  }

  Future<void> _loadClients() async {
    try {
      final clients = await _api.listClients();
      setState(() {
        _clients = clients;
        _selectedClient ??= clients.isNotEmpty ? clients.first : null;
      });
      if (_selectedClient != null) {
        await _loadDocuments();
      }
    } catch (e) {
      setState(() => _error = 'Não foi possível conectar ao backend: $e');
    }
  }

  Future<void> _loadDocuments() async {
    if (_selectedClient == null) return;
    final docs = await _api.listDocuments(_selectedClient!.id);
    setState(() {
      _documents = docs;
      _applyFilter();
    });
  }

  void _applyFilter() {
    _visibleDocuments = _documents.where((d) {
      if (_selectedCategory != null && d.category != _selectedCategory) return false;
      if (_selectedSubcategory != null && d.subcategory != _selectedSubcategory) return false;
      return true;
    }).toList();
  }

  Future<void> _createClient() async {
    final result = await showNewClientDialog(context);
    if (result == null) return;
    try {
      final client = await _api.createClient(
        name: result.name,
        rootPath: result.rootPath,
        areaDoDireito: result.areaDoDireito,
      );
      setState(() {
        _clients.add(client);
        _selectedClient = client;
      });
      await _loadDocuments();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro ao criar cliente: $e')));
      }
    }
  }

  Future<void> _onFolderSelected(String folderPath) async {
    if (_selectedClient == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cadastre ou selecione um cliente antes de importar documentos.')),
      );
      return;
    }
    setState(() {
      _importing = true;
      _lastSummary = null;
    });
    try {
      final summary = await _api.importFolder(clientId: _selectedClient!.id, sourceFolder: folderPath);
      setState(() => _lastSummary = summary);
      await _loadDocuments();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro ao organizar documentos: $e')));
      }
    } finally {
      setState(() => _importing = false);
    }
  }

  Future<void> _onSearch(String query) async {
    if (_selectedClient == null) return;
    if (query.isEmpty) {
      setState(() => _applyFilter());
      return;
    }
    try {
      final result = await _api.search(clientId: _selectedClient!.id, query: query);
      final resultados = (result['resultados'] as List? ?? [])
          .map((e) => DocumentModel.fromJson(e as Map<String, dynamic>))
          .toList();
      setState(() => _visibleDocuments = resultados);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro na pesquisa: $e')));
      }
    }
  }

  Future<void> _onMoveDocument(DocumentModel doc, String category, String? subcategory) async {
    try {
      await _api.moveDocument(documentId: doc.id, category: category, subcategory: subcategory);
      await _loadDocuments();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro ao mover documento: $e')));
      }
    }
  }

  Future<void> _askAssistant() async {
    if (_selectedClient == null) return;
    final controller = TextEditingController();
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Assistente Jurídico de Documentos'),
        content: SizedBox(
          width: 480,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: controller,
                decoration: const InputDecoration(
                  hintText: 'Ex.: "Quais documentos ainda faltam para este processo?"',
                ),
                onSubmitted: (_) {},
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Fechar')),
          FilledButton(
            onPressed: () async {
              final question = controller.text.trim();
              if (question.isEmpty) return;
              Navigator.pop(context);
              try {
                final result = await _api.askAssistant(clientId: _selectedClient!.id, question: question);
                if (mounted) {
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Resposta'),
                      content: Text(result['resposta']?.toString() ?? ''),
                      actions: [
                        TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK')),
                      ],
                    ),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro: $e')));
                }
              }
            },
            child: const Text('Perguntar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('JS Organizador Inteligente'),
        actions: [
          IconButton(
            tooltip: 'Assistente Jurídico',
            icon: const Icon(Icons.smart_toy_outlined),
            onPressed: _selectedClient == null ? null : _askAssistant,
          ),
          IconButton(
            tooltip: 'Alternar tema claro/escuro',
            icon: Icon(themeProvider.mode == ThemeMode.dark ? Icons.dark_mode : Icons.light_mode),
            onPressed: themeProvider.toggle,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: _error != null
          ? Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(_error!)))
          : Row(
              children: [
                SizedBox(
                  width: 280,
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            Expanded(
                              child: DropdownButton<ClientModel>(
                                isExpanded: true,
                                value: _selectedClient,
                                hint: const Text('Selecione um cliente'),
                                items: _clients
                                    .map((c) => DropdownMenuItem(value: c, child: Text(c.name, overflow: TextOverflow.ellipsis)))
                                    .toList(),
                                onChanged: (client) {
                                  setState(() {
                                    _selectedClient = client;
                                    _selectedCategory = null;
                                    _selectedSubcategory = null;
                                  });
                                  _loadDocuments();
                                },
                              ),
                            ),
                            IconButton(
                              tooltip: 'Novo cliente',
                              icon: const Icon(Icons.person_add_alt_1),
                              onPressed: _createClient,
                            ),
                          ],
                        ),
                      ),
                      const Divider(height: 1),
                      Expanded(
                        child: ExplorerTree(
                          documents: _documents,
                          selectedCategory: _selectedCategory,
                          selectedSubcategory: _selectedSubcategory,
                          onSelect: (category, subcategory) {
                            setState(() {
                              _selectedCategory = category;
                              _selectedSubcategory = subcategory;
                              _applyFilter();
                            });
                          },
                        ),
                      ),
                    ],
                  ),
                ),
                const VerticalDivider(width: 1),
                Expanded(
                  flex: 3,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        SearchBarWidget(onSearch: _onSearch),
                        const SizedBox(height: 12),
                        DropZone(onFolderSelected: _onFolderSelected, busy: _importing),
                        ProgressPanel(running: _importing, summary: _lastSummary),
                        const SizedBox(height: 8),
                        Expanded(
                          child: Card(
                            child: DocumentList(documents: _visibleDocuments, onMove: _onMoveDocument),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const VerticalDivider(width: 1),
                SizedBox(
                  width: 320,
                  child: const LogPanel(),
                ),
              ],
            ),
    );
  }
}

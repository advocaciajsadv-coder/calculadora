import 'dart:convert';
import 'package:http/http.dart' as http;

import '../models/models.dart';

/// Cliente HTTP para o backend local (FastAPI em 127.0.0.1).
///
/// O backend nunca é exposto fora do localhost: toda a comunicação acontece
/// entre o app Flutter e o processo Python rodando na mesma máquina.
class ApiService {
  final String baseUrl;

  ApiService({this.baseUrl = 'http://127.0.0.1:8756'});

  Uri _uri(String path) => Uri.parse('$baseUrl$path');

  Future<List<ClientModel>> listClients() async {
    final res = await http.get(_uri('/clients'));
    _checkOk(res);
    final list = jsonDecode(res.body) as List;
    return list.map((e) => ClientModel.fromJson(e)).toList();
  }

  Future<ClientModel> createClient({
    required String name,
    required String rootPath,
    String? areaDoDireito,
  }) async {
    final res = await http.post(
      _uri('/clients'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': name,
        'root_path': rootPath,
        'area_do_direito': areaDoDireito,
      }),
    );
    _checkOk(res);
    return ClientModel.fromJson(jsonDecode(res.body));
  }

  Future<List<DocumentModel>> listDocuments(int clientId) async {
    final res = await http.get(_uri('/clients/$clientId/documents'));
    _checkOk(res);
    final list = jsonDecode(res.body) as List;
    return list.map((e) => DocumentModel.fromJson(e)).toList();
  }

  Future<ImportSummary> importFolder({
    required int clientId,
    required String sourceFolder,
    String? duplicatePolicy,
  }) async {
    final res = await http.post(
      _uri('/documents/import'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'client_id': clientId,
        'source_folder': sourceFolder,
        'duplicate_policy': duplicatePolicy,
      }),
    );
    _checkOk(res);
    return ImportSummary.fromJson(jsonDecode(res.body));
  }

  Future<DocumentModel> moveDocument({
    required int documentId,
    required String category,
    String? subcategory,
  }) async {
    final res = await http.post(
      _uri('/documents/move'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'document_id': documentId,
        'category': category,
        'subcategory': subcategory,
      }),
    );
    _checkOk(res);
    return DocumentModel.fromJson(jsonDecode(res.body));
  }

  Future<Map<String, dynamic>> search({
    required int clientId,
    required String query,
  }) async {
    final res = await http.post(
      _uri('/search'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'client_id': clientId, 'query': query}),
    );
    _checkOk(res);
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> askAssistant({
    required int clientId,
    required String question,
  }) async {
    final res = await http.post(
      _uri('/assistant/ask'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'client_id': clientId, 'question': question}),
    );
    _checkOk(res);
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> listTrash() async {
    final res = await http.get(_uri('/trash'));
    _checkOk(res);
    return (jsonDecode(res.body) as List).cast<Map<String, dynamic>>();
  }

  Future<void> restoreFromTrash(int trashId) async {
    final res = await http.post(
      _uri('/trash/restore'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'trash_id': trashId}),
    );
    _checkOk(res);
  }

  Future<Map<String, dynamic>> getConfig() async {
    final res = await http.get(_uri('/config'));
    _checkOk(res);
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<void> updateConfig(Map<String, dynamic> partial) async {
    final res = await http.put(
      _uri('/config'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(partial),
    );
    _checkOk(res);
  }

  void _checkOk(http.Response res) {
    if (res.statusCode >= 400) {
      throw ApiException(res.statusCode, res.body);
    }
  }
}

class ApiException implements Exception {
  final int statusCode;
  final String body;
  ApiException(this.statusCode, this.body);

  @override
  String toString() => 'Erro da API ($statusCode): $body';
}

/// Modelos de dados espelhando as respostas da API do backend.

class ClientModel {
  final int id;
  final String name;
  final String basePath;
  final String? areaDoDireito;

  ClientModel({
    required this.id,
    required this.name,
    required this.basePath,
    this.areaDoDireito,
  });

  factory ClientModel.fromJson(Map<String, dynamic> json) {
    return ClientModel(
      id: json['id'] as int,
      name: json['name'] as String,
      basePath: json['base_path'] as String,
      areaDoDireito: json['area_do_direito'] as String?,
    );
  }
}

class DocumentModel {
  final int id;
  final String originalName;
  final String currentName;
  final String currentPath;
  final String? docType;
  final String? category;
  final String? subcategory;
  final double? confidence;
  final Map<String, dynamic>? extracted;
  final String status;

  DocumentModel({
    required this.id,
    required this.originalName,
    required this.currentName,
    required this.currentPath,
    this.docType,
    this.category,
    this.subcategory,
    this.confidence,
    this.extracted,
    this.status = 'ativo',
  });

  factory DocumentModel.fromJson(Map<String, dynamic> json) {
    return DocumentModel(
      id: json['id'] as int,
      originalName: json['original_name'] as String,
      currentName: json['current_name'] as String,
      currentPath: json['current_path'] as String,
      docType: json['doc_type'] as String?,
      category: json['category'] as String?,
      subcategory: json['subcategory'] as String?,
      confidence: (json['confidence'] as num?)?.toDouble(),
      extracted: json['extracted_json'] is Map
          ? Map<String, dynamic>.from(json['extracted_json'] as Map)
          : null,
      status: json['status'] as String? ?? 'ativo',
    );
  }
}

class LogEvent {
  final String level;
  final String module;
  final String message;
  final String timestamp;

  LogEvent({
    required this.level,
    required this.module,
    required this.message,
    required this.timestamp,
  });

  factory LogEvent.fromJson(Map<String, dynamic> json) {
    return LogEvent(
      level: json['level'] as String? ?? 'info',
      module: json['module'] as String? ?? '',
      message: json['message'] as String? ?? '',
      timestamp: json['timestamp'] as String? ?? '',
    );
  }
}

class ImportSummary {
  final int total;
  final int processados;
  final int duplicados;
  final int naoIdentificados;
  final int erros;

  ImportSummary({
    required this.total,
    required this.processados,
    required this.duplicados,
    required this.naoIdentificados,
    required this.erros,
  });

  factory ImportSummary.fromJson(Map<String, dynamic> json) {
    return ImportSummary(
      total: json['total'] as int? ?? 0,
      processados: json['processados'] as int? ?? 0,
      duplicados: json['duplicados'] as int? ?? 0,
      naoIdentificados: json['nao_identificados'] as int? ?? 0,
      erros: json['erros'] as int? ?? 0,
    );
  }
}

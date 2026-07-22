import 'package:flutter/material.dart';

/// Paleta e temas claro/escuro do JS Organizador Inteligente.
class AppColors {
  static const primary = Color(0xFF1F5C4C); // verde institucional escritório jurídico
  static const primaryLight = Color(0xFF3E8F76);
  static const accent = Color(0xFFC9A24B); // dourado sóbrio
}

class AppTheme {
  static ThemeData light = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: Brightness.light,
    ),
    scaffoldBackgroundColor: const Color(0xFFF5F6F7),
    fontFamily: 'Segoe UI',
    dividerColor: const Color(0xFFE0E0E0),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFFFFFFFF),
      foregroundColor: Colors.black87,
      elevation: 0,
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: Color(0xFFE0E0E0)),
      ),
    ),
  );

  static ThemeData dark = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primaryLight,
      brightness: Brightness.dark,
    ),
    scaffoldBackgroundColor: const Color(0xFF1B1D1E),
    fontFamily: 'Segoe UI',
    dividerColor: const Color(0xFF3A3D3E),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFF242627),
      foregroundColor: Colors.white70,
      elevation: 0,
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      color: const Color(0xFF242627),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: Color(0xFF3A3D3E)),
      ),
    ),
  );
}

Color logLevelColor(String level, BuildContext context) {
  switch (level) {
    case 'erro':
      return Colors.redAccent;
    case 'aviso':
      return Colors.orangeAccent;
    case 'sucesso':
      return Colors.greenAccent.shade400;
    default:
      return Theme.of(context).colorScheme.onSurfaceVariant;
  }
}

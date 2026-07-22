import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:window_manager/window_manager.dart';

import 'screens/home_screen.dart';
import 'services/backend_launcher.dart';
import 'services/log_stream_service.dart';
import 'services/theme_provider.dart';
import 'theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await windowManager.ensureInitialized();
  await BackendLauncher().start();

  const windowOptions = WindowOptions(
    size: Size(1280, 800),
    minimumSize: Size(1024, 640),
    center: true,
    title: 'JS Organizador Inteligente',
  );
  windowManager.waitUntilReadyToShow(windowOptions, () async {
    await windowManager.show();
    await windowManager.focus();
  });

  runApp(const JSOrganizadorApp());
}

class JSOrganizadorApp extends StatelessWidget {
  const JSOrganizadorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => LogStreamService()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, _) => MaterialApp(
          title: 'JS Organizador Inteligente',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.light,
          darkTheme: AppTheme.dark,
          themeMode: themeProvider.mode,
          home: const HomeScreen(),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'features/auth/login_screen.dart';
import 'features/booking/booking_screen.dart';
import 'features/chat/chat_screen.dart';
import 'models/provider.dart';
import 'screens/discovery_screen.dart';

final _router = GoRouter(
  routes: [
    GoRoute(path: '/', builder: (context, state) => const DiscoveryScreen()),
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(
        path: '/book',
        builder: (context, state) =>
            BookingScreen(provider: state.extra! as ProviderProfile)),
    GoRoute(path: '/messages', builder: (context, state) => const ChatScreen()),
  ],
);

class CueApp extends StatelessWidget {
  const CueApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Cue',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xffd86e51), brightness: Brightness.light),
        scaffoldBackgroundColor: const Color(0xfff6f3ed),
        fontFamily: 'sans',
        useMaterial3: true,
      ),
      routerConfig: _router,
    );
  }
}

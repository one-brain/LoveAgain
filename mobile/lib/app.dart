import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'core/theme.dart';
import 'data/mock_data.dart';
import 'features/auth/auth_controller.dart';
import 'features/auth/login_screen.dart';
import 'features/booking/booking_screen.dart';
import 'features/chat/chat_screen.dart';
import 'features/discovery/provider_detail_screen.dart';
import 'features/navigation/main_navigation_shell.dart';
import 'models/booking.dart';
import 'models/provider.dart';

class RouterNotifier extends ChangeNotifier {
  RouterNotifier(this._ref) {
    _ref.listen<AuthState>(authControllerProvider, (prev, next) {
      if (prev?.isAuthenticated != next.isAuthenticated) {
        notifyListeners();
      }
    });
  }

  final Ref _ref;

  String? redirect(BuildContext context, GoRouterState state) {
    final auth = _ref.read(authControllerProvider);
    final isLoggingIn = state.matchedLocation == '/login';

    if (!auth.isAuthenticated) {
      return isLoggingIn ? null : '/login';
    }
    if (isLoggingIn) {
      return '/';
    }
    return null;
  }
}

final routerNotifierProvider = Provider<RouterNotifier>((ref) {
  return RouterNotifier(ref);
});

final routerProvider = Provider<GoRouter>((ref) {
  final notifier = ref.watch(routerNotifierProvider);

  return GoRouter(
    initialLocation: '/',
    refreshListenable: notifier,
    redirect: notifier.redirect,
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const MainNavigationShell(initialIndex: 0),
      ),
      GoRoute(
        path: '/bookings',
        builder: (context, state) => const MainNavigationShell(initialIndex: 1),
      ),
      GoRoute(
        path: '/messages',
        builder: (context, state) => const MainNavigationShell(initialIndex: 2),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const MainNavigationShell(initialIndex: 3),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/provider/:id',
        builder: (context, state) {
          final extra = state.extra;
          if (extra is ProviderProfile) {
            return ProviderDetailScreen(provider: extra);
          }
          final providerId = state.pathParameters['id'] ?? '';
          final provider = MockData.seedProviders.firstWhere(
            (p) => p.id == providerId,
            orElse: () => MockData.seedProviders.first,
          );
          return ProviderDetailScreen(provider: provider);
        },
      ),
      GoRoute(
        path: '/book',
        builder: (context, state) {
          final extra = state.extra;
          final provider = extra is ProviderProfile
              ? extra
              : MockData.seedProviders.first;
          return BookingScreen(provider: provider);
        },
      ),
      GoRoute(
        path: '/chat/:orderId',
        builder: (context, state) {
          final orderId = state.pathParameters['orderId'] ?? 'ord-8801';
          final extra = state.extra;
          return ChatScreen(
            orderId: orderId,
            booking: extra is Booking ? extra : null,
          );
        },
      ),
    ],
  );
});

class CueApp extends ConsumerWidget {
  const CueApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'Cue',
      theme: AppTheme.lightTheme,
      debugShowCheckedModeBanner: false,
      routerConfig: router,
    );
  }
}

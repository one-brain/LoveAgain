import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'core/theme.dart';
import 'features/auth/auth_controller.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/otp_verification_screen.dart';
import 'features/booking/booking_screen.dart';
import 'features/chat/chat_screen.dart';
import 'features/discovery/discovery_controller.dart';
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
    final isAuthRoute = state.matchedLocation == '/login' ||
        state.matchedLocation == '/otp-verify';

    if (!auth.isAuthenticated) {
      return isAuthRoute ? null : '/login';
    }
    if (isAuthRoute) {
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
        path: '/wallet',
        builder: (context, state) => const MainNavigationShell(initialIndex: 2),
      ),
      GoRoute(
        path: '/messages',
        builder: (context, state) => const MainNavigationShell(initialIndex: 3),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const MainNavigationShell(initialIndex: 4),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/otp-verify',
        builder: (context, state) {
          final email = state.uri.queryParameters['email'] ??
              (state.extra as String?) ??
              'alex.rivera@example.com';
          return OtpVerificationScreen(email: email);
        },
      ),
      GoRoute(
        path: '/provider/:id',
        builder: (context, state) {
          final extra = state.extra;
          if (extra is ProviderProfile) {
            return ProviderDetailScreen(provider: extra);
          }
          final providerId = state.pathParameters['id'] ?? '';
          return _ProviderRouteLoader(providerId: providerId, isBooking: false);
        },
      ),
      GoRoute(
        path: '/book',
        builder: (context, state) {
          final extra = state.extra;
          if (extra is ProviderProfile) {
            return BookingScreen(provider: extra);
          }
          final providerId = state.uri.queryParameters['providerId'] ?? '';
          return _ProviderRouteLoader(providerId: providerId, isBooking: true);
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

class _ProviderRouteLoader extends ConsumerWidget {
  const _ProviderRouteLoader({required this.providerId, required this.isBooking});
  final String providerId;
  final bool isBooking;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (providerId.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Companion Profile')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.person_search_outlined, size: 56, color: AppColors.textMuted),
              const SizedBox(height: 12),
              const Text('Please select a companion first', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () => context.go('/'),
                child: const Text('Explore Companions'),
              ),
            ],
          ),
        ),
      );
    }

    final repo = ref.read(discoveryRepositoryProvider);
    return FutureBuilder<ProviderProfile?>(
      future: repo.getProviderById(providerId),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
          );
        }
        final provider = snapshot.data;
        if (provider != null) {
          return isBooking
              ? BookingScreen(provider: provider)
              : ProviderDetailScreen(provider: provider);
        }
        return Scaffold(
          appBar: AppBar(title: const Text('Companion Profile')),
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.person_off_outlined, size: 56, color: AppColors.textMuted),
                const SizedBox(height: 12),
                const Text('Companion profile not found', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: () => context.go('/'),
                  child: const Text('Back to Discovery'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class CueApp extends ConsumerWidget {
  const CueApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'Cue',
      theme: AppTheme.lightTheme,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}

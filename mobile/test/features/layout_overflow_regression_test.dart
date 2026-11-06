import 'package:cue_mobile/core/api_client.dart';
import 'package:cue_mobile/data/repositories/booking_repository.dart';
import 'package:cue_mobile/features/auth/auth_controller.dart';
import 'package:cue_mobile/features/booking/booking_controller.dart';
import 'package:cue_mobile/features/booking/bookings_screen.dart';
import 'package:cue_mobile/features/profile/profile_screen.dart';
import 'package:cue_mobile/models/user.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Layout Overflow Regression Tests', () {
    testWidgets(
        'BookingsScreen empty state renders without overflow in horizontal/landscape mode',
        (tester) async {
      // Set landscape orientation viewport (e.g. 720 wide x 320 high)
      tester.view.physicalSize = const Size(720, 320);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      final fakeApi = ApiClient(dio: Dio());
      final repo = BookingRepository(fakeApi);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            bookingRepositoryProvider.overrideWithValue(repo),
          ],
          child: const MaterialApp(
            home: BookingsScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap on Cancelled tab where there are 0 bookings
      final cancelledTab = find.textContaining('Cancelled');
      expect(cancelledTab, findsOneWidget);
      await tester.tap(cancelledTab);
      await tester.pumpAndSettle();

      // Verify the empty state displays without any RenderFlex overflow exceptions
      expect(find.textContaining('No cancelled outings'), findsOneWidget);
      expect(find.text('Explore Companions'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets(
        'ProfileScreen renders user profile and host dashboard cleanly without right overflow',
        (tester) async {
      // Set vertical narrow viewport (340 wide x 640 high)
      tester.view.physicalSize = const Size(340, 640);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      const mockGuestUser = User(
        id: 'user-guest-001',
        email: 'alex.rivera@example.com',
        firstName: 'Alex',
        lastName: 'Rivera',
        roles: ['Guest'],
        city: 'Bengaluru',
        trustScore: 92,
        isVerified: true,
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authControllerProvider.overrideWith((ref) => MockAuthController(
                  const AuthState(
                    user: mockGuestUser,
                    activeRole: 'Guest',
                    token: 'mock-token',
                  ),
                )),
          ],
          child: const MaterialApp(
            home: ProfileScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify persona toggle switch is completely removed
      expect(find.text('Guest Mode'), findsNothing);
      expect(find.text('Host Mode'), findsNothing);
      expect(find.text('Exploring curated companions & outings'), findsNothing);
      expect(find.text('Alex Rivera'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  });
}

class MockAuthController extends StateNotifier<AuthState>
    implements AuthController {
  MockAuthController(super.initialState);

  @override
  void toggleRole() {
    final nextRole = state.isHostMode ? 'Guest' : 'Host';
    state = AuthState(
      user: state.user,
      activeRole: nextRole,
      token: state.token,
    );
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}


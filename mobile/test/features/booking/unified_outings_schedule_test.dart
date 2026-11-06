import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:cue_mobile/features/auth/auth_controller.dart';
import 'package:cue_mobile/features/booking/booking_controller.dart';
import 'package:cue_mobile/features/booking/bookings_screen.dart';
import 'package:cue_mobile/models/booking.dart';
import 'package:cue_mobile/models/user.dart';

void main() {
  group('Unified Outings Schedule & Card Differentiation Tests', () {
    final now = DateTime.now();

    // Outing where current user (user-123) is ATTENDING as Guest
    final guestBooking = Booking(
      orderId: 'ord-guest-001',
      providerId: 'provider-vinay-456',
      providerName: 'Vinay Naik',
      providerInitials: 'VN',
      seekerId: 'user-123',
      seekerName: 'Naveen Bathina',
      startTime: now.add(const Duration(hours: 2)),
      endTime: now.add(const Duration(hours: 4)),
      hourlyRate: 1500,
      durationHours: 2,
      providerEarnings: 2550,
      platformFee: 450,
      totalAmount: 3000,
      status: BookingStatus.confirmed,
      meetingAddress: 'NCPA Nariman Point, Mumbai',
    );

    // Outing where current user (user-123) is HOSTING as Companion
    final hostBooking = Booking(
      orderId: 'ord-host-002',
      providerId: 'user-123',
      providerName: 'Naveen Bathina',
      providerInitials: 'NB',
      seekerId: 'guest-alex-789',
      seekerName: 'Alex Rivera',
      startTime: now.add(const Duration(hours: 6)),
      endTime: now.add(const Duration(hours: 8)),
      hourlyRate: 2000,
      durationHours: 2,
      providerEarnings: 3400,
      platformFee: 600,
      totalAmount: 4000,
      status: BookingStatus.confirmed,
      meetingAddress: 'Indiranagar 100ft Road, Bengaluru',
    );

    testWidgets('Renders both Attending and Hosting cards together with distinct badges and details',
        (tester) async {
      final authState = AuthState(
        user: const User(
          id: 'user-123',
          email: 'naveen@cue.local',
          firstName: 'Naveen',
          lastName: 'Bathina',
          roles: ['Guest', 'Host'],
        ),
        activeRole: 'Guest',
        token: 'test-token',
      );

      final initialBookingsState = BookingsState(
        bookings: [guestBooking, hostBooking],
        currentUserId: 'user-123',
        selectedTab: 'active',
        selectedRoleFilter: 'all',
      );

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authControllerProvider.overrideWith((ref) => FakeAuthController(authState)),
            bookingControllerProvider.overrideWith(
                (ref) => FakeBookingController(initialBookingsState)),
          ],
          child: const MaterialApp(
            home: BookingsScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify Header title and Status pills
      expect(find.text('My Outings'), findsOneWidget);
      expect(find.text('Active (2)'), findsOneWidget);
      expect(find.text('Completed (0)'), findsOneWidget);
      expect(find.text('Cancelled (0)'), findsOneWidget);

      // Verify Role Scope Chips
      expect(find.text('All Outings'), findsOneWidget);
      expect(find.text('Attending'), findsOneWidget);
      expect(find.text('Hosting'), findsOneWidget);

      // Verify Both Role Badges rendered in the unified feed
      expect(find.text('ATTENDING'), findsOneWidget);
      expect(find.text('HOSTING'), findsOneWidget);

      // Verify Counterpart Details
      // On the Guest card: Counterpart is Host Vinay Naik
      expect(find.text('Vinay Naik'), findsOneWidget);
      expect(find.text('VN'), findsOneWidget);
      expect(find.textContaining('Total paid • 2.0 hrs'), findsOneWidget);

      // On the Host card: Counterpart is Guest Alex Rivera
      expect(find.text('Alex Rivera'), findsOneWidget);
      expect(find.text('AR'), findsOneWidget);
      expect(find.textContaining('Your payout • 2.0 hrs'), findsOneWidget);

      // Verify action buttons
      expect(find.text('View PIN'), findsOneWidget); // Guest confirmed
      expect(find.text('Verify PIN'), findsOneWidget); // Host confirmed
    });

    testWidgets('Tapping role filter filters schedule between Attending and Hosting',
        (tester) async {
      final authState = AuthState(
        user: const User(
          id: 'user-123',
          email: 'naveen@cue.local',
          firstName: 'Naveen',
          lastName: 'Bathina',
          roles: ['Guest', 'Host'],
        ),
        activeRole: 'Guest',
        token: 'test-token',
      );

      final initialBookingsState = BookingsState(
        bookings: [guestBooking, hostBooking],
        currentUserId: 'user-123',
        selectedTab: 'active',
        selectedRoleFilter: 'all',
      );

      final fakeBookingNotifier = FakeBookingController(initialBookingsState);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authControllerProvider.overrideWith((ref) => FakeAuthController(authState)),
            bookingControllerProvider.overrideWith((ref) => fakeBookingNotifier),
          ],
          child: const MaterialApp(
            home: BookingsScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap 'Attending' filter chip
      await tester.tap(find.text('Attending'));
      await tester.pumpAndSettle();

      expect(find.text('ATTENDING'), findsOneWidget);
      expect(find.text('HOSTING'), findsNothing);

      // Tap 'Hosting' filter chip
      await tester.tap(find.text('Hosting'));
      await tester.pumpAndSettle();

      expect(find.text('HOSTING'), findsOneWidget);
      expect(find.text('ATTENDING'), findsNothing);

      // Tap 'All Outings' filter chip
      await tester.tap(find.text('All Outings'));
      await tester.pumpAndSettle();

      expect(find.text('ATTENDING'), findsOneWidget);
      expect(find.text('HOSTING'), findsOneWidget);
    });
  });
}

class FakeAuthController extends StateNotifier<AuthState> implements AuthController {
  FakeAuthController(super.state);

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class FakeBookingController extends StateNotifier<BookingsState> implements BookingController {
  FakeBookingController(super.state);

  @override
  void setTab(String tab) {
    state = state.copyWith(selectedTab: tab);
  }

  @override
  void setRoleFilter(String role) {
    state = state.copyWith(selectedRoleFilter: role);
  }

  @override
  Future<void> loadBookings() async {}

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

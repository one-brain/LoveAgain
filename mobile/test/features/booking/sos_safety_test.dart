import 'package:cue_mobile/core/api_client.dart';
import 'package:cue_mobile/data/repositories/booking_repository.dart';
import 'package:cue_mobile/features/auth/auth_controller.dart';
import 'package:cue_mobile/features/booking/booking_controller.dart';
import 'package:cue_mobile/features/booking/booking_detail_screen.dart';
import 'package:cue_mobile/features/booking/widgets/emergency_sos_bottom_sheet.dart';
import 'package:cue_mobile/models/booking.dart';
import 'package:cue_mobile/models/user.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('In-Person Safety SOS & Emergency Hub Tests', () {
    late Booking testBooking;

    setUp(() {
      testBooking = Booking(
        orderId: 'ord-safety-001',
        providerId: 'prov-001',
        providerName: 'Aarav Mehta',
        providerInitials: 'AM',
        seekerId: 'user-001',
        seekerName: 'Alex Rivera',
        startTime: DateTime.now(),
        endTime: DateTime.now().add(const Duration(hours: 2)),
        hourlyRate: 1500,
        durationHours: 2,
        providerEarnings: 3000,
        platformFee: 300,
        totalAmount: 3300,
        status: BookingStatus.inProgress,
        meetingAddress: 'Indiranagar 100ft Road, Bengaluru',
        arrivalPin: '482910',
        completionPin: '739184',
      );
    });

    testWidgets('EmergencySosBottomSheet renders all emergency safety options',
        (tester) async {
      final fakeApi = ApiClient(dio: Dio());
      final repo = BookingRepository(fakeApi);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            bookingRepositoryProvider.overrideWithValue(repo),
          ],
          child: MaterialApp(
            home: Scaffold(
              body: EmergencySosBottomSheet(booking: testBooking),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Emergency Safety Hub'), findsOneWidget);
      expect(find.textContaining('Indiranagar 100ft Road'), findsOneWidget);
      expect(find.text('Call 112 (National Emergency)'), findsOneWidget);
      expect(find.text('Alert Emergency Contact'), findsOneWidget);
      expect(find.text('End Outing & Freeze Escrow'), findsOneWidget);
      expect(find.textContaining('Escrow Guarantee'), findsOneWidget);
    });

    testWidgets(
        'Call 112 button opens confirmation dialog with location details',
        (tester) async {
      final fakeApi = ApiClient(dio: Dio());
      final repo = BookingRepository(fakeApi);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            bookingRepositoryProvider.overrideWithValue(repo),
          ],
          child: MaterialApp(
            home: Scaffold(
              body: EmergencySosBottomSheet(booking: testBooking),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Call 112 (National Emergency)'));
      await tester.pumpAndSettle();

      expect(find.text('Call Emergency 112'), findsOneWidget);
      expect(find.textContaining('National Emergency Helpline (112)'),
          findsOneWidget);
      expect(find.text('Indiranagar 100ft Road, Bengaluru'), findsOneWidget);
      expect(find.text('Confirm & Call 112'), findsOneWidget);

      await tester.tap(find.text('Confirm & Call 112'));
      await tester.pumpAndSettle();

      expect(find.textContaining('Dispatched emergency notification'),
          findsOneWidget);
    });

    testWidgets(
        'Alert Emergency Contact dispatches SMS alert with meeting address',
        (tester) async {
      final fakeApi = ApiClient(dio: Dio());
      final repo = BookingRepository(fakeApi);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            bookingRepositoryProvider.overrideWithValue(repo),
          ],
          child: MaterialApp(
            home: Scaffold(
              body: Builder(
                builder: (context) => ElevatedButton(
                  onPressed: () =>
                      EmergencySosBottomSheet.show(context, testBooking),
                  child: const Text('Open SOS'),
                ),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Open SOS'));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Alert Emergency Contact'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(
          find.textContaining('Live outing alert dispatched'), findsOneWidget);
    });

    testWidgets('End Outing & Freeze Escrow updates status to disputed',
        (tester) async {
      final fakeApi = ApiClient(dio: Dio());
      final repo = BookingRepository(fakeApi);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            bookingRepositoryProvider.overrideWithValue(repo),
          ],
          child: MaterialApp(
            home: Scaffold(
              body: Builder(
                builder: (context) => ElevatedButton(
                  onPressed: () =>
                      EmergencySosBottomSheet.show(context, testBooking),
                  child: const Text('Open SOS'),
                ),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Open SOS'));
      await tester.pumpAndSettle();

      await tester.tap(find.text('End Outing & Freeze Escrow'));
      await tester.pumpAndSettle();

      expect(find.text('End Outing & Freeze Escrow'), findsWidgets);
      expect(find.text('Felt uncomfortable or unsafe'), findsOneWidget);

      await tester.tap(find.text('Freeze & End Outing'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.textContaining('ended under safety dispute'), findsOneWidget);
    });

    testWidgets(
        'BookingDetailScreen displays Safety Shield banner and SOS button',
        (tester) async {
      final fakeApi = ApiClient(dio: Dio());
      final repo = BookingRepository(fakeApi);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            bookingRepositoryProvider.overrideWithValue(repo),
            authControllerProvider.overrideWith((ref) => AuthControllerMock(
                  const User(
                    id: 'user-001',
                    email: 'alex@example.com',
                    firstName: 'Alex',
                    lastName: 'Rivera',
                    roles: ['Guest'],
                    isVerified: true,
                    phone: '+91 98765 43210',
                  ),
                )),
          ],
          child: MaterialApp(
            home: BookingDetailScreen(booking: testBooking),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('In-Person Safety Shield Active'), findsOneWidget);
      expect(find.text('SOS HUB'), findsOneWidget);
      expect(find.byTooltip('Safety SOS Hub'), findsOneWidget);

      // Tap SOS HUB opens sheet
      await tester.tap(find.text('SOS HUB'));
      await tester.pumpAndSettle();

      expect(find.text('Emergency Safety Hub'), findsOneWidget);
    });
  });
}

class AuthControllerMock extends StateNotifier<AuthState>
    implements AuthController {
  AuthControllerMock(User user)
      : super(AuthState(
          user: user,
          activeRole: 'Guest',
          token: 'mock-token-xyz',
        ));

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

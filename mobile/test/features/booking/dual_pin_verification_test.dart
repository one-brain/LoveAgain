import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:cue_mobile/core/api_client.dart';
import 'package:cue_mobile/data/repositories/booking_repository.dart';
import 'package:cue_mobile/features/booking/widgets/arrival_pin_voucher_card.dart';
import 'package:cue_mobile/features/booking/widgets/completion_pin_voucher_card.dart';
import 'package:cue_mobile/features/booking/widgets/pin_verification_modal.dart';
import 'package:cue_mobile/models/booking.dart';

void main() {
  group('Dual-PIN In-Person Verification Repository Tests', () {
    late BookingRepository repository;

    setUp(() {
      repository = BookingRepository(ApiClient());
    });

    test('checkInWithPin transitions Confirmed outing to InProgress with valid PIN', () async {
      // 'ord-8801' is Confirmed with arrivalPin '482910'
      final updated = await repository.checkInWithPin('ord-8801', '482910');
      expect(updated.status, BookingStatus.inProgress);
    });

    test('checkInWithPin rejects invalid arrival PIN with ArgumentError', () async {
      expect(
        () => repository.checkInWithPin('ord-8801', '000000'),
        throwsA(isA<ArgumentError>().having(
          (e) => e.message,
          'message',
          contains('Invalid arrival PIN'),
        )),
      );
    });

    test('completeWithPin forbids completing an outing before InProgress', () async {
      // 'ord-8803' is PendingPayment, not InProgress
      expect(
        () => repository.completeWithPin('ord-8803', '918234'),
        throwsA(isA<StateError>().having(
          (e) => e.message,
          'message',
          contains('cannot be completed before session is initiated'),
        )),
      );
    });

    test('completeWithPin transitions InProgress outing to Completed with valid PIN', () async {
      // First check in to InProgress
      await repository.checkInWithPin('ord-8801', '482910');

      // Then complete with valid Completion PIN '739184'
      final completed = await repository.completeWithPin('ord-8801', '739184');
      expect(completed.status, BookingStatus.completed);
    });
  });

  group('Voucher Widgets Rendering Tests', () {
    testWidgets('ArrivalPinVoucherCard renders PIN code and copy action',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ArrivalPinVoucherCard(
              pin: '482910',
              hostName: 'Ananya Sen',
            ),
          ),
        ),
      );

      expect(find.text('Arrival Verification PIN'), findsOneWidget);
      expect(find.text('Show to Host'), findsOneWidget);
      expect(find.textContaining('482910'), findsOneWidget);
      expect(find.byIcon(Icons.copy_rounded), findsOneWidget);
    });

    testWidgets('CompletionPinVoucherCard renders PIN code and share instructions',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CompletionPinVoucherCard(
              pin: '739184',
              guestName: 'Alex Rivera',
            ),
          ),
        ),
      );

      expect(find.text('Completion & Escrow Release PIN'), findsOneWidget);
      expect(find.text('Share with Guest'), findsOneWidget);
      expect(find.textContaining('739184'), findsOneWidget);
    });

    testWidgets('PinVerificationModal renders 6 input boxes and verify CTA',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: PinVerificationModal(
              title: 'Verify Arrival PIN',
              subtitle: 'Ask your Guest for the 6-digit code.',
              onVerify: (pin) async => true,
            ),
          ),
        ),
      );

      expect(find.text('Verify Arrival PIN'), findsOneWidget);
      expect(find.byType(TextField), findsNWidgets(6));
      expect(find.text('Verify PIN & Proceed'), findsOneWidget);
    });
  });
}

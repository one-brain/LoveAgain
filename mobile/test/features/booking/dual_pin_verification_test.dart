import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:cue_mobile/core/api_client.dart';
import 'package:cue_mobile/data/repositories/booking_repository.dart';
import 'package:cue_mobile/features/booking/widgets/arrival_pin_voucher_card.dart';
import 'package:cue_mobile/features/booking/widgets/completion_pin_voucher_card.dart';
import 'package:cue_mobile/features/booking/widgets/pin_verification_modal.dart';
import 'package:cue_mobile/models/booking.dart';
import '../../fixtures/seed_data.dart';

class FakeBookingApiClient extends ApiClient {
  FakeBookingApiClient() : super(dio: Dio());

  Booking activeBooking = SeedData.seedBookings.first.copyWith(
    arrivalPin: '482910',
    completionPin: '739184',
    status: BookingStatus.confirmed,
  );

  @override
  Future<Response<T>> patch<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters}) async {
    if (path.contains('/checkin')) {
      final pin = (data as Map<String, dynamic>?)?['pin'];
      if (pin == activeBooking.arrivalPin) {
        activeBooking = activeBooking.copyWith(
          status: BookingStatus.inProgress,
        );
        return Response<T>(
          data: {
            'id': activeBooking.orderId,
            'status': 'InProgress',
            'arrivalPin': activeBooking.arrivalPin,
            'completionPin': activeBooking.completionPin,
          } as T,
          statusCode: 200,
          requestOptions: RequestOptions(path: path),
        );
      }
      return Response<T>(
        data: {'error': 'Invalid PIN'} as T,
        statusCode: 400,
        requestOptions: RequestOptions(path: path),
      );
    }

    if (path.contains('/complete')) {
      final pin = (data as Map<String, dynamic>?)?['completionPin'];
      if (pin == activeBooking.completionPin) {
        activeBooking = activeBooking.copyWith(
          status: BookingStatus.completed,
        );
        return Response<T>(
          data: {
            'id': activeBooking.orderId,
            'status': 'Completed',
            'arrivalPin': activeBooking.arrivalPin,
            'completionPin': activeBooking.completionPin,
          } as T,
          statusCode: 200,
          requestOptions: RequestOptions(path: path),
        );
      }
      return Response<T>(
        data: {'error': 'Invalid PIN'} as T,
        statusCode: 400,
        requestOptions: RequestOptions(path: path),
      );
    }

    return Response<T>(
      data: null as T,
      statusCode: 404,
      requestOptions: RequestOptions(path: path),
    );
  }
}

void main() {
  group('Dual-PIN In-Person Verification Repository Tests', () {
    late BookingRepository repo;
    late FakeBookingApiClient fakeApi;

    setUp(() {
      fakeApi = FakeBookingApiClient();
      repo = BookingRepository(fakeApi);
    });

    test('checkInWithPin transitions Confirmed outing to InProgress with valid PIN', () async {
      expect(fakeApi.activeBooking.status, BookingStatus.confirmed);

      final updated = await repo.checkInWithPin(
        fakeApi.activeBooking.orderId,
        '482910',
      );

      expect(updated.status, BookingStatus.inProgress);
    });

    test('completeWithPin transitions InProgress outing to Completed with valid PIN', () async {
      fakeApi.activeBooking = fakeApi.activeBooking.copyWith(
        status: BookingStatus.inProgress,
      );

      final updated = await repo.completeWithPin(
        fakeApi.activeBooking.orderId,
        '739184',
      );

      expect(updated.status, BookingStatus.completed);
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
      await tester.pumpAndSettle();

      expect(find.text('Arrival Verification PIN'), findsOneWidget);
      expect(find.text('Show to Host'), findsOneWidget);
      expect(find.text('482910'), findsOneWidget);
      expect(find.byIcon(Icons.copy_rounded), findsOneWidget);
    });

    testWidgets('CompletionPinVoucherCard renders PIN code and copy action',
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
      await tester.pumpAndSettle();

      expect(find.text('Completion & Escrow Release PIN'), findsOneWidget);
      expect(find.text('Share with Guest'), findsOneWidget);
      expect(find.text('739184'), findsOneWidget);
      expect(find.byIcon(Icons.copy_rounded), findsOneWidget);
    });

    testWidgets('PinVerificationModal displays keypad and inputs 6 digits',
        (WidgetTester tester) async {
      String? enteredPin;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (ctx) => ElevatedButton(
                onPressed: () {
                  PinVerificationModal.show(
                    ctx,
                    title: 'Enter Verification PIN',
                    subtitle: 'Test 6-digit pin entry',
                    primaryColor: const Color(0xFF881337),
                    onVerify: (pin) async {
                      enteredPin = pin;
                      return true;
                    },
                  );
                },
                child: const Text('Open Modal'),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Open Modal'));
      await tester.pumpAndSettle();

      expect(find.text('Enter Verification PIN'), findsOneWidget);
      expect(find.text('Test 6-digit pin entry'), findsOneWidget);

      final textFields = find.byType(TextField);
      expect(textFields, findsNWidgets(6));

      // Enter digits 4, 8, 2, 9, 1, 0 into the 6 inputs
      final digits = ['4', '8', '2', '9', '1', '0'];
      for (var i = 0; i < 6; i++) {
        await tester.enterText(textFields.at(i), digits[i]);
      }
      await tester.pumpAndSettle();

      expect(enteredPin, '482910');
    });
  });
}

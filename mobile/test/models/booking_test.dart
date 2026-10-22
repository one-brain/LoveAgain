import 'package:flutter_test/flutter_test.dart';
import 'package:cue_mobile/models/booking.dart';

void main() {
  group('Booking Invariant Tests (CONTEXT.md)', () {
    test('enforces that seeker and provider must be different users', () {
      expect(
        () => Booking.validateInvariants(
          seekerId: 'user-001',
          providerId: 'user-001', // same user!
          startTime: DateTime.now(),
          endTime: DateTime.now().add(const Duration(hours: 2)),
          providerEarnings: 90.0,
          platformFee: 9.0,
          totalAmount: 99.0,
        ),
        throwsA(isA<ArgumentError>().having(
          (e) => e.message,
          'message',
          contains('different seeker and provider'),
        )),
      );
    });

    test('enforces that end time must be after start time', () {
      final now = DateTime.now();
      expect(
        () => Booking.validateInvariants(
          seekerId: 'seeker-1',
          providerId: 'provider-1',
          startTime: now,
          endTime: now.subtract(const Duration(hours: 1)), // before start!
          providerEarnings: 50.0,
          platformFee: 5.0,
          totalAmount: 55.0,
        ),
        throwsA(isA<ArgumentError>().having(
          (e) => e.message,
          'message',
          contains('strictly after start time'),
        )),
      );
    });

    test('enforces that monetary values must be non-negative', () {
      final now = DateTime.now();
      expect(
        () => Booking.validateInvariants(
          seekerId: 'seeker-1',
          providerId: 'provider-1',
          startTime: now,
          endTime: now.add(const Duration(hours: 2)),
          providerEarnings: -20.0,
          platformFee: 2.0,
          totalAmount: 22.0,
        ),
        throwsA(isA<ArgumentError>().having(
          (e) => e.message,
          'message',
          contains('must be non-negative'),
        )),
      );
    });

    test('enforces that provider earnings + platform fee equals total amount', () {
      final now = DateTime.now();
      expect(
        () => Booking.validateInvariants(
          seekerId: 'seeker-1',
          providerId: 'provider-1',
          startTime: now,
          endTime: now.add(const Duration(hours: 2)),
          providerEarnings: 100.0,
          platformFee: 10.0,
          totalAmount: 150.0, // Mismatched sum!
        ),
        throwsA(isA<ArgumentError>().having(
          (e) => e.message,
          'message',
          contains('must equal total amount'),
        )),
      );
    });

    test('Booking.create computes 10% platform fee and validates invariants successfully', () {
      final now = DateTime.now();
      final booking = Booking.create(
        orderId: 'ord-test-01',
        providerId: 'prov-01',
        providerName: 'Maya Rodriguez',
        providerInitials: 'MR',
        seekerId: 'seeker-01',
        seekerName: 'Alex Rivera',
        startTime: now,
        durationHours: 3.0,
        hourlyRate: 50.0,
      );

      expect(booking.providerEarnings, 150.0);
      expect(booking.platformFee, 15.0);
      expect(booking.totalAmount, 165.0);
      expect(booking.endTime, now.add(const Duration(hours: 3)));
      expect(booking.status, BookingStatus.pendingPayment);
    });
  });
}


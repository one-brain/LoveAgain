import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:cue_mobile/core/api_client.dart';
import 'package:cue_mobile/data/repositories/payment_repository.dart';
import 'package:cue_mobile/features/wallet/wallet_screen.dart';

void main() {
  group('PaymentRepository & Wallet Flow Tests', () {
    late PaymentRepository repository;

    setUp(() {
      repository = PaymentRepository(ApiClient());
    });

    test('getWalletBalance retrieves balance in INR', () async {
      final wallet = await repository.getWalletBalance();
      expect(wallet.currency, 'INR');
      expect(wallet.availableBalance, greaterThanOrEqualTo(25000.0));
      expect(wallet.pendingBalance, greaterThanOrEqualTo(3300.0));
    });

    test('topUpWallet increments balance with UPI payment', () async {
      final initial = await repository.getWalletBalance();
      final updated = await repository.topUpWallet(2000.0);
      expect(updated.availableBalance, initial.availableBalance + 2000.0);
    });

    test('getProviderEarnings returns gross revenue and cleared balance', () async {
      final earnings = await repository.getProviderEarnings();
      expect(earnings.currency, 'INR');
      expect(earnings.clearedBalance, 32400.0);
      expect(earnings.platformCommission, 3600.0);
    });

    test('requestPayout succeeds with valid UPI destination', () async {
      final success = await repository.requestPayout(
        amount: 5000.0,
        payoutType: 'Upi',
        destination: 'ananya.sen@okhdfcbank',
      );
      expect(success, true);
    });
  });

  group('WalletScreen Widget Tests', () {
    testWidgets('renders available balance card and Escrow security badge',
        (WidgetTester tester) async {
      // Set phone size
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: WalletScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify header and title
      expect(find.text('Cue Wallet & Escrow'), findsOneWidget);
      expect(find.text('AVAILABLE BALANCE'), findsOneWidget);
      expect(find.text('100% Escrow Secured'), findsOneWidget);

      // Verify Add Money button
      expect(find.text('Add Money'), findsOneWidget);

      // Verify Host Earnings section
      expect(find.text('Host Earnings & Payouts'), findsOneWidget);
      expect(find.text('Withdraw UPI'), findsOneWidget);

      // Verify Transactions section
      expect(find.text('Ledger & Transactions'), findsOneWidget);
    });
  });
}

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:cue_mobile/core/api_client.dart';
import 'package:cue_mobile/data/repositories/payment_repository.dart';
import 'package:cue_mobile/features/wallet/wallet_controller.dart';
import 'package:cue_mobile/features/wallet/wallet_screen.dart';

class FakePaymentApiClient extends ApiClient {
  FakePaymentApiClient() : super(dio: Dio());

  double _availableBalance = 25000.0;
  final double _pendingBalance = 3300.0;

  @override
  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters}) async {
    if (path.contains('/payments/wallet/balance')) {
      return Response<T>(
        data: {
          'userId': 'user-guest-001',
          'availableBalance': _availableBalance,
          'pendingBalance': _pendingBalance,
          'currency': 'INR',
        } as T,
        statusCode: 200,
        requestOptions: RequestOptions(path: path),
      );
    }
    if (path.contains('/payments/wallet/transactions')) {
      return Response<T>(
        data: [
          {
            'id': 'tx_1',
            'amount': 5000.0,
            'direction': 'Credit',
            'type': 'TopUp',
            'balanceAfter': 25000.0,
            'description': 'UPI Wallet Top-Up (Google Pay)',
            'createdAt': DateTime.now().toIso8601String(),
          }
        ] as T,
        statusCode: 200,
        requestOptions: RequestOptions(path: path),
      );
    }
    if (path.contains('/payments/provider/earnings')) {
      return Response<T>(
        data: {
          'grossRevenue': 36000.0,
          'platformCommission': 3600.0,
          'clearedBalance': 32400.0,
          'pendingBalance': 3000.0,
          'currency': 'INR',
        } as T,
        statusCode: 200,
        requestOptions: RequestOptions(path: path),
      );
    }
    return Response<T>(
      data: {} as T,
      statusCode: 200,
      requestOptions: RequestOptions(path: path),
    );
  }

  @override
  Future<Response<T>> post<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters}) async {
    if (path.contains('/payments/wallet/topup/order')) {
      return Response<T>(
        data: {
          'orderId': 'order_rzp_mock',
          'amount': data?['amount'] ?? 1000.0,
          'currency': 'INR',
        } as T,
        statusCode: 200,
        requestOptions: RequestOptions(path: path),
      );
    }
    if (path.contains('/payments/wallet/topup/verify')) {
      final amt = (data?['amount'] as num?)?.toDouble() ?? 1000.0;
      _availableBalance += amt;
      return Response<T>(
        data: {
          'userId': 'user-guest-001',
          'availableBalance': _availableBalance,
          'pendingBalance': _pendingBalance,
          'currency': 'INR',
        } as T,
        statusCode: 200,
        requestOptions: RequestOptions(path: path),
      );
    }
    if (path.contains('/payments/payout/request')) {
      return Response<T>(
        data: {'status': 'Completed'} as T,
        statusCode: 200,
        requestOptions: RequestOptions(path: path),
      );
    }
    return Response<T>(
      data: {} as T,
      statusCode: 200,
      requestOptions: RequestOptions(path: path),
    );
  }
}

void main() {
  group('PaymentRepository & Wallet Flow Tests', () {
    late PaymentRepository repository;

    setUp(() {
      repository = PaymentRepository(FakePaymentApiClient());
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
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final fakeApi = FakePaymentApiClient();
      final repository = PaymentRepository(fakeApi);

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            paymentRepositoryProvider.overrideWithValue(repository),
          ],
          child: const MaterialApp(
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

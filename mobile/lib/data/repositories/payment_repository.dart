import '../../core/api_client.dart';
import '../../models/wallet.dart';

class PaymentRepository {
  PaymentRepository(this._client);

  final ApiClient _client;

  Future<WalletModel> getWalletBalance() async {
    final response = await _client.get('/payments/wallet/balance');
    if (response.statusCode == 200 && response.data != null) {
      return WalletModel.fromJson(response.data as Map<String, dynamic>);
    }
    throw ApiException(
      message: 'Failed to retrieve live wallet balance',
      statusCode: response.statusCode,
    );
  }

  Future<List<WalletTransactionModel>> getWalletTransactions({int limit = 20}) async {
    final response = await _client.get(
      '/payments/wallet/transactions',
      queryParameters: {'limit': limit},
    );
    if (response.statusCode == 200 && response.data is List) {
      return (response.data as List)
          .map((item) => WalletTransactionModel.fromJson(item as Map<String, dynamic>))
          .toList();
    }
    throw ApiException(
      message: 'Failed to retrieve wallet transactions',
      statusCode: response.statusCode,
    );
  }

  Future<WalletModel> topUpWallet(double amount) async {
    final orderRes = await _client.post(
      '/payments/wallet/topup/order',
      data: {'amount': amount, 'currency': 'INR'},
    );

    final orderData = orderRes.data as Map<String, dynamic>?;
    final orderId = orderData?['orderId'] as String? ?? 'order_sim_${DateTime.now().millisecondsSinceEpoch}';

    final verifyRes = await _client.post(
      '/payments/wallet/topup/verify',
      data: {
        'razorpayOrderId': orderId,
        'razorpayPaymentId': 'pay_sim_${DateTime.now().millisecondsSinceEpoch}',
        'razorpaySignature': 'sig_sim',
        'amount': amount,
      },
    );

    if (verifyRes.statusCode == 200 && verifyRes.data != null) {
      return WalletModel.fromJson(verifyRes.data as Map<String, dynamic>);
    }

    throw ApiException(
      message: 'Failed to complete wallet top-up verification',
      statusCode: verifyRes.statusCode,
    );
  }

  Future<bool> checkoutWithWallet(String orderId) async {
    final response = await _client.post(
      '/payments/checkout/wallet',
      data: {'orderId': orderId},
    );
    return response.statusCode == 200;
  }

  Future<ProviderEarningsModel> getProviderEarnings() async {
    final response = await _client.get('/payments/provider/earnings');
    if (response.statusCode == 200 && response.data != null) {
      return ProviderEarningsModel.fromJson(response.data as Map<String, dynamic>);
    }
    throw ApiException(
      message: 'Failed to retrieve host earnings summary',
      statusCode: response.statusCode,
    );
  }

  Future<bool> requestPayout({
    required double amount,
    required String payoutType,
    required String destination,
  }) async {
    final response = await _client.post(
      '/payments/payout/request',
      data: {
        'amount': amount,
        'payoutType': payoutType,
        'destination': destination,
      },
    );
    return response.statusCode == 200;
  }
}

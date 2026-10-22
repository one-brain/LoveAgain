import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/payment_repository.dart';
import '../../models/wallet.dart';
import '../auth/auth_controller.dart';

final paymentRepositoryProvider = Provider<PaymentRepository>(
  (ref) => PaymentRepository(ref.read(apiClientProvider)),
);

class WalletState {
  const WalletState({
    required this.wallet,
    this.transactions = const [],
    required this.earnings,
    this.isLoading = false,
    this.isActionLoading = false,
    this.error,
    this.successMessage,
  });

  final WalletModel wallet;
  final List<WalletTransactionModel> transactions;
  final ProviderEarningsModel earnings;
  final bool isLoading;
  final bool isActionLoading;
  final String? error;
  final String? successMessage;

  WalletState copyWith({
    WalletModel? wallet,
    List<WalletTransactionModel>? transactions,
    ProviderEarningsModel? earnings,
    bool? isLoading,
    bool? isActionLoading,
    String? error,
    String? successMessage,
  }) {
    return WalletState(
      wallet: wallet ?? this.wallet,
      transactions: transactions ?? this.transactions,
      earnings: earnings ?? this.earnings,
      isLoading: isLoading ?? this.isLoading,
      isActionLoading: isActionLoading ?? this.isActionLoading,
      error: error,
      successMessage: successMessage,
    );
  }
}

final walletControllerProvider =
    StateNotifierProvider<WalletController, WalletState>(
  (ref) => WalletController(
    ref.read(paymentRepositoryProvider),
  ),
);

class WalletController extends StateNotifier<WalletState> {
  WalletController(this._repository)
      : super(
          WalletState(
            wallet: WalletModel.initial(),
            earnings: ProviderEarningsModel.initial(),
          ),
        ) {
    loadWalletData();
  }

  final PaymentRepository _repository;

  Future<void> loadWalletData() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final balance = await _repository.getWalletBalance();
      final txns = await _repository.getWalletTransactions();
      final earnings = await _repository.getProviderEarnings();

      state = state.copyWith(
        wallet: balance,
        transactions: txns,
        earnings: earnings,
        isLoading: false,
      );
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to retrieve wallet information.',
      );
    }
  }

  Future<bool> topUp(double amount) async {
    state = state.copyWith(isActionLoading: true, error: null, successMessage: null);
    try {
      final updated = await _repository.topUpWallet(amount);
      final newTxns = await _repository.getWalletTransactions();
      state = state.copyWith(
        wallet: updated,
        transactions: newTxns,
        isActionLoading: false,
        successMessage: '₹${amount.toStringAsFixed(0)} added to wallet via UPI!',
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isActionLoading: false,
        error: 'Top-up failed. Please check payment gateway.',
      );
      return false;
    }
  }

  Future<bool> payBookingWithWallet(String orderId) async {
    state = state.copyWith(isActionLoading: true, error: null);
    try {
      final success = await _repository.checkoutWithWallet(orderId);
      if (success) {
        await loadWalletData();
      }
      state = state.copyWith(isActionLoading: false);
      return success;
    } catch (_) {
      state = state.copyWith(isActionLoading: false, error: 'Checkout failed.');
      return false;
    }
  }

  Future<bool> requestPayout({
    required double amount,
    required String payoutType,
    required String destination,
  }) async {
    state = state.copyWith(isActionLoading: true, error: null, successMessage: null);
    try {
      final success = await _repository.requestPayout(
        amount: amount,
        payoutType: payoutType,
        destination: destination,
      );
      if (success) {
        await loadWalletData();
        state = state.copyWith(
          isActionLoading: false,
          successMessage: '₹${amount.toStringAsFixed(0)} withdrawal initiated to $destination!',
        );
      }
      return success;
    } catch (_) {
      state = state.copyWith(
        isActionLoading: false,
        error: 'Payout request failed.',
      );
      return false;
    }
  }
}


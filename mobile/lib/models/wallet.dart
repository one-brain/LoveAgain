class WalletModel {
  const WalletModel({
    required this.userId,
    required this.availableBalance,
    required this.pendingBalance,
    required this.currency,
  });

  final String userId;
  final double availableBalance;
  final double pendingBalance;
  final String currency;

  factory WalletModel.fromJson(Map<String, dynamic> json) {
    return WalletModel(
      userId: json['userId'] as String? ?? '',
      availableBalance: (json['availableBalance'] as num?)?.toDouble() ?? 0.0,
      pendingBalance: (json['pendingBalance'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] as String? ?? 'INR',
    );
  }

  factory WalletModel.initial() {
    return const WalletModel(
      userId: '',
      availableBalance: 0.0,
      pendingBalance: 0.0,
      currency: 'INR',
    );
  }
}

class WalletTransactionModel {
  const WalletTransactionModel({
    required this.id,
    required this.amount,
    required this.direction,
    required this.type,
    required this.balanceAfter,
    required this.description,
    required this.createdAt,
    this.referenceId,
  });

  final String id;
  final double amount;
  final String direction;
  final String type;
  final double balanceAfter;
  final String description;
  final DateTime createdAt;
  final String? referenceId;

  factory WalletTransactionModel.fromJson(Map<String, dynamic> json) {
    return WalletTransactionModel(
      id: json['id'] as String? ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      direction: json['direction'] as String? ?? 'Credit',
      type: json['type'] as String? ?? 'TopUp',
      balanceAfter: (json['balanceAfter'] as num?)?.toDouble() ?? 0.0,
      description: json['description'] as String? ?? '',
      referenceId: json['referenceId'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  bool get isCredit => direction.toLowerCase() == 'credit';
}

class ProviderEarningsModel {
  const ProviderEarningsModel({
    required this.grossRevenue,
    required this.platformCommission,
    required this.clearedBalance,
    required this.pendingBalance,
    required this.currency,
  });

  final double grossRevenue;
  final double platformCommission;
  final double clearedBalance;
  final double pendingBalance;
  final String currency;

  factory ProviderEarningsModel.fromJson(Map<String, dynamic> json) {
    return ProviderEarningsModel(
      grossRevenue: (json['grossRevenue'] as num?)?.toDouble() ?? 0.0,
      platformCommission: (json['platformCommission'] as num?)?.toDouble() ?? 0.0,
      clearedBalance: (json['clearedBalance'] as num?)?.toDouble() ?? 0.0,
      pendingBalance: (json['pendingBalance'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] as String? ?? 'INR',
    );
  }

  factory ProviderEarningsModel.initial() {
    return const ProviderEarningsModel(
      grossRevenue: 0.0,
      platformCommission: 0.0,
      clearedBalance: 0.0,
      pendingBalance: 0.0,
      currency: 'INR',
    );
  }
}


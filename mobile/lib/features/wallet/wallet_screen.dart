import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import 'wallet_controller.dart';

class WalletScreen extends ConsumerStatefulWidget {
  const WalletScreen({super.key});

  @override
  ConsumerState<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends ConsumerState<WalletScreen> {
  final TextEditingController _customAmountController = TextEditingController();
  final TextEditingController _payoutAmountController = TextEditingController();
  final TextEditingController _destinationController = TextEditingController();
  String _payoutType = 'Upi';

  @override
  void dispose() {
    _customAmountController.dispose();
    _payoutAmountController.dispose();
    _destinationController.dispose();
    super.dispose();
  }

  void _showTopUpDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(FluentRadius.xLarge),
        ),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: FluentSpacing.xl,
            right: FluentSpacing.xl,
            top: FluentSpacing.xl,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + FluentSpacing.xxxl,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Top-up Cue wallet',
                    style: FluentType.title3.copyWith(
                      color: AppColors.textPrimary,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: FluentSpacing.sNudge),
              Text(
                'Add funds instantly using UPI (Google Pay, PhonePe, Paytm, BHIM) or Net Banking.',
                style: FluentType.caption1.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: FluentSpacing.xl),
              TextField(
                controller: _customAmountController,
                keyboardType: TextInputType.number,
                autofocus: true,
                style: FluentType.numeric(FluentType.body1Strong).copyWith(
                  color: AppColors.textPrimary,
                ),
                decoration: InputDecoration(
                  prefixText: '₹ ',
                  prefixStyle: FluentType.numeric(FluentType.title3).copyWith(
                    color: AppColors.textPrimary,
                  ),
                  labelText: 'Amount (INR)',
                  hintText: 'Enter amount (e.g. 2000)',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(FluentRadius.large),
                  ),
                ),
              ),
              const SizedBox(height: FluentSpacing.l),
              Wrap(
                spacing: FluentSpacing.s,
                children: [500, 1000, 2000, 5000].map((amt) {
                  return ActionChip(
                    label: Text(
                      '₹$amt',
                      style: FluentType.numeric(FluentType.caption1Strong)
                          .copyWith(color: AppColors.textPrimary),
                    ),
                    onPressed: () {
                      _customAmountController.text = amt.toString();
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: FluentSpacing.xxl),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: FilledButton.icon(
                  icon: const Icon(Icons.flash_on, color: Colors.white),
                  label: Text(
                    'Add funds with UPI',
                    style: FluentType.body2Strong.copyWith(color: Colors.white),
                  ),
                  onPressed: () async {
                    final amt = double.tryParse(_customAmountController.text);
                    if (amt != null && amt >= 100) {
                      Navigator.pop(ctx);
                      final success = await ref
                          .read(walletControllerProvider.notifier)
                          .topUp(amt);
                      if (context.mounted && success) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            backgroundColor: AppColors.success,
                            content: Text(
                              '₹${amt.toStringAsFixed(0)} credited to Cue Wallet!',
                            ),
                          ),
                        );
                      }
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Minimum top-up is ₹100.'),
                        ),
                      );
                    }
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showWithdrawDialog(BuildContext context, double clearedBalance) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(FluentRadius.xLarge),
        ),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: FluentSpacing.xl,
                right: FluentSpacing.xl,
                top: FluentSpacing.xl,
                bottom:
                    MediaQuery.of(ctx).viewInsets.bottom + FluentSpacing.xxxl,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Instant host withdrawal',
                        style: FluentType.title3.copyWith(
                          color: AppColors.textPrimary,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const SizedBox(height: FluentSpacing.xs),
                  Text(
                    'Available for instant payout: ₹${clearedBalance.toStringAsFixed(0)}',
                    style: FluentType.numeric(FluentType.caption1Strong)
                        .copyWith(color: AppColors.successForeground),
                  ),
                  const SizedBox(height: FluentSpacing.xl),
                  Row(
                    children: [
                      Expanded(
                        child: ChoiceChip(
                          label: const Text('UPI (Google Pay / PhonePe)'),
                          selected: _payoutType == 'Upi',
                          selectedColor: AppColors.primaryLight,
                          onSelected: (val) =>
                              setModalState(() => _payoutType = 'Upi'),
                        ),
                      ),
                      const SizedBox(width: FluentSpacing.s),
                      Expanded(
                        child: ChoiceChip(
                          label: const Text('Bank Transfer (NEFT/IMPS)'),
                          selected: _payoutType == 'Bank',
                          selectedColor: AppColors.primaryLight,
                          onSelected: (val) =>
                              setModalState(() => _payoutType = 'Bank'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: FluentSpacing.l),
                  TextField(
                    controller: _payoutAmountController,
                    keyboardType: TextInputType.number,
                    style: FluentType.numeric(FluentType.body1Strong).copyWith(
                      color: AppColors.textPrimary,
                    ),
                    decoration: InputDecoration(
                      prefixText: '₹ ',
                      prefixStyle: FluentType.numeric(FluentType.title3)
                          .copyWith(color: AppColors.textPrimary),
                      labelText: 'Withdrawal Amount',
                      hintText: 'Min ₹100',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(FluentRadius.large),
                      ),
                    ),
                  ),
                  const SizedBox(height: FluentSpacing.m),
                  TextField(
                    controller: _destinationController,
                    decoration: InputDecoration(
                      labelText: _payoutType == 'Upi'
                          ? 'UPI ID / VPA (e.g. name@okhdfcbank)'
                          : 'Bank Account Number + IFSC',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(FluentRadius.large),
                      ),
                    ),
                  ),
                  const SizedBox(height: FluentSpacing.xxl),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: FilledButton(
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.success,
                      ),
                      onPressed: () async {
                        final amt =
                            double.tryParse(_payoutAmountController.text);
                        final dest = _destinationController.text.trim();
                        if (amt != null && amt >= 100 && dest.isNotEmpty) {
                          Navigator.pop(ctx);
                          final ok = await ref
                              .read(walletControllerProvider.notifier)
                              .requestPayout(
                                amount: amt,
                                payoutType: _payoutType,
                                destination: dest,
                              );
                          if (context.mounted && ok) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                backgroundColor: AppColors.success,
                                content: Text(
                                  'Withdrawal of ₹${amt.toStringAsFixed(0)} initiated to $dest!',
                                ),
                              ),
                            );
                          }
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Please enter a valid amount and payout destination.',
                              ),
                            ),
                          );
                        }
                      },
                      child: Text(
                        'Confirm instant withdrawal',
                        style: FluentType.body2Strong.copyWith(
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(walletControllerProvider);
    final wallet = state.wallet;
    final earnings = state.earnings;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cue Wallet & Escrow'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh Ledger',
            onPressed: () => ref
                .read(walletControllerProvider.notifier)
                .loadWalletData(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () =>
            ref.read(walletControllerProvider.notifier).loadWalletData(),
        child: ListView(
          padding: const EdgeInsets.all(FluentSpacing.l),
          children: [
            // Available Balance Card (Fluent 2 neutral card, no gradient)
            Container(
              padding: const EdgeInsets.all(FluentSpacing.xl),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'AVAILABLE BALANCE',
                        style: FluentType.caption2.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.textMuted,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: FluentSpacing.s,
                          vertical: FluentSpacing.xxs,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.goldLight,
                          borderRadius: BorderRadius.circular(
                            FluentRadius.medium,
                          ),
                          border: Border.all(color: AppColors.goldBorder),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.verified_user_rounded,
                              size: 13,
                              color: AppColors.gold,
                            ),
                            const SizedBox(width: FluentSpacing.xs),
                            Text(
                              '100% Escrow Secured',
                              style: FluentType.caption2.copyWith(
                                color: AppColors.gold,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: FluentSpacing.m),
                  Text(
                    '₹${wallet.availableBalance.toStringAsFixed(0)}',
                    style: FluentType.numeric(FluentType.largeTitle).copyWith(
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: FluentSpacing.l),
                  const Divider(height: 1, color: AppColors.border),
                  const SizedBox(height: FluentSpacing.m),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Locked in active escrow',
                            style: FluentType.caption2.copyWith(
                              color: AppColors.textMuted,
                            ),
                          ),
                          const SizedBox(height: FluentSpacing.xxs),
                          Text(
                            '₹${wallet.pendingBalance.toStringAsFixed(0)}',
                            style: FluentType.numeric(FluentType.body2Strong)
                                .copyWith(color: AppColors.gold),
                          ),
                        ],
                      ),
                      FilledButton.icon(
                        onPressed: () => _showTopUpDialog(context),
                        icon: const Icon(Icons.add, size: 18),
                        label: const Text('Add Money'),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: FluentSpacing.l),

            // Host Earnings & Withdrawal Banner
            Container(
              padding: const EdgeInsets.all(FluentSpacing.l),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Host Earnings & Payouts',
                        style: FluentType.body2Strong.copyWith(
                          color: AppColors.textPrimary,
                        ),
                      ),
                      TextButton.icon(
                        icon: const Icon(Icons.arrow_outward, size: 16),
                        onPressed: () => _showWithdrawDialog(
                          context,
                          earnings.clearedBalance,
                        ),
                        label: const Text('Withdraw UPI'),
                      ),
                    ],
                  ),
                  const SizedBox(height: FluentSpacing.s),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Cleared balance',
                              style: FluentType.caption2.copyWith(
                                color: AppColors.textMuted,
                              ),
                            ),
                            const SizedBox(height: FluentSpacing.xxs),
                            Text(
                              '₹${earnings.clearedBalance.toStringAsFixed(0)}',
                              style: FluentType.numeric(FluentType.body1Strong)
                                  .copyWith(color: AppColors.successForeground),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Platform fee (10%)',
                              style: FluentType.caption2.copyWith(
                                color: AppColors.textMuted,
                              ),
                            ),
                            const SizedBox(height: FluentSpacing.xxs),
                            Text(
                              '₹${earnings.platformCommission.toStringAsFixed(0)}',
                              style: FluentType.numeric(FluentType.body1Strong)
                                  .copyWith(color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'In-flight escrow',
                              style: FluentType.caption2.copyWith(
                                color: AppColors.textMuted,
                              ),
                            ),
                            const SizedBox(height: FluentSpacing.xxs),
                            Text(
                              '₹${earnings.pendingBalance.toStringAsFixed(0)}',
                              style: FluentType.numeric(FluentType.body1Strong)
                                  .copyWith(color: AppColors.gold),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: FluentSpacing.xxl),

            // Recent Transactions Title
            Text(
              'Ledger & Transactions',
              style: FluentType.body1Strong.copyWith(
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: FluentSpacing.m),

            if (state.transactions.isEmpty)
              Container(
                padding: const EdgeInsets.all(FluentSpacing.xxxl),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                  border: Border.all(color: AppColors.border),
                ),
                child: Text(
                  'No transactions yet.',
                  style: FluentType.caption1.copyWith(
                    color: AppColors.textMuted,
                  ),
                ),
              )
            else
              ...state.transactions.map((txn) {
                final isCredit = txn.isCredit;
                return Container(
                  margin: const EdgeInsets.only(bottom: FluentSpacing.mNudge),
                  padding: const EdgeInsets.all(FluentSpacing.m),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: isCredit
                            ? AppColors.successBackground
                            : AppColors.primaryLight,
                        child: Icon(
                          isCredit ? Icons.arrow_downward : Icons.arrow_upward,
                          size: 18,
                          color: isCredit
                              ? AppColors.successForeground
                              : AppColors.brandForeground,
                        ),
                      ),
                      const SizedBox(width: FluentSpacing.m),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              txn.description.isNotEmpty
                                  ? txn.description
                                  : txn.type,
                              style: FluentType.caption1Strong.copyWith(
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: FluentSpacing.xxs),
                            Text(
                              DateFormat('dd MMM yyyy, hh:mm a')
                                  .format(txn.createdAt),
                              style: FluentType.numeric(FluentType.caption2)
                                  .copyWith(color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '${isCredit ? '+' : '-'} ₹${txn.amount.toStringAsFixed(0)}',
                            style: FluentType.numeric(FluentType.body2Strong)
                                .copyWith(
                              color: isCredit
                                  ? AppColors.successForeground
                                  : AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: FluentSpacing.xxs),
                          Text(
                            'Bal: ₹${txn.balanceAfter.toStringAsFixed(0)}',
                            style: FluentType.numeric(FluentType.caption2)
                                .copyWith(color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }
}

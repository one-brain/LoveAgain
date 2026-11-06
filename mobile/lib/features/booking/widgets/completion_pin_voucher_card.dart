import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme.dart';

class CompletionPinVoucherCard extends StatelessWidget {
  const CompletionPinVoucherCard({
    required this.pin,
    required this.guestName,
    super.key,
  });

  final String pin;
  final String guestName;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: FluentSpacing.s),
      padding: const EdgeInsets.all(FluentSpacing.l),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(FluentRadius.xLarge),
        border: Border.all(color: AppColors.success.withValues(alpha: 0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(FluentSpacing.sNudge),
                    decoration: BoxDecoration(
                      color: AppColors.successBackground,
                      borderRadius: BorderRadius.circular(FluentRadius.medium),
                      border: Border.all(
                        color: AppColors.success.withValues(alpha: 0.25),
                      ),
                    ),
                    child: const Icon(
                      Icons.verified_outlined,
                      size: 18,
                      color: AppColors.successForeground,
                    ),
                  ),
                  const SizedBox(width: FluentSpacing.s),
                  Text(
                    'Completion & Escrow Release PIN',
                    style: FluentType.body2Strong.copyWith(
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: FluentSpacing.s,
                  vertical: FluentSpacing.xxs,
                ),
                decoration: BoxDecoration(
                  color: AppColors.successBackground,
                  borderRadius: BorderRadius.circular(FluentRadius.medium),
                  border: Border.all(
                    color: AppColors.success.withValues(alpha: 0.25),
                  ),
                ),
                child: Text(
                  'Share with Guest',
                  style: FluentType.caption2.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.successForeground,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: FluentSpacing.m),
          Text(
            'Share this 6-digit mutual code with your Guest at the conclusion of your outing to release escrow funds to your wallet.',
            style: FluentType.caption1.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: FluentSpacing.m),

          // 6-Digit Display
          Container(
            padding: const EdgeInsets.symmetric(
              vertical: FluentSpacing.m,
              horizontal: FluentSpacing.l,
            ),
            decoration: BoxDecoration(
              color: AppColors.surfaceMuted,
              borderRadius: BorderRadius.circular(FluentRadius.large),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  pin.isNotEmpty ? pin : '739 184',
                  style: FluentType.numeric(FluentType.title1).copyWith(
                    color: AppColors.successForeground,
                  ),
                ),
                IconButton(
                  tooltip: 'Copy PIN',
                  icon: const Icon(
                    Icons.copy_rounded,
                    size: 20,
                    color: AppColors.successForeground,
                  ),
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: pin));
                    HapticFeedback.lightImpact();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Completion PIN copied to clipboard'),
                        duration: Duration(seconds: 2),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}


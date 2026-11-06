import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme.dart';

class ArrivalPinVoucherCard extends StatelessWidget {
  const ArrivalPinVoucherCard({
    required this.pin,
    required this.hostName,
    super.key,
  });

  final String pin;
  final String hostName;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: FluentSpacing.s),
      padding: const EdgeInsets.all(FluentSpacing.l),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(FluentRadius.xLarge),
        border: Border.all(color: AppColors.goldBorder),
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
                      color: AppColors.goldLight,
                      borderRadius: BorderRadius.circular(FluentRadius.medium),
                      border: Border.all(color: AppColors.goldBorder),
                    ),
                    child: const Icon(
                      Icons.pin_rounded,
                      size: 18,
                      color: AppColors.gold,
                    ),
                  ),
                  const SizedBox(width: FluentSpacing.s),
                  Text(
                    'Arrival Verification PIN',
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
                  color: AppColors.goldLight,
                  borderRadius: BorderRadius.circular(FluentRadius.medium),
                  border: Border.all(color: AppColors.goldBorder),
                ),
                child: Text(
                  'Show to Host',
                  style: FluentType.caption2.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.gold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: FluentSpacing.m),
          Text(
            'Present this 6-digit mutual code to your Host when you physically meet to initiate the session.',
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
                  pin.isNotEmpty ? pin : '482 910',
                  style: FluentType.numeric(FluentType.title1).copyWith(
                    color: AppColors.brandForeground,
                  ),
                ),
                IconButton(
                  tooltip: 'Copy PIN',
                  icon: const Icon(
                    Icons.copy_rounded,
                    size: 20,
                    color: AppColors.brandForeground,
                  ),
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: pin));
                    HapticFeedback.lightImpact();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Arrival PIN copied to clipboard'),
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


import 'package:flutter/material.dart';
import '../../core/theme.dart';

class VerifiedBadge extends StatelessWidget {
  const VerifiedBadge({
    this.size = 16,
    this.showLabel = false,
    super.key,
  });

  final double size;
  final bool showLabel;

  @override
  Widget build(BuildContext context) {
    if (showLabel) {
      return Container(
        padding: const EdgeInsets.symmetric(
          horizontal: FluentSpacing.s,
          vertical: FluentSpacing.xxs,
        ),
        decoration: BoxDecoration(
          color: AppColors.goldLight,
          borderRadius: BorderRadius.circular(FluentRadius.medium),
          border: Border.all(color: AppColors.goldBorder),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.verified_user_rounded, size: size, color: AppColors.gold),
            const SizedBox(width: FluentSpacing.xs),
            Text(
              'Verified host',
              style: FluentType.caption2.copyWith(
                fontWeight: FontWeight.w600,
                color: AppColors.gold,
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: FluentSpacing.xs,
        vertical: FluentSpacing.xxs,
      ),
      decoration: BoxDecoration(
        color: AppColors.goldLight,
        borderRadius: BorderRadius.circular(FluentRadius.medium),
        border: Border.all(color: AppColors.goldBorder),
      ),
      child: Icon(
        Icons.verified_user_rounded,
        size: size - 2,
        color: AppColors.gold,
      ),
    );
  }
}

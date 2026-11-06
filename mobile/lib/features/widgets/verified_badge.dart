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
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: AppColors.goldLight,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.verified_rounded, size: size, color: AppColors.goldDark),
            const SizedBox(width: 4),
            const Text(
              'Verified Host',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: AppColors.goldDark,
                letterSpacing: 0.1,
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.gold,
        shape: BoxShape.circle,
      ),
      padding: const EdgeInsets.all(2),
      child: Icon(
        Icons.check,
        size: size - 4,
        color: Colors.white,
      ),
    );
  }
}

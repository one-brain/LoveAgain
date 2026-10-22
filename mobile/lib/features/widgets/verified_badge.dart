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
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(
          color: AppColors.sageLight,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check_circle_rounded, size: size, color: AppColors.sageDark),
            const SizedBox(width: 4),
            const Text(
              'Verified Identity',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.sageDark,
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.sage,
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


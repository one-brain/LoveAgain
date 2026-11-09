import 'package:flutter/material.dart';
import '../../core/theme.dart';

class RatingStars extends StatelessWidget {
  const RatingStars({
    required this.rating,
    this.reviewCount,
    this.size = 14,
    super.key,
  });

  final double rating;
  final int? reviewCount;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.star_rounded, size: size, color: AppColors.gold),
        const SizedBox(width: FluentSpacing.xs),
        Text(
          rating.toStringAsFixed(1),
          style: FluentType.numeric(FluentType.caption1Strong).copyWith(
            color: AppColors.textPrimary,
          ),
        ),
        if (reviewCount != null) ...[
          const SizedBox(width: FluentSpacing.xxs),
          Text(
            '($reviewCount)',
            style: FluentType.numeric(FluentType.caption2).copyWith(
              color: AppColors.textMuted,
            ),
          ),
        ],
      ],
    );
  }
}


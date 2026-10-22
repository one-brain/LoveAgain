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
        Icon(Icons.star_rounded, size: size, color: const Color(0xFFF59E0B)),
        const SizedBox(width: 3),
        Text(
          rating.toStringAsFixed(1),
          style: TextStyle(
            fontSize: size - 1,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        if (reviewCount != null) ...[
          const SizedBox(width: 3),
          Text(
            '($reviewCount)',
            style: TextStyle(
              fontSize: size - 2,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ],
    );
  }
}


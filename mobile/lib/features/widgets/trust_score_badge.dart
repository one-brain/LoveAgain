import 'package:flutter/material.dart';
import '../../core/theme.dart';

class TrustScoreBadge extends StatelessWidget {
  const TrustScoreBadge({
    required this.score,
    this.compact = false,
    super.key,
  });

  final int score;
  final bool compact;

  Color get _color {
    if (score >= 90) return AppColors.trustHigh;
    if (score >= 75) return AppColors.trustMedium;
    return AppColors.trustLow;
  }

  Color get _bg {
    if (score >= 90) return const Color(0xFFECFDF5);
    if (score >= 75) return const Color(0xFFFFFBEB);
    return const Color(0xFFFEF2F2);
  }

  @override
  Widget build(BuildContext context) {
    if (compact) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(
          color: _bg,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: _color.withValues(alpha: 0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.shield_outlined, size: 12, color: _color),
            const SizedBox(width: 3),
            Text(
              '$score',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: _color,
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: _bg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _color.withValues(alpha: 0.25)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.verified_user_rounded, size: 15, color: _color),
          const SizedBox(width: 5),
          Text(
            'Trust Score $score%',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: _color,
            ),
          ),
        ],
      ),
    );
  }
}


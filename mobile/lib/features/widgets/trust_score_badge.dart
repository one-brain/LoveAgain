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
    if (score >= 90) return AppColors.successBackground;
    if (score >= 75) return AppColors.warningBackground;
    return AppColors.dangerBackground;
  }

  @override
  Widget build(BuildContext context) {
    if (compact) {
      return Container(
        padding: const EdgeInsets.symmetric(
          horizontal: FluentSpacing.sNudge,
          vertical: FluentSpacing.xxs,
        ),
        decoration: BoxDecoration(
          color: _bg,
          borderRadius: BorderRadius.circular(FluentRadius.medium),
          border: Border.all(color: _color.withValues(alpha: 0.25)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.verified_user_outlined, size: 12, color: _color),
            const SizedBox(width: FluentSpacing.xs),
            Text(
              '$score',
              style: FluentType.numeric(FluentType.caption2).copyWith(
                fontWeight: FontWeight.w600,
                color: _color,
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: FluentSpacing.s,
        vertical: FluentSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: _bg,
        borderRadius: BorderRadius.circular(FluentRadius.medium),
        border: Border.all(color: _color.withValues(alpha: 0.25)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.verified_user_outlined, size: 14, color: _color),
          const SizedBox(width: FluentSpacing.xs),
          Text(
            'Trust score $score%',
            style: FluentType.numeric(FluentType.caption2).copyWith(
              fontWeight: FontWeight.w600,
              color: _color,
            ),
          ),
        ],
      ),
    );
  }
}


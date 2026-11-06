import 'package:flutter/material.dart';
import '../theme.dart';

/// Canonical Cue Brand Lockup for Flutter (Fluent 2)
/// Renders the Cue Bordeaux emblem with open "C" arc + Warm Trust Gold spark,
/// paired with the "Cue." wordmark and optional descriptor subtitle.
class CueBrandLogo extends StatelessWidget {
  final double markSize;
  final String? subtitle;

  const CueBrandLogo({
    super.key,
    this.markSize = 30,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: markSize,
          height: markSize,
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(FluentRadius.large),
            boxShadow: FluentShadows.shadow2,
          ),
          child: CustomPaint(
            painter: _CueMonogramPainter(),
          ),
        ),
        const SizedBox(width: FluentSpacing.s),
        Text(
          'Cue',
          style: FluentType.title3.copyWith(
            color: AppColors.textPrimary,
            letterSpacing: -0.3,
          ),
        ),
        const SizedBox(width: 2),
        Container(
          width: 4,
          height: 4,
          margin: const EdgeInsets.only(top: 8),
          decoration: const BoxDecoration(
            color: AppColors.gold,
            shape: BoxShape.circle,
          ),
        ),
        if (subtitle != null && subtitle!.isNotEmpty) ...[
          const SizedBox(width: FluentSpacing.s),
          Container(
            width: 1,
            height: 14,
            color: AppColors.border,
          ),
          const SizedBox(width: FluentSpacing.s),
          Flexible(
            child: Text(
              subtitle!,
              overflow: TextOverflow.ellipsis,
              style: FluentType.caption1Strong.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ],
    );
  }
}

class _CueMonogramPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 36.0;

    // Subtle inner frame
    final framePaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.18)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5 * s;
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(0.75 * s, 0.75 * s, 34.5 * s, 34.5 * s),
        Radius.circular(7.25 * s),
      ),
      framePaint,
    );

    // Open "C" dialogue arc
    final arcPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.2 * s
      ..strokeCap = StrokeCap.round;
    final arcRect = Rect.fromCenter(
      center: Offset(17.0 * s, 18.0 * s),
      width: 17.5 * s,
      height: 17.0 * s,
    );
    canvas.drawArc(arcRect, 0.75, 4.75, false, arcPaint);

    // Center nexus dot
    final dotPaint = Paint()
      ..color = const Color(0xFFFDE68A)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(17.5 * s, 18.0 * s), 2.1 * s, dotPaint);

    // 4-point Trust Gold verification spark at upper right
    final sparkPath = Path()
      ..moveTo(25.5 * s, 9.5 * s)
      ..lineTo(26.65 * s, 12.35 * s)
      ..lineTo(29.5 * s, 13.5 * s)
      ..lineTo(26.65 * s, 14.65 * s)
      ..lineTo(25.5 * s, 17.5 * s)
      ..lineTo(24.35 * s, 14.65 * s)
      ..lineTo(21.5 * s, 13.5 * s)
      ..lineTo(24.35 * s, 12.35 * s)
      ..close();
    final sparkPaint = Paint()
      ..color = const Color(0xFFFBBF24)
      ..style = PaintingStyle.fill;
    canvas.drawPath(sparkPath, sparkPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

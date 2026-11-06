import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/booking.dart';

class BookingStatusChip extends StatelessWidget {
  const BookingStatusChip({required this.status, super.key});

  final BookingStatus status;

  Color get _bg {
    switch (status) {
      case BookingStatus.pendingPayment:
        return const Color(0xFFFEF3C7);
      case BookingStatus.confirmed:
        return AppColors.primaryLight;
      case BookingStatus.inProgress:
        return AppColors.goldLight;
      case BookingStatus.completed:
        return const Color(0xFFD1FAE5);
      case BookingStatus.cancelled:
        return const Color(0xFFFEE2E2);
      case BookingStatus.disputed:
        return const Color(0xFFFFEDD5);
    }
  }

  Color get _fg {
    switch (status) {
      case BookingStatus.pendingPayment:
        return AppColors.statusPending;
      case BookingStatus.confirmed:
        return AppColors.primary;
      case BookingStatus.inProgress:
        return AppColors.goldDark;
      case BookingStatus.completed:
        return AppColors.statusCompleted;
      case BookingStatus.cancelled:
        return AppColors.statusCancelled;
      case BookingStatus.disputed:
        return AppColors.statusDisputed;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: _bg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _fg.withValues(alpha: 0.2)),
      ),
      child: Text(
        status.label,
        style: TextStyle(
          color: _fg,
          fontSize: 12,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.1,
        ),
      ),
    );
  }
}

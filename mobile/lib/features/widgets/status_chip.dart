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
        return const Color(0xFFDBEAFE);
      case BookingStatus.inProgress:
        return const Color(0xFFEDE9FE);
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
        return AppColors.statusConfirmed;
      case BookingStatus.inProgress:
        return AppColors.statusInProgress;
      case BookingStatus.completed:
        return AppColors.statusCompleted;
      case BookingStatus.cancelled:
        return AppColors.statusCancelled;
      case BookingStatus.disputed:
        return const Color(0xFFC2410C);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: _bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.label,
        style: TextStyle(
          color: _fg,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}


import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/booking.dart';

class BookingStatusChip extends StatelessWidget {
  const BookingStatusChip({required this.status, super.key});

  final BookingStatus status;

  Color get _bg {
    switch (status) {
      case BookingStatus.pendingPayment:
        return AppColors.warningBackground;
      case BookingStatus.confirmed:
        return AppColors.primaryLight;
      case BookingStatus.inProgress:
        return AppColors.goldLight;
      case BookingStatus.completed:
        return AppColors.successBackground;
      case BookingStatus.cancelled:
        return AppColors.dangerBackground;
      case BookingStatus.disputed:
        return AppColors.dangerBackground;
    }
  }

  Color get _fg {
    switch (status) {
      case BookingStatus.pendingPayment:
        return AppColors.statusPending;
      case BookingStatus.confirmed:
        return AppColors.statusConfirmed;
      case BookingStatus.inProgress:
        return AppColors.gold;
      case BookingStatus.completed:
        return AppColors.statusCompleted;
      case BookingStatus.cancelled:
        return AppColors.statusCancelled;
      case BookingStatus.disputed:
        return AppColors.statusDisputed;
    }
  }

  Color get _border {
    switch (status) {
      case BookingStatus.inProgress:
        return AppColors.goldBorder;
      default:
        return _fg.withValues(alpha: 0.25);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: FluentSpacing.s,
        vertical: FluentSpacing.xxs,
      ),
      decoration: BoxDecoration(
        color: _bg,
        borderRadius: BorderRadius.circular(FluentRadius.medium),
        border: Border.all(color: _border),
      ),
      child: Text(
        status.label,
        style: FluentType.caption2.copyWith(
          color: _fg,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

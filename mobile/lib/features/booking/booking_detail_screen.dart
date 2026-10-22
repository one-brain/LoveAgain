import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../models/booking.dart';
import '../widgets/status_chip.dart';
import '../wallet/wallet_controller.dart';
import 'booking_controller.dart';

class BookingDetailScreen extends ConsumerWidget {
  const BookingDetailScreen({required this.booking, super.key});

  final Booking booking;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Watch current booking from controller state if available
    final bookingsState = ref.watch(bookingControllerProvider);
    final currentBooking = bookingsState.bookings.firstWhere(
      (b) => b.orderId == booking.orderId,
      orElse: () => booking,
    );
    final controller = ref.read(bookingControllerProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Booking Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline),
            onPressed: () {
              context.push('/chat/${currentBooking.orderId}',
                  extra: currentBooking);
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 100),
        children: [
          // Order Header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Order #${currentBooking.orderId}',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    BookingStatusChip(status: currentBooking.status),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    CircleAvatar(
                      radius: 26,
                      backgroundColor: AppColors.primaryLight,
                      child: Text(
                        currentBooking.providerInitials.isNotEmpty
                            ? currentBooking.providerInitials
                            : 'CP',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primaryDark,
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            currentBooking.providerName,
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'Companion',
                            style: TextStyle(
                              fontSize: 13,
                              color: AppColors.sage,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 8),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      onPressed: () {
                        context.push('/chat/${currentBooking.orderId}',
                            extra: currentBooking);
                      },
                      child: const Text('Message'),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Lifecycle Stepper Timeline
          const Text(
            'Booking Lifecycle',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 10),
          _buildTimelineCard(currentBooking),
          const SizedBox(height: 20),

          // Meeting Details
          const Text(
            'Meeting Details',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                _buildDetailRow(
                  Icons.calendar_today_outlined,
                  'Date & Time',
                  DateFormat('EEEE, MMMM d, yyyy • h:mm a')
                      .format(currentBooking.startTime),
                ),
                const Divider(height: 20, color: AppColors.border),
                _buildDetailRow(
                  Icons.timer_outlined,
                  'Duration',
                  '${currentBooking.durationHours.toStringAsFixed(1)} hours (Until ${DateFormat('h:mm a').format(currentBooking.endTime)})',
                ),
                const Divider(height: 20, color: AppColors.border),
                _buildDetailRow(
                  Icons.pin_drop_outlined,
                  'Meeting Location',
                  currentBooking.meetingAddress,
                ),
                if (currentBooking.specialRequests != null &&
                    currentBooking.specialRequests!.isNotEmpty) ...[
                  const Divider(height: 20, color: AppColors.border),
                  _buildDetailRow(
                    Icons.note_alt_outlined,
                    'Special Requests',
                    currentBooking.specialRequests!,
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Payment Summary (Invariant In Action)
          const Text(
            'Payment & Invariants',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Provider Rate (\$${currentBooking.hourlyRate.toStringAsFixed(0)} x ${currentBooking.durationHours.toStringAsFixed(1)} hrs)',
                      style: const TextStyle(
                          fontSize: 13, color: AppColors.textSecondary),
                    ),
                    Text(
                      '\$${currentBooking.providerEarnings.toStringAsFixed(2)}',
                      style: const TextStyle(
                          fontSize: 14, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Platform Safety & Verification Fee (10%)',
                      style: TextStyle(
                          fontSize: 13, color: AppColors.textSecondary),
                    ),
                    Text(
                      '\$${currentBooking.platformFee.toStringAsFixed(2)}',
                      style: const TextStyle(
                          fontSize: 14, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 12),
                  child: Divider(height: 1, color: AppColors.border),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Total Bounded Amount',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      '\$${currentBooking.totalAmount.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, -3),
            ),
          ],
          border: const Border(top: BorderSide(color: AppColors.border)),
        ),
        child: SafeArea(
          child: Row(
            children: [
              if (currentBooking.status != BookingStatus.completed &&
                  currentBooking.status != BookingStatus.cancelled) ...[
                OutlinedButton(
                  onPressed: () {
                    controller.cancelBooking(
                        currentBooking.orderId, 'User requested cancellation');
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Booking has been cancelled')),
                    );
                  },
                  child: const Text('Cancel Booking'),
                ),
                const SizedBox(width: 12),
              ],
              Expanded(
                child: _buildBottomActionButton(
                    context, ref, currentBooking, controller),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String title, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: AppColors.primary),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 11,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTimelineCard(Booking b) {
    final steps = [
      {'title': 'Requested', 'done': true},
      {
        'title': 'Confirmed',
        'done': b.status != BookingStatus.pendingPayment &&
            b.status != BookingStatus.cancelled
      },
      {
        'title': 'In Progress',
        'done': b.status == BookingStatus.inProgress ||
            b.status == BookingStatus.completed
      },
      {'title': 'Completed', 'done': b.status == BookingStatus.completed},
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: List.generate(steps.length, (index) {
          final s = steps[index];
          final isDone = s['done'] as bool;
          final isCancelled = b.status == BookingStatus.cancelled;

          return Expanded(
            child: Column(
              children: [
                CircleAvatar(
                  radius: 14,
                  backgroundColor: isCancelled
                      ? (index == 0
                          ? AppColors.primaryLight
                          : AppColors.surfaceMuted)
                      : (isDone ? AppColors.sage : AppColors.surfaceMuted),
                  child: Icon(
                    isDone ? Icons.check : Icons.circle,
                    size: 14,
                    color: isDone ? Colors.white : AppColors.textMuted,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  s['title'] as String,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: isDone ? FontWeight.w700 : FontWeight.w500,
                    color: isDone ? AppColors.textPrimary : AppColors.textMuted,
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _buildBottomActionButton(
      BuildContext context, WidgetRef ref, Booking b, BookingController controller) {
    switch (b.status) {
      case BookingStatus.pendingPayment:
        return FilledButton.icon(
          icon: const Icon(Icons.shield_outlined),
          onPressed: () async {
            final ok = await ref
                .read(walletControllerProvider.notifier)
                .payBookingWithWallet(b.orderId);
            if (ok) {
              await controller.payBooking(b.orderId);
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    backgroundColor: AppColors.sage,
                    content: Text('Payment secured in Escrow! Session confirmed.'),
                  ),
                );
              }
            }
          },
          label: Text('Pay ₹${b.totalAmount.toStringAsFixed(0)} & Escrow'),
        );
      case BookingStatus.confirmed:
        return FilledButton(
          style: FilledButton.styleFrom(backgroundColor: AppColors.sage),
          onPressed: () => controller.startBooking(b.orderId),
          child: const Text('Start Live Session'),
        );
      case BookingStatus.inProgress:
        return FilledButton(
          style: FilledButton.styleFrom(
              backgroundColor: AppColors.statusCompleted),
          onPressed: () => controller.completeBooking(b.orderId),
          child: const Text('Complete Session'),
        );
      case BookingStatus.completed:
        return FilledButton(
          onPressed: () {
            context.push('/chat/${b.orderId}', extra: b);
          },
          child: const Text('Open Message History'),
        );
      case BookingStatus.cancelled:
        return FilledButton(
          onPressed: () => context.go('/'),
          child: const Text('Book Another Companion'),
        );
      case BookingStatus.disputed:
        return FilledButton(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Support ticket created')),
            );
          },
          child: const Text('Contact Support'),
        );
    }
  }
}


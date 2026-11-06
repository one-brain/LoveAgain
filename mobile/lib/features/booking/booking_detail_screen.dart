import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../models/booking.dart';
import '../auth/auth_controller.dart';
import '../widgets/status_chip.dart';
import '../wallet/wallet_controller.dart';
import 'booking_controller.dart';
import 'widgets/arrival_pin_voucher_card.dart';
import 'widgets/completion_pin_voucher_card.dart';
import 'widgets/pin_verification_modal.dart';

class BookingDetailScreen extends ConsumerWidget {
  const BookingDetailScreen({required this.booking, super.key});

  final Booking booking;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingsState = ref.watch(bookingControllerProvider);
    final currentBooking = bookingsState.bookings.firstWhere(
      (b) => b.orderId == booking.orderId,
      orElse: () => booking,
    );
    final controller = ref.read(bookingControllerProvider.notifier);
    final auth = ref.watch(authControllerProvider);

    // Determine perspective: Host or Guest
    final isHost = auth.isHostMode || (auth.user?.id == currentBooking.hostId);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Outing Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline),
            tooltip: 'Chat',
            onPressed: () {
              context.push('/chat/${currentBooking.orderId}',
                  extra: currentBooking);
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 120),
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
                      'Outing #${currentBooking.orderId.substring(currentBooking.orderId.length > 8 ? currentBooking.orderId.length - 7 : 0)}',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textSecondary,
                        fontFamily: 'monospace',
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
                        currentBooking.hostInitials.isNotEmpty
                            ? currentBooking.hostInitials
                            : 'HT',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            currentBooking.hostName,
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Booked by ${currentBooking.guestName}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // In-Progress Live Outing Banner
          if (currentBooking.status == BookingStatus.inProgress) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.goldLight,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.gold),
              ),
              child: const Row(
                children: [
                  Icon(Icons.radio_button_checked,
                      size: 18, color: AppColors.goldDark),
                  SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Outing Session Active',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: AppColors.goldDark,
                          ),
                        ),
                        Text(
                          'Arrival PIN verified in person. Escrow funds secured.',
                          style: TextStyle(
                            fontSize: 11,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // VOUCHER 1: Arrival PIN Voucher (Shown to Guest on Confirmed)
          if (currentBooking.status == BookingStatus.confirmed && !isHost) ...[
            ArrivalPinVoucherCard(
              pin: currentBooking.arrivalPin ?? '482910',
              hostName: currentBooking.hostName,
            ),
            const SizedBox(height: 16),
          ],

          // VOUCHER 2: Completion PIN Voucher (Shown to Host on InProgress)
          if (currentBooking.status == BookingStatus.inProgress && isHost) ...[
            CompletionPinVoucherCard(
              pin: currentBooking.completionPin ?? '739184',
              guestName: currentBooking.guestName,
            ),
            const SizedBox(height: 16),
          ],

          // Outing Lifecycle Stepper
          const Text(
            'Outing Lifecycle',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 10),
          _buildLifecycleStepper(currentBooking),
          const SizedBox(height: 20),

          // Outing Details (Date, Duration, Meeting Location)
          const Text(
            'Schedule & Location',
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

          // Escrow Payment & Ledger (Invariant Enforced)
          const Text(
            'Escrow Payment & Ledger',
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
                      'Host Rate (₹${currentBooking.hourlyRate.toStringAsFixed(0)} x ${currentBooking.durationHours.toStringAsFixed(1)} hrs)',
                      style: const TextStyle(
                          fontSize: 13, color: AppColors.textSecondary),
                    ),
                    Text(
                      '₹${currentBooking.providerEarnings.toStringAsFixed(0)}',
                      style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          fontFamily: 'monospace'),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Platform Safety & Escrow Fee (10%)',
                      style: TextStyle(
                          fontSize: 13, color: AppColors.textSecondary),
                    ),
                    Text(
                      '₹${currentBooking.platformFee.toStringAsFixed(0)}',
                      style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          fontFamily: 'monospace'),
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
                      'Total Escrow Hold',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      '₹${currentBooking.totalAmount.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primary,
                        fontFamily: 'monospace',
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
                      const SnackBar(content: Text('Outing has been cancelled')),
                    );
                  },
                  child: const Text('Cancel Outing'),
                ),
                const SizedBox(width: 12),
              ],
              Expanded(
                child: _buildBottomActionButton(
                  context,
                  ref,
                  currentBooking,
                  controller,
                  isHost,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: AppColors.textSecondary),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
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

  Widget _buildLifecycleStepper(Booking b) {
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
                      : (isDone ? const Color(0xFF047857) : AppColors.surfaceMuted),
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
    BuildContext context,
    WidgetRef ref,
    Booking b,
    BookingController controller,
    bool isHost,
  ) {
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
                    backgroundColor: Color(0xFF047857),
                    content: Text('Payment secured in Escrow! Outing confirmed.'),
                  ),
                );
              }
            }
          },
          label: Text('Pay ₹${b.totalAmount.toStringAsFixed(0)} & Escrow'),
        );

      case BookingStatus.confirmed:
        if (isHost) {
          // Host enters Guest's 6-digit Arrival PIN
          return FilledButton.icon(
            icon: const Icon(Icons.pin_rounded),
            style: FilledButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () {
              PinVerificationModal.show(
                context,
                title: 'Verify Arrival PIN',
                subtitle:
                    'Ask ${b.guestName} for the 6-digit Arrival PIN shown on their screen to begin the session.',
                primaryColor: AppColors.primary,
                onVerify: (pin) async {
                  return await controller.checkInWithPin(b.orderId, pin);
                },
              );
            },
            label: const Text('Verify Arrival PIN'),
          );
        } else {
          // Guest shows PIN to Host
          return OutlinedButton.icon(
            icon: const Icon(Icons.shield_outlined, color: AppColors.gold),
            onPressed: () {
              // Open modal in demo perspective switch
              PinVerificationModal.show(
                context,
                title: 'Verify Arrival PIN (Demo Host)',
                subtitle:
                    'Testing as Host: Enter the 6-digit code (${b.arrivalPin ?? "482910"}) displayed on this voucher.',
                primaryColor: AppColors.primary,
                onVerify: (pin) async {
                  return await controller.checkInWithPin(b.orderId, pin);
                },
              );
            },
            label: const Text('Present Arrival PIN to Host'),
          );
        }

      case BookingStatus.inProgress:
        if (!isHost) {
          // Guest enters Host's 6-digit Completion PIN
          return FilledButton.icon(
            icon: const Icon(Icons.check_circle_outline),
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFF047857),
            ),
            onPressed: () {
              PinVerificationModal.show(
                context,
                title: 'Release Escrow & Conclude',
                subtitle:
                    'Ask ${b.hostName} for the 6-digit Completion PIN displayed on their screen.',
                primaryColor: const Color(0xFF047857),
                onVerify: (pin) async {
                  final ok = await controller.completeWithPin(b.orderId, pin);
                  if (ok && context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        backgroundColor: Color(0xFF047857),
                        content: Text('Escrow released! Outing completed successfully.'),
                      ),
                    );
                  }
                  return ok;
                },
              );
            },
            label: const Text('Verify Completion PIN'),
          );
        } else {
          // Host shows PIN to Guest
          return OutlinedButton.icon(
            icon: const Icon(Icons.verified_outlined, color: Color(0xFF047857)),
            onPressed: () {
              PinVerificationModal.show(
                context,
                title: 'Complete Outing (Demo Guest)',
                subtitle:
                    'Testing as Guest: Enter the 6-digit code (${b.completionPin ?? "739184"}) to release escrow.',
                primaryColor: const Color(0xFF047857),
                onVerify: (pin) async {
                  return await controller.completeWithPin(b.orderId, pin);
                },
              );
            },
            label: const Text('Share Completion PIN with Guest'),
          );
        }

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

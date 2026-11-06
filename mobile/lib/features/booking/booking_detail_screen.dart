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
import 'widgets/emergency_sos_bottom_sheet.dart';
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
            icon: const Icon(Icons.shield_outlined, color: AppColors.emergencyRed),
            tooltip: 'Safety SOS Hub',
            onPressed: () => EmergencySosBottomSheet.show(context, currentBooking),
          ),
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
        padding: const EdgeInsets.fromLTRB(
          FluentSpacing.l,
          FluentSpacing.m,
          FluentSpacing.l,
          120,
        ),
        children: [
          // In-Person Safety Shield Banner (Active Outings)
          if (currentBooking.status == BookingStatus.confirmed ||
              currentBooking.status == BookingStatus.inProgress) ...[
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: FluentSpacing.m,
                vertical: FluentSpacing.mNudge,
              ),
              decoration: BoxDecoration(
                color: AppColors.emergencyRedLight,
                borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                border: Border.all(
                  color: AppColors.emergencyRed.withValues(alpha: 0.25),
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.shield_outlined,
                    color: AppColors.emergencyRed,
                    size: 20,
                  ),
                  const SizedBox(width: FluentSpacing.mNudge),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'In-Person Safety Shield Active',
                          style: FluentType.caption1Strong.copyWith(
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          '24/7 National Emergency 112 & Trusted Contact Alert',
                          style: FluentType.caption2.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  TextButton(
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.emergencyRed,
                      visualDensity: VisualDensity.compact,
                      padding: const EdgeInsets.symmetric(
                        horizontal: FluentSpacing.s,
                      ),
                    ),
                    onPressed: () =>
                        EmergencySosBottomSheet.show(context, currentBooking),
                    child: Text(
                      'SOS HUB',
                      style: FluentType.caption2.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.emergencyRed,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: FluentSpacing.l),
          ],

          // Disputed Safety Review Notice
          if (currentBooking.status == BookingStatus.disputed) ...[
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: FluentSpacing.m,
                vertical: FluentSpacing.m,
              ),
              decoration: BoxDecoration(
                color: AppColors.dangerBackground,
                borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                border: Border.all(
                  color: AppColors.statusDisputed.withValues(alpha: 0.35),
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.warning_amber_rounded,
                    color: AppColors.statusDisputed,
                    size: 22,
                  ),
                  const SizedBox(width: FluentSpacing.mNudge),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Outing frozen under safety review',
                          style: FluentType.caption1Strong.copyWith(
                            color: AppColors.statusDisputed,
                          ),
                        ),
                        Text(
                          'Escrow payout is locked. A Cue Trust & Safety officer has been notified.',
                          style: FluentType.caption2.copyWith(
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: FluentSpacing.l),
          ],

          // Order Header
          Container(
            padding: const EdgeInsets.all(FluentSpacing.l),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(FluentRadius.xLarge),
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
                      style: FluentType.numeric(FluentType.caption1Strong)
                          .copyWith(color: AppColors.textSecondary),
                    ),
                    BookingStatusChip(status: currentBooking.status),
                  ],
                ),
                const SizedBox(height: FluentSpacing.m),
                Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: AppColors.primaryLight,
                      child: Text(
                        currentBooking.hostInitials.isNotEmpty
                            ? currentBooking.hostInitials
                            : 'HT',
                        style: FluentType.body1Strong.copyWith(
                          color: AppColors.brandForeground,
                        ),
                      ),
                    ),
                    const SizedBox(width: FluentSpacing.m),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            currentBooking.hostName,
                            style: FluentType.body1Strong.copyWith(
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: FluentSpacing.xxs),
                          Text(
                            'Booked by ${currentBooking.guestName}',
                            style: FluentType.caption2.copyWith(
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
          const SizedBox(height: FluentSpacing.l),

          // In-Progress Live Outing Banner
          if (currentBooking.status == BookingStatus.inProgress) ...[
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: FluentSpacing.l,
                vertical: FluentSpacing.m,
              ),
              decoration: BoxDecoration(
                color: AppColors.goldLight,
                borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                border: Border.all(color: AppColors.goldBorder),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.radio_button_checked,
                    size: 18,
                    color: AppColors.gold,
                  ),
                  const SizedBox(width: FluentSpacing.mNudge),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Outing session active',
                          style: FluentType.caption1Strong.copyWith(
                            color: AppColors.gold,
                          ),
                        ),
                        Text(
                          'Arrival PIN verified in person. Escrow funds secured.',
                          style: FluentType.caption2.copyWith(
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: FluentSpacing.l),
          ],

          // VOUCHER 1: Arrival PIN Voucher (Shown to Guest on Confirmed)
          if (currentBooking.status == BookingStatus.confirmed && !isHost) ...[
            ArrivalPinVoucherCard(
              pin: currentBooking.arrivalPin ?? '482910',
              hostName: currentBooking.hostName,
            ),
            const SizedBox(height: FluentSpacing.l),
          ],

          // VOUCHER 2: Completion PIN Voucher (Shown to Host on InProgress)
          if (currentBooking.status == BookingStatus.inProgress && isHost) ...[
            CompletionPinVoucherCard(
              pin: currentBooking.completionPin ?? '739184',
              guestName: currentBooking.guestName,
            ),
            const SizedBox(height: FluentSpacing.l),
          ],

          // Outing Lifecycle Stepper
          Text(
            'Outing lifecycle',
            style: FluentType.body1Strong.copyWith(
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: FluentSpacing.mNudge),
          _buildLifecycleStepper(currentBooking),
          const SizedBox(height: FluentSpacing.xl),

          // Outing Details (Date, Duration, Meeting Location)
          Text(
            'Schedule & location',
            style: FluentType.body1Strong.copyWith(
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: FluentSpacing.mNudge),
          Container(
            padding: const EdgeInsets.all(FluentSpacing.l),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(FluentRadius.xLarge),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                _buildDetailRow(
                  Icons.calendar_today_outlined,
                  'Date & time',
                  DateFormat('EEEE, MMMM d, yyyy • h:mm a')
                      .format(currentBooking.startTime),
                  isNumeric: true,
                ),
                const Divider(height: 20, color: AppColors.border),
                _buildDetailRow(
                  Icons.timer_outlined,
                  'Duration',
                  '${currentBooking.durationHours.toStringAsFixed(1)} hours (Until ${DateFormat('h:mm a').format(currentBooking.endTime)})',
                  isNumeric: true,
                ),
                const Divider(height: 20, color: AppColors.border),
                _buildDetailRow(
                  Icons.pin_drop_outlined,
                  'Meeting location',
                  currentBooking.meetingAddress,
                ),
                if (currentBooking.specialRequests != null &&
                    currentBooking.specialRequests!.isNotEmpty) ...[
                  const Divider(height: 20, color: AppColors.border),
                  _buildDetailRow(
                    Icons.note_alt_outlined,
                    'Special requests',
                    currentBooking.specialRequests!,
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: FluentSpacing.xl),

          // Escrow Payment & Ledger (Invariant Enforced)
          Text(
            'Escrow payment & ledger',
            style: FluentType.body1Strong.copyWith(
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: FluentSpacing.mNudge),
          Container(
            padding: const EdgeInsets.all(FluentSpacing.l),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(FluentRadius.xLarge),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Host rate (₹${currentBooking.hourlyRate.toStringAsFixed(0)} × ${currentBooking.durationHours.toStringAsFixed(1)} hrs)',
                      style: FluentType.numeric(FluentType.caption1).copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    Text(
                      '₹${currentBooking.providerEarnings.toStringAsFixed(0)}',
                      style: FluentType.numeric(FluentType.caption1Strong)
                          .copyWith(color: AppColors.textPrimary),
                    ),
                  ],
                ),
                const SizedBox(height: FluentSpacing.s),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Platform safety & escrow fee (10%)',
                      style: FluentType.caption1.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    Text(
                      '₹${currentBooking.platformFee.toStringAsFixed(0)}',
                      style: FluentType.numeric(FluentType.caption1Strong)
                          .copyWith(color: AppColors.textPrimary),
                    ),
                  ],
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: FluentSpacing.m),
                  child: Divider(height: 1, color: AppColors.border),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Total escrow hold',
                      style: FluentType.body2Strong.copyWith(
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      '₹${currentBooking.totalAmount.toStringAsFixed(0)}',
                      style: FluentType.numeric(FluentType.title3).copyWith(
                        color: AppColors.brandForeground,
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
        padding: const EdgeInsets.symmetric(
          horizontal: FluentSpacing.l,
          vertical: FluentSpacing.m,
        ),
        decoration: BoxDecoration(
          color: AppColors.surface,
          boxShadow: FluentShadows.shadow4,
          border: const Border(top: BorderSide(color: AppColors.border)),
        ),
        child: SafeArea(
          child: Row(
            children: [
              if (currentBooking.status != BookingStatus.completed &&
                  currentBooking.status != BookingStatus.cancelled &&
                  currentBooking.status != BookingStatus.disputed) ...[
                OutlinedButton(
                  onPressed: () {
                    controller.cancelBooking(
                      currentBooking.orderId,
                      'User requested cancellation',
                    );
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Outing has been cancelled')),
                    );
                  },
                  child: const Text('Cancel Outing'),
                ),
                const SizedBox(width: FluentSpacing.m),
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

  Widget _buildDetailRow(
    IconData icon,
    String label,
    String value, {
    bool isNumeric = false,
  }) {
    final valueStyle =
        (isNumeric ? FluentType.numeric(FluentType.caption1Strong) : FluentType.caption1Strong)
            .copyWith(color: AppColors.textPrimary);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: AppColors.textSecondary),
        const SizedBox(width: FluentSpacing.mNudge),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: FluentType.caption2.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: FluentSpacing.xxs),
              Text(value, style: valueStyle),
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
      padding: const EdgeInsets.all(FluentSpacing.l),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(FluentRadius.xLarge),
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
                      : (isDone ? AppColors.success : AppColors.surfaceMuted),
                  child: Icon(
                    isDone ? Icons.check : Icons.circle,
                    size: 14,
                    color: isDone ? Colors.white : AppColors.textMuted,
                  ),
                ),
                const SizedBox(height: FluentSpacing.sNudge),
                Text(
                  s['title'] as String,
                  textAlign: TextAlign.center,
                  style: FluentType.caption2.copyWith(
                    fontWeight: isDone ? FontWeight.w600 : FontWeight.w400,
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
                    backgroundColor: AppColors.success,
                    content: Text('Payment secured in Escrow! Outing confirmed.'),
                  ),
                );
              }
            }
          },
          label: Text(
            'Pay ₹${b.totalAmount.toStringAsFixed(0)} & Escrow',
            style: FluentType.numeric(FluentType.body2Strong).copyWith(
              color: Colors.white,
            ),
          ),
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
              backgroundColor: AppColors.success,
            ),
            onPressed: () {
              PinVerificationModal.show(
                context,
                title: 'Release Escrow & Conclude',
                subtitle:
                    'Ask ${b.hostName} for the 6-digit Completion PIN displayed on their screen.',
                primaryColor: AppColors.success,
                onVerify: (pin) async {
                  final ok = await controller.completeWithPin(b.orderId, pin);
                  if (ok && context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        backgroundColor: AppColors.success,
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
            icon: const Icon(
              Icons.verified_outlined,
              color: AppColors.successForeground,
            ),
            onPressed: () {
              PinVerificationModal.show(
                context,
                title: 'Complete Outing (Demo Guest)',
                subtitle:
                    'Testing as Guest: Enter the 6-digit code (${b.completionPin ?? "739184"}) to release escrow.',
                primaryColor: AppColors.success,
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
        return FilledButton.icon(
          icon: const Icon(Icons.support_agent_outlined),
          style: FilledButton.styleFrom(
            backgroundColor: AppColors.statusDisputed,
          ),
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                backgroundColor: AppColors.statusDisputed,
                content: Text(
                  'Priority Safety Desk is investigating Outing #${b.orderId}. Escrow locked.',
                ),
              ),
            );
          },
          label: const Text('Priority Safety Desk Active'),
        );
    }
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme.dart';
import '../../../models/booking.dart';
import '../booking_controller.dart';

class EmergencySosBottomSheet extends ConsumerWidget {
  const EmergencySosBottomSheet({
    required this.booking,
    super.key,
  });

  final Booking booking;

  static Future<void> show(BuildContext context, Booking booking) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => EmergencySosBottomSheet(booking: booking),
    );
  }

  void _call112(BuildContext context, WidgetRef ref) {
    showDialog<void>(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.phone_in_talk, color: AppColors.emergencyRed, size: 22),
            const SizedBox(width: FluentSpacing.s),
            Text(
              'Call Emergency 112',
              style: FluentType.title3.copyWith(color: AppColors.textPrimary),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'You are connecting to India’s National Emergency Helpline (112).',
              style: FluentType.body2.copyWith(color: AppColors.textPrimary),
            ),
            const SizedBox(height: FluentSpacing.m),
            Container(
              padding: const EdgeInsets.all(FluentSpacing.m),
              decoration: BoxDecoration(
                color: AppColors.surfaceMuted,
                borderRadius: BorderRadius.circular(FluentRadius.large),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Your current outing location:',
                    style: FluentType.caption2.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: FluentSpacing.xs),
                  Text(
                    booking.meetingAddress,
                    style: FluentType.caption1Strong.copyWith(
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: FluentSpacing.sNudge),
                  Text(
                    'Outing #${booking.orderId}',
                    style: FluentType.numeric(FluentType.caption2).copyWith(
                      color: AppColors.brandForeground,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogCtx).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.emergencyRed,
              foregroundColor: Colors.white,
            ),
            icon: const Icon(Icons.call, size: 18),
            label: const Text('Confirm & Call 112'),
            onPressed: () {
              Navigator.of(dialogCtx).pop();
              ref.read(bookingControllerProvider.notifier).reportSafetyIncident(
                    booking.orderId,
                    reason: 'Emergency 112 call initiated during active outing',
                  );
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  backgroundColor: AppColors.emergencyRed,
                  content: Text(
                    'Dispatched emergency notification to Cue Safety Desk. Dialing 112...',
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  void _shareLocationAlert(BuildContext context, WidgetRef ref) {
    ref.read(bookingControllerProvider.notifier).reportSafetyIncident(
          booking.orderId,
          reason: 'Trusted contact SOS alert broadcasted',
          contactAlerted: 'Emergency Contact (+91 98765 43210)',
        );

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: AppColors.primary,
        content: Text(
          'Live outing alert dispatched to emergency contact with location: ${booking.meetingAddress}',
        ),
      ),
    );
    Navigator.of(context).pop();
  }

  void _confirmEndOutingEarly(BuildContext context, WidgetRef ref) {
    String selectedReason = 'Felt uncomfortable or unsafe';
    final reasons = [
      'Felt uncomfortable or unsafe',
      'Companion did not match verified profile',
      'Venue changed to non-public area',
      'Other safety policy violation',
    ];

    showDialog<void>(
      context: context,
      builder: (dialogCtx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('End Outing & Freeze Escrow'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'This will immediately end the session and place escrow funds into dispute investigation. No automatic payout will be released to the host.',
                style: FluentType.caption1.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: FluentSpacing.l),
              Text(
                'Select primary reason:',
                style: FluentType.caption1Strong.copyWith(
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: FluentSpacing.s),
              ...reasons.map((r) => InkWell(
                    borderRadius: BorderRadius.circular(FluentRadius.large),
                    onTap: () => setDialogState(() => selectedReason = r),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        vertical: FluentSpacing.sNudge,
                        horizontal: FluentSpacing.xs,
                      ),
                      child: Row(
                        children: [
                          Icon(
                            selectedReason == r
                                ? Icons.radio_button_checked
                                : Icons.radio_button_off,
                            color: selectedReason == r
                                ? AppColors.emergencyRed
                                : AppColors.textMuted,
                            size: 20,
                          ),
                          const SizedBox(width: FluentSpacing.mNudge),
                          Expanded(
                            child: Text(
                              r,
                              style: (selectedReason == r
                                      ? FluentType.caption1Strong
                                      : FluentType.caption1)
                                  .copyWith(color: AppColors.textPrimary),
                            ),
                          ),
                        ],
                      ),
                    ),
                  )),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogCtx).pop(),
              child: const Text('Go Back'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.emergencyRed,
                foregroundColor: Colors.white,
              ),
              onPressed: () {
                Navigator.of(dialogCtx).pop();
                ref
                    .read(bookingControllerProvider.notifier)
                    .endOutingWithSafetyDispute(
                      booking.orderId,
                      selectedReason,
                    );
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    backgroundColor: AppColors.emergencyRed,
                    content: Text(
                      'Outing #${booking.orderId} ended under safety dispute. Escrow funds frozen.',
                    ),
                  ),
                );
              },
              child: const Text('Freeze & End Outing'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final shortOrderId = booking.orderId.length > 8
        ? booking.orderId.substring(booking.orderId.length - 7)
        : booking.orderId;

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(FluentRadius.xLarge),
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(
            FluentSpacing.l,
            FluentSpacing.m,
            FluentSpacing.l,
            FluentSpacing.xxl,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Drag Handle
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.borderStrong,
                    borderRadius: BorderRadius.circular(FluentRadius.small),
                  ),
                ),
              ),
              const SizedBox(height: FluentSpacing.l),

              // Header Row
              Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppColors.emergencyRedLight,
                      borderRadius: BorderRadius.circular(FluentRadius.large),
                      border: Border.all(
                        color: AppColors.emergencyRed.withValues(alpha: 0.25),
                      ),
                    ),
                    child: const Icon(
                      Icons.shield_outlined,
                      color: AppColors.emergencyRed,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: FluentSpacing.m),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Emergency Safety Hub',
                          style: FluentType.title3.copyWith(
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          'Outing #$shortOrderId • ${booking.meetingAddress}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: FluentType.numeric(FluentType.caption2).copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    constraints: const BoxConstraints(
                      minWidth: 44,
                      minHeight: 44,
                    ),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: FluentSpacing.l),

              // Trust & Safety Notice
              Container(
                padding: const EdgeInsets.all(FluentSpacing.m),
                decoration: BoxDecoration(
                  color: AppColors.surfaceMuted,
                  borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.verified_user_outlined,
                      size: 18,
                      color: AppColors.gold,
                    ),
                    const SizedBox(width: FluentSpacing.mNudge),
                    Expanded(
                      child: Text(
                        'Cue strictly mandates verified public venues and platonic companionship. If you ever feel unsafe or require intervention, choose an option below.',
                        style: FluentType.caption2.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: FluentSpacing.l),

              // ACTION 1: 112 National Emergency Call
              SizedBox(
                width: double.infinity,
                child: Material(
                  color: AppColors.emergencyRed,
                  borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                    onTap: () => _call112(context, ref),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: FluentSpacing.l,
                        vertical: FluentSpacing.m,
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.phone_in_talk,
                            color: Colors.white,
                            size: 24,
                          ),
                          const SizedBox(width: FluentSpacing.m),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Call 112 (National Emergency)',
                                  style: FluentType.body2Strong.copyWith(
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: FluentSpacing.xxs),
                                Text(
                                  'Direct line to Police, Ambulance & Fire across India',
                                  style: FluentType.caption2.copyWith(
                                    color: Colors.white.withValues(alpha: 0.85),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Icon(
                            Icons.arrow_forward_ios,
                            size: 14,
                            color: Colors.white.withValues(alpha: 0.85),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: FluentSpacing.m),

              // ACTION 2: Send Live Location Alert to Contact
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: FluentSpacing.l,
                      vertical: FluentSpacing.m,
                    ),
                    side: const BorderSide(color: AppColors.border),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                    ),
                  ),
                  onPressed: () => _shareLocationAlert(context, ref),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.share_location,
                        color: AppColors.brandForeground,
                        size: 22,
                      ),
                      const SizedBox(width: FluentSpacing.m),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Alert Emergency Contact',
                              style: FluentType.body2Strong.copyWith(
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: FluentSpacing.xxs),
                            Text(
                              'Dispatches your live meeting venue & outing ID via SMS',
                              style: FluentType.caption2.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(
                        Icons.arrow_forward_ios,
                        size: 14,
                        color: AppColors.textMuted,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: FluentSpacing.m),

              // ACTION 3: End Outing Early & Halt Escrow
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: FluentSpacing.l,
                      vertical: FluentSpacing.m,
                    ),
                    side: BorderSide(
                      color: AppColors.emergencyRed.withValues(alpha: 0.35),
                    ),
                    backgroundColor: AppColors.emergencyRedLight,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                    ),
                  ),
                  onPressed: () => _confirmEndOutingEarly(context, ref),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.front_hand_outlined,
                        color: AppColors.emergencyRed,
                        size: 22,
                      ),
                      const SizedBox(width: FluentSpacing.m),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'End Outing & Freeze Escrow',
                              style: FluentType.body2Strong.copyWith(
                                color: AppColors.emergencyRed,
                              ),
                            ),
                            const SizedBox(height: FluentSpacing.xxs),
                            Text(
                              'Concludes outing now, halts funds for safety audit',
                              style: FluentType.caption2.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Icon(
                        Icons.arrow_forward_ios,
                        size: 14,
                        color: AppColors.emergencyRed,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: FluentSpacing.l),

              // Footer Guarantee
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.lock_clock_outlined,
                    size: 14,
                    color: AppColors.gold,
                  ),
                  const SizedBox(width: FluentSpacing.sNudge),
                  Flexible(
                    child: Text(
                      '2-Step Escrow Guarantee: Funds held in trust until verified safe.',
                      textAlign: TextAlign.center,
                      style: FluentType.caption2.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.gold,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

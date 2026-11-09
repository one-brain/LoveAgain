import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../models/booking.dart';
import '../auth/auth_controller.dart';
import '../widgets/status_chip.dart';
import 'booking_controller.dart';
import 'booking_detail_screen.dart';

class BookingsScreen extends ConsumerWidget {
  const BookingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(bookingControllerProvider);
    final controller = ref.read(bookingControllerProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Outings'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => controller.loadBookings(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Section: Status Pills and Role Scope
          Container(
            padding: const EdgeInsets.fromLTRB(
              FluentSpacing.l,
              FluentSpacing.s,
              FluentSpacing.l,
              FluentSpacing.mNudge,
            ),
            color: AppColors.background,
            child: Column(
              children: [
                // Status Filter Pills (Active, Completed, Cancelled)
                Row(
                  children: [
                    _buildTabChip(
                      'active',
                      'Active (${state.activeBookings.length})',
                      state.selectedTab,
                      controller,
                    ),
                    const SizedBox(width: FluentSpacing.s),
                    _buildTabChip(
                      'completed',
                      'Completed (${state.completedBookings.length})',
                      state.selectedTab,
                      controller,
                    ),
                    const SizedBox(width: FluentSpacing.s),
                    _buildTabChip(
                      'cancelled',
                      'Cancelled (${state.cancelledBookings.length})',
                      state.selectedTab,
                      controller,
                    ),
                  ],
                ),
                const SizedBox(height: FluentSpacing.s),
                // Role Scope Filter (All, Attending, Hosting)
                Row(
                  children: [
                    _buildRoleChip(
                      'all',
                      'All Outings',
                      state.selectedRoleFilter,
                      controller,
                    ),
                    const SizedBox(width: FluentSpacing.sNudge),
                    _buildRoleChip(
                      'guest',
                      'Attending',
                      state.selectedRoleFilter,
                      controller,
                    ),
                    const SizedBox(width: FluentSpacing.sNudge),
                    _buildRoleChip(
                      'host',
                      'Hosting',
                      state.selectedRoleFilter,
                      controller,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.border),

          // Bookings List
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator())
                : state.filteredBookings.isEmpty
                    ? _buildEmptyState(context, state.selectedTab)
                    : RefreshIndicator(
                        onRefresh: () => controller.loadBookings(),
                        child: ListView.builder(
                          padding: const EdgeInsets.all(FluentSpacing.l),
                          itemCount: state.filteredBookings.length,
                          itemBuilder: (context, index) {
                            final booking = state.filteredBookings[index];
                            return _BookingCard(booking: booking);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleChip(
    String role,
    String label,
    String currentRole,
    BookingController controller,
  ) {
    final isSelected = role == currentRole;
    final Color selectedBg = role == 'host'
        ? AppColors.goldLight
        : (role == 'guest' ? AppColors.primaryLight : AppColors.surface);
    final Color selectedBorder = role == 'host'
        ? AppColors.goldBorder
        : (role == 'guest' ? AppColors.brandStroke : AppColors.borderStrong);
    final Color selectedText = role == 'host'
        ? AppColors.gold
        : (role == 'guest' ? AppColors.brandForeground : AppColors.textPrimary);

    return InkWell(
      onTap: () => controller.setRoleFilter(role),
      borderRadius: BorderRadius.circular(FluentRadius.circular),
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: FluentSpacing.m,
          vertical: FluentSpacing.sNudge,
        ),
        decoration: BoxDecoration(
          color: isSelected ? selectedBg : Colors.transparent,
          borderRadius: BorderRadius.circular(FluentRadius.circular),
          border: Border.all(
            color: isSelected ? selectedBorder : AppColors.border,
          ),
        ),
        child: Text(
          label,
          style: FluentType.caption2.copyWith(
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
            color: isSelected ? selectedText : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildTabChip(
    String tab,
    String label,
    String currentTab,
    BookingController controller,
  ) {
    final isSelected = tab == currentTab;
    return Expanded(
      child: InkWell(
        onTap: () => controller.setTab(tab),
        borderRadius: BorderRadius.circular(FluentRadius.large),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: FluentSpacing.s),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary : AppColors.surface,
            borderRadius: BorderRadius.circular(FluentRadius.large),
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.border,
            ),
          ),
          child: Text(
            label,
            style: FluentType.numeric(FluentType.caption2).copyWith(
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
              color: isSelected ? Colors.white : AppColors.textPrimary,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, String tab) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(
          horizontal: FluentSpacing.xxl,
          vertical: FluentSpacing.l,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.event_note_outlined,
              size: 48,
              color: AppColors.textMuted,
            ),
            const SizedBox(height: FluentSpacing.m),
            Text(
              'No $tab outings',
              style: FluentType.body1Strong.copyWith(
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: FluentSpacing.sNudge),
            Text(
              'Looking to plan a new outing? Browse thoughtful companions now.',
              textAlign: TextAlign.center,
              style: FluentType.caption1.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: FluentSpacing.l),
            FilledButton.icon(
              onPressed: () => context.go('/'),
              icon: const Icon(Icons.explore, size: 18),
              label: const Text('Explore Companions'),
            ),
          ],
        ),
      ),
    );
  }
}

class _BookingCard extends ConsumerWidget {
  const _BookingCard({required this.booking});

  final Booking booking;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final controller = ref.read(bookingControllerProvider.notifier);
    final auth = ref.watch(authControllerProvider);
    final currentUserId = auth.user?.id;
    final isHost = (currentUserId != null &&
            currentUserId.isNotEmpty &&
            booking.providerId == currentUserId) ||
        (auth.isHostMode && booking.seekerId != currentUserId);

    // Counterpart details (who the user is meeting with)
    final counterpartName = isHost
        ? (booking.seekerName.isNotEmpty ? booking.seekerName : 'Guest')
        : (booking.providerName.isNotEmpty ? booking.providerName : 'Companion');

    final counterpartInitials = isHost
        ? (booking.seekerName.isNotEmpty
            ? booking.seekerName
                .trim()
                .split(RegExp(r'\s+'))
                .map((n) => n.isNotEmpty ? n[0] : '')
                .take(2)
                .join('')
                .toUpperCase()
            : 'GT')
        : (booking.providerInitials.isNotEmpty ? booking.providerInitials : 'CP');

    final counterpartRole = isHost ? 'Guest' : 'Companion host';

    final roleBadge = Container(
      padding: const EdgeInsets.symmetric(
        horizontal: FluentSpacing.sNudge,
        vertical: FluentSpacing.xxs,
      ),
      decoration: BoxDecoration(
        color: isHost ? AppColors.goldLight : AppColors.primaryLight,
        borderRadius: BorderRadius.circular(FluentRadius.medium),
        border: Border.all(
          color: isHost ? AppColors.goldBorder : AppColors.brandStroke,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isHost ? Icons.verified_user_outlined : Icons.event_seat_outlined,
            size: 11,
            color: isHost ? AppColors.gold : AppColors.brandForeground,
          ),
          const SizedBox(width: FluentSpacing.xxs),
          Text(
            isHost ? 'HOSTING' : 'ATTENDING',
            style: FluentType.caption2.copyWith(
              fontWeight: FontWeight.w600,
              color: isHost ? AppColors.gold : AppColors.brandForeground,
            ),
          ),
        ],
      ),
    );

    return Container(
      margin: const EdgeInsets.only(bottom: FluentSpacing.m),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(FluentRadius.xLarge),
        border: Border.all(color: AppColors.border),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(FluentRadius.xLarge),
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (ctx) => BookingDetailScreen(booking: booking),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(FluentSpacing.l),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header: Counterpart & Status + Role Badge
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 20,
                          backgroundColor: isHost
                              ? AppColors.goldLight
                              : AppColors.primaryLight,
                          child: Text(
                            counterpartInitials,
                            style: FluentType.caption1Strong.copyWith(
                              color: isHost
                                  ? AppColors.gold
                                  : AppColors.brandForeground,
                            ),
                          ),
                        ),
                        const SizedBox(width: FluentSpacing.mNudge),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                counterpartName,
                                style: FluentType.body2Strong.copyWith(
                                  color: AppColors.textPrimary,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                              Text(
                                '$counterpartRole • #${booking.orderId.substring(booking.orderId.length > 7 ? booking.orderId.length - 6 : 0)}',
                                style: FluentType.numeric(FluentType.caption2)
                                    .copyWith(color: AppColors.textMuted),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: FluentSpacing.s),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      BookingStatusChip(status: booking.status),
                      const SizedBox(height: FluentSpacing.xs),
                      roleBadge,
                    ],
                  ),
                ],
              ),
              const SizedBox(height: FluentSpacing.m),
              const Divider(height: 1, color: AppColors.border),
              const SizedBox(height: FluentSpacing.m),

              // Booking Time & Address Details
              Row(
                children: [
                  const Icon(
                    Icons.calendar_today_outlined,
                    size: 14,
                    color: AppColors.textSecondary,
                  ),
                  const SizedBox(width: FluentSpacing.sNudge),
                  Text(
                    DateFormat('EEE, MMM d, yyyy • h:mm a')
                        .format(booking.startTime),
                    style: FluentType.numeric(FluentType.caption1Strong)
                        .copyWith(color: AppColors.textPrimary),
                  ),
                ],
              ),
              const SizedBox(height: FluentSpacing.sNudge),
              Row(
                children: [
                  const Icon(
                    Icons.location_on_outlined,
                    size: 14,
                    color: AppColors.textSecondary,
                  ),
                  const SizedBox(width: FluentSpacing.sNudge),
                  Expanded(
                    child: Text(
                      booking.meetingAddress,
                      style: FluentType.caption2.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: FluentSpacing.m),

              // Pricing and Actions Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '₹${(isHost ? booking.providerEarnings : booking.totalAmount).toStringAsFixed(0)}',
                        style: FluentType.numeric(FluentType.body1Strong)
                            .copyWith(color: AppColors.brandForeground),
                      ),
                      Text(
                        isHost
                            ? 'Your payout • ${booking.durationHours.toStringAsFixed(1)} hrs'
                            : 'Total paid • ${booking.durationHours.toStringAsFixed(1)} hrs',
                        style: FluentType.numeric(FluentType.caption2).copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      IconButton.outlined(
                        icon: const Icon(Icons.chat_bubble_outline, size: 18),
                        tooltip: isHost ? 'Message Guest' : 'Message Host',
                        style: IconButton.styleFrom(
                          side: const BorderSide(color: AppColors.border),
                        ),
                        onPressed: () {
                          context.push(
                            '/chat/${booking.orderId}',
                            extra: booking,
                          );
                        },
                      ),
                      const SizedBox(width: FluentSpacing.s),
                      _buildQuickActionButton(
                        context,
                        booking,
                        controller,
                        isHost,
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickActionButton(
    BuildContext context,
    Booking b,
    BookingController controller,
    bool isHost,
  ) {
    if (isHost) {
      switch (b.status) {
        case BookingStatus.confirmed:
          return FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(
                horizontal: FluentSpacing.m,
                vertical: FluentSpacing.s,
              ),
              minimumSize: const Size(44, 36),
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (ctx) => BookingDetailScreen(booking: b),
                ),
              );
            },
            child: Text(
              'Verify PIN',
              style: FluentType.caption2.copyWith(
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          );
        case BookingStatus.inProgress:
          return FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.success,
              padding: const EdgeInsets.symmetric(
                horizontal: FluentSpacing.m,
                vertical: FluentSpacing.s,
              ),
              minimumSize: const Size(44, 36),
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (ctx) => BookingDetailScreen(booking: b),
                ),
              );
            },
            child: Text(
              'In Outing',
              style: FluentType.caption2.copyWith(
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          );
        default:
          return OutlinedButton(
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(
                horizontal: FluentSpacing.m,
                vertical: FluentSpacing.s,
              ),
              minimumSize: const Size(44, 36),
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (ctx) => BookingDetailScreen(booking: b),
                ),
              );
            },
            child: Text(
              'Details',
              style: FluentType.caption2.copyWith(
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          );
      }
    }

    // Guest actions
    switch (b.status) {
      case BookingStatus.pendingPayment:
        return FilledButton(
          style: FilledButton.styleFrom(
            padding: const EdgeInsets.symmetric(
              horizontal: FluentSpacing.m,
              vertical: FluentSpacing.s,
            ),
            minimumSize: const Size(44, 36),
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          onPressed: () => controller.payBooking(b.orderId),
          child: Text(
            'Pay Now',
            style: FluentType.caption2.copyWith(
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
        );
      case BookingStatus.confirmed:
        return FilledButton(
          style: FilledButton.styleFrom(
            backgroundColor: AppColors.primary,
            padding: const EdgeInsets.symmetric(
              horizontal: FluentSpacing.m,
              vertical: FluentSpacing.s,
            ),
            minimumSize: const Size(44, 36),
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          onPressed: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (ctx) => BookingDetailScreen(booking: b),
              ),
            );
          },
          child: Text(
            'View PIN',
            style: FluentType.caption2.copyWith(
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
        );
      case BookingStatus.inProgress:
        return FilledButton(
          style: FilledButton.styleFrom(
            backgroundColor: AppColors.success,
            padding: const EdgeInsets.symmetric(
              horizontal: FluentSpacing.m,
              vertical: FluentSpacing.s,
            ),
            minimumSize: const Size(44, 36),
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          onPressed: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (ctx) => BookingDetailScreen(booking: b),
              ),
            );
          },
          child: Text(
            'Verify PIN',
            style: FluentType.caption2.copyWith(
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
        );
      case BookingStatus.completed:
        if (!b.hasReview) {
          return OutlinedButton(
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(
                horizontal: FluentSpacing.m,
                vertical: FluentSpacing.s,
              ),
              minimumSize: const Size(44, 36),
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            onPressed: () => _showReviewDialog(context, b, controller),
            child: Text(
              'Review',
              style: FluentType.caption2.copyWith(
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          );
        }
        return const SizedBox.shrink();
      case BookingStatus.cancelled:
      case BookingStatus.disputed:
        return const SizedBox.shrink();
    }
  }

  void _showReviewDialog(
    BuildContext context,
    Booking b,
    BookingController controller,
  ) {
    double rating = 5.0;
    final commentCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(FluentRadius.xLarge),
          ),
          title: Text('Review ${b.providerName}'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('How was your moment together?'),
              const SizedBox(height: FluentSpacing.m),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  final starVal = index + 1;
                  return IconButton(
                    icon: Icon(
                      starVal <= rating
                          ? Icons.star_rounded
                          : Icons.star_outline_rounded,
                      color: AppColors.gold,
                      size: 32,
                    ),
                    onPressed: () =>
                        setDialogState(() => rating = starVal.toDouble()),
                  );
                }),
              ),
              const SizedBox(height: FluentSpacing.m),
              TextField(
                controller: commentCtrl,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText: 'Share a note about your experience...',
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () {
                controller.submitReview(
                  b.orderId,
                  rating,
                  commentCtrl.text.trim(),
                );
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Thank you for your review!')),
                );
              },
              child: const Text('Submit review'),
            ),
          ],
        ),
      ),
    );
  }
}


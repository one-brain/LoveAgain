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
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 10),
            color: AppColors.background,
            child: Column(
              children: [
                // Status Filter Pills (Active, Completed, Cancelled)
                Row(
                  children: [
                    _buildTabChip('active', 'Active (${state.activeBookings.length})',
                        state.selectedTab, controller),
                    const SizedBox(width: 8),
                    _buildTabChip(
                        'completed',
                        'Completed (${state.completedBookings.length})',
                        state.selectedTab,
                        controller),
                    const SizedBox(width: 8),
                    _buildTabChip(
                        'cancelled',
                        'Cancelled (${state.cancelledBookings.length})',
                        state.selectedTab,
                        controller),
                  ],
                ),
                const SizedBox(height: 8),
                // Role Scope Filter (All, Attending, Hosting)
                Row(
                  children: [
                    _buildRoleChip(
                        'all', 'All Outings', state.selectedRoleFilter, controller),
                    const SizedBox(width: 6),
                    _buildRoleChip(
                        'guest', 'Attending', state.selectedRoleFilter, controller),
                    const SizedBox(width: 6),
                    _buildRoleChip(
                        'host', 'Hosting', state.selectedRoleFilter, controller),
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
                          padding: const EdgeInsets.all(16),
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
      String role, String label, String currentRole, BookingController controller) {
    final isSelected = role == currentRole;
    return InkWell(
      onTap: () => controller.setRoleFilter(role),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected
              ? (role == 'host'
                  ? const Color(0xFFFEF3C7)
                  : (role == 'guest' ? const Color(0xFFFCE7F3) : AppColors.surface))
              : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? (role == 'host'
                    ? const Color(0xFFC5A059)
                    : (role == 'guest' ? AppColors.primary : AppColors.textPrimary))
                : AppColors.border,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected
                ? (role == 'host'
                    ? const Color(0xFF92400E)
                    : (role == 'guest' ? AppColors.primary : AppColors.textPrimary))
                : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildTabChip(
      String tab, String label, String currentTab, BookingController controller) {
    final isSelected = tab == currentTab;
    return Expanded(
      child: InkWell(
        onTap: () => controller.setTab(tab),
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary : AppColors.surface,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.border,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
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
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.event_note_outlined,
                size: 48, color: AppColors.textMuted),
            const SizedBox(height: 12),
            Text(
              'No $tab outings',
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Looking to plan a new outing? Browse thoughtful companions now.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 16),
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

    final counterpartRole = isHost ? 'Guest' : 'Companion Host';

    final roleBadge = Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
      decoration: BoxDecoration(
        color: isHost ? const Color(0xFFFEF3C7) : const Color(0xFFFCE7F3),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(
          color: isHost ? const Color(0xFFC5A059) : AppColors.primary,
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isHost ? Icons.shield_outlined : Icons.event_seat_outlined,
            size: 10,
            color: isHost ? const Color(0xFF92400E) : AppColors.primary,
          ),
          const SizedBox(width: 3),
          Text(
            isHost ? 'HOSTING' : 'ATTENDING',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.5,
              color: isHost ? const Color(0xFF92400E) : AppColors.primary,
            ),
          ),
        ],
      ),
    );

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (ctx) => BookingDetailScreen(booking: booking),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
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
                              ? const Color(0xFFFEF3C7)
                              : AppColors.primaryLight,
                          child: Text(
                            counterpartInitials,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: isHost
                                  ? const Color(0xFF92400E)
                                  : AppColors.primaryDark,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                counterpartName,
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                              Text(
                                '$counterpartRole • #${booking.orderId.substring(booking.orderId.length > 7 ? booking.orderId.length - 6 : 0)}',
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: AppColors.textMuted,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      BookingStatusChip(status: booking.status),
                      const SizedBox(height: 4),
                      roleBadge,
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 14),
              const Divider(height: 1, color: AppColors.border),
              const SizedBox(height: 12),

              // Booking Time & Address Details
              Row(
                children: [
                  const Icon(Icons.calendar_today_outlined,
                      size: 14, color: AppColors.textSecondary),
                  const SizedBox(width: 6),
                  Text(
                    DateFormat('EEE, MMM d, yyyy • h:mm a')
                        .format(booking.startTime),
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  const Icon(Icons.location_on_outlined,
                      size: 14, color: AppColors.textSecondary),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      booking.meetingAddress,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Pricing and Actions Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '₹${(isHost ? booking.providerEarnings : booking.totalAmount).toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                          fontFamily: 'monospace',
                        ),
                      ),
                      Text(
                        isHost
                            ? 'Your payout • ${booking.durationHours.toStringAsFixed(1)} hrs'
                            : 'Total paid • ${booking.durationHours.toStringAsFixed(1)} hrs',
                        style: const TextStyle(
                          fontSize: 11,
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
                          context.push('/chat/${booking.orderId}',
                              extra: booking);
                        },
                      ),
                      const SizedBox(width: 8),
                      _buildQuickActionButton(context, booking, controller, isHost),
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
      BuildContext context, Booking b, BookingController controller, bool isHost) {
    if (isHost) {
      switch (b.status) {
        case BookingStatus.confirmed:
          return FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (ctx) => BookingDetailScreen(booking: b),
                ),
              );
            },
            child: const Text('Verify PIN', style: TextStyle(fontSize: 12)),
          );
        case BookingStatus.inProgress:
          return FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFF047857),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (ctx) => BookingDetailScreen(booking: b),
                ),
              );
            },
            child: const Text('In Outing', style: TextStyle(fontSize: 12)),
          );
        default:
          return OutlinedButton(
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (ctx) => BookingDetailScreen(booking: b),
                ),
              );
            },
            child: const Text('Details', style: TextStyle(fontSize: 12)),
          );
      }
    }

    // Guest actions
    switch (b.status) {
      case BookingStatus.pendingPayment:
        return FilledButton(
          style: FilledButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          onPressed: () => controller.payBooking(b.orderId),
          child: const Text('Pay Now', style: TextStyle(fontSize: 12)),
        );
      case BookingStatus.confirmed:
        return FilledButton(
          style: FilledButton.styleFrom(
            backgroundColor: AppColors.primary,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          onPressed: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (ctx) => BookingDetailScreen(booking: b),
              ),
            );
          },
          child: const Text('View PIN', style: TextStyle(fontSize: 12)),
        );
      case BookingStatus.inProgress:
        return FilledButton(
          style: FilledButton.styleFrom(
            backgroundColor: const Color(0xFF047857),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          onPressed: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (ctx) => BookingDetailScreen(booking: b),
              ),
            );
          },
          child: const Text('Verify PIN', style: TextStyle(fontSize: 12)),
        );
      case BookingStatus.completed:
        if (!b.hasReview) {
          return OutlinedButton(
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            onPressed: () => _showReviewDialog(context, b, controller),
            child: const Text('Review', style: TextStyle(fontSize: 12)),
          );
        }
        return const SizedBox.shrink();
      case BookingStatus.cancelled:
      case BookingStatus.disputed:
        return const SizedBox.shrink();
    }
  }

  void _showReviewDialog(
      BuildContext context, Booking b, BookingController controller) {
    double rating = 5.0;
    final commentCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text('Review ${b.providerName}'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('How was your moment together?'),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  final starVal = index + 1;
                  return IconButton(
                    icon: Icon(
                      starVal <= rating
                          ? Icons.star_rounded
                          : Icons.star_outline_rounded,
                      color: const Color(0xFFF59E0B),
                      size: 32,
                    ),
                    onPressed: () =>
                        setDialogState(() => rating = starVal.toDouble()),
                  );
                }),
              ),
              const SizedBox(height: 12),
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
                    b.orderId, rating, commentCtrl.text.trim());
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Thank you for your review!')),
                );
              },
              child: const Text('Submit Review'),
            ),
          ],
        ),
      ),
    );
  }
}


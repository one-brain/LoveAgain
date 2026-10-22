import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../models/booking.dart';
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
        title: const Text('My Bookings'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => controller.loadBookings(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Tabs
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: AppColors.background,
            child: Row(
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
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.event_note_outlined,
                size: 56, color: AppColors.textMuted),
            const SizedBox(height: 16),
            Text(
              'No $tab bookings',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Looking to plan a new outing? Browse thoughtful companions now.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: () => context.go('/'),
              icon: const Icon(Icons.explore),
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
              // Header: Companion & Status
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: AppColors.primaryLight,
                        child: Text(
                          booking.providerInitials.isNotEmpty
                              ? booking.providerInitials
                              : 'CP',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primaryDark,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            booking.providerName,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            'Order #${booking.orderId.substring(booking.orderId.length > 7 ? booking.orderId.length - 6 : 0)}',
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  BookingStatusChip(status: booking.status),
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
                        '\$${booking.totalAmount.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                        ),
                      ),
                      Text(
                        '${booking.durationHours.toStringAsFixed(1)} hrs total',
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
                        tooltip: 'Message Companion',
                        style: IconButton.styleFrom(
                          side: const BorderSide(color: AppColors.border),
                        ),
                        onPressed: () {
                          context.push('/chat/${booking.orderId}',
                              extra: booking);
                        },
                      ),
                      const SizedBox(width: 8),
                      _buildQuickActionButton(context, booking, controller),
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
      BuildContext context, Booking b, BookingController controller) {
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
            backgroundColor: AppColors.sage,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          onPressed: () => controller.startBooking(b.orderId),
          child: const Text('Start', style: TextStyle(fontSize: 12)),
        );
      case BookingStatus.inProgress:
        return FilledButton(
          style: FilledButton.styleFrom(
            backgroundColor: AppColors.statusCompleted,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          onPressed: () => controller.completeBooking(b.orderId),
          child: const Text('Complete', style: TextStyle(fontSize: 12)),
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


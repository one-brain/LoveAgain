import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../booking/booking_controller.dart';
import '../widgets/status_chip.dart';

class MessagesScreen extends ConsumerStatefulWidget {
  const MessagesScreen({super.key});

  @override
  ConsumerState<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends ConsumerState<MessagesScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bookingsState = ref.watch(bookingControllerProvider);
    final bookings = bookingsState.bookings;

    final visibleBookings = bookings.where((b) {
      if (_searchQuery.isEmpty) return true;
      return b.providerName.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          b.orderId.toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Messages'),
      ),
      body: Column(
        children: [
          // Search Field
          Padding(
            padding: const EdgeInsets.fromLTRB(
              FluentSpacing.l,
              FluentSpacing.m,
              FluentSpacing.l,
              FluentSpacing.m,
            ),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val.trim()),
              decoration: InputDecoration(
                hintText: 'Search conversations...',
                prefixIcon: const Icon(
                  Icons.search,
                  color: AppColors.textSecondary,
                ),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
              ),
            ),
          ),
          const Divider(height: 1, color: AppColors.border),

          // Message Threads List
          Expanded(
            child: visibleBookings.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(FluentSpacing.xxxl),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.chat_bubble_outline_rounded,
                            size: 48,
                            color: AppColors.textMuted,
                          ),
                          const SizedBox(height: FluentSpacing.m),
                          Text(
                            'No conversations yet',
                            style: FluentType.body1Strong.copyWith(
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: FluentSpacing.sNudge),
                          Text(
                            'Book a companion to begin coordinating your moments and exchanging messages.',
                            textAlign: TextAlign.center,
                            style: FluentType.caption1.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: FluentSpacing.xl),
                          FilledButton(
                            onPressed: () => context.go('/'),
                            child: const Text('Find curated hosts'),
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(
                      vertical: FluentSpacing.s,
                    ),
                    itemCount: visibleBookings.length,
                    separatorBuilder: (context, index) => const Divider(
                      height: 1,
                      indent: 72,
                      color: AppColors.border,
                    ),
                    itemBuilder: (context, index) {
                      final b = visibleBookings[index];
                      return ListTile(
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: FluentSpacing.l,
                          vertical: FluentSpacing.s,
                        ),
                        leading: CircleAvatar(
                          radius: 22,
                          backgroundColor: AppColors.primaryLight,
                          child: Text(
                            b.providerInitials.isNotEmpty
                                ? b.providerInitials
                                : 'CP',
                            style: FluentType.body2Strong.copyWith(
                              color: AppColors.brandForeground,
                            ),
                          ),
                        ),
                        title: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              b.providerName,
                              style: FluentType.body2Strong.copyWith(
                                color: AppColors.textPrimary,
                              ),
                            ),
                            Text(
                              DateFormat('MMM d').format(b.startTime),
                              style: FluentType.numeric(FluentType.caption2)
                                  .copyWith(color: AppColors.textMuted),
                            ),
                          ],
                        ),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: FluentSpacing.xs),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  b.specialRequests ??
                                      'Chat active for booking #${b.orderId.substring(b.orderId.length > 6 ? b.orderId.length - 5 : 0)}',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: FluentType.numeric(FluentType.caption1)
                                      .copyWith(color: AppColors.textSecondary),
                                ),
                              ),
                              const SizedBox(width: FluentSpacing.s),
                              BookingStatusChip(status: b.status),
                            ],
                          ),
                        ),
                        onTap: () {
                          context.push('/chat/${b.orderId}', extra: b);
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}


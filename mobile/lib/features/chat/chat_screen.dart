import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../core/api_client.dart';
import '../../core/theme.dart';
import '../../models/booking.dart';
import '../auth/auth_controller.dart';
import '../booking/booking_controller.dart';
import '../booking/booking_detail_screen.dart';
import '../widgets/status_chip.dart';
import 'chat_controller.dart';

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({this.orderId = 'ord-8801', this.booking, super.key});

  final String orderId;
  final Booking? booking;

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    _messageController.clear();
    try {
      await ref.read(chatMessagesProvider(widget.orderId).notifier).sendMessage(text);
      if (mounted) {
        Future.delayed(const Duration(milliseconds: 100), () {
          if (_scrollController.hasClients) {
            _scrollController.animateTo(
              _scrollController.position.maxScrollExtent + 80,
              duration: const Duration(milliseconds: 250),
              curve: Curves.easeOut,
            );
          }
        });
      }
    } catch (e) {
      if (mounted) {
        final message = e is ApiException ? e.message : 'Failed to deliver message.';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(message),
            backgroundColor: AppColors.emergencyRed,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final messages = ref.watch(chatMessagesProvider(widget.orderId));
    final bookingsState = ref.watch(bookingControllerProvider);
    final booking = widget.booking ??
        bookingsState.bookings.firstWhere(
          (b) => b.orderId == widget.orderId,
          orElse: () => Booking(
            orderId: widget.orderId,
            providerId: 'prov-001',
            providerName: 'Ananya Sen',
            providerInitials: 'AS',
            seekerId: 'user-guest-001',
            seekerName: 'Alex Rivera',
            startTime: DateTime.now().add(const Duration(days: 1)),
            endTime: DateTime.now().add(const Duration(days: 1, hours: 2)),
            hourlyRate: 1500,
            durationHours: 2.0,
            providerEarnings: 3000,
            platformFee: 300,
            totalAmount: 3300,
            status: BookingStatus.confirmed,
          ),
        );

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: InkWell(
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (ctx) => BookingDetailScreen(booking: booking),
              ),
            );
          },
          child: Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.primaryLight,
                child: Text(
                  booking.providerInitials.isNotEmpty
                      ? booking.providerInitials
                      : 'CP',
                  style: FluentType.caption1Strong.copyWith(
                    color: AppColors.brandForeground,
                  ),
                ),
              ),
              const SizedBox(width: FluentSpacing.mNudge),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    booking.providerName,
                    style: FluentType.body2Strong.copyWith(
                      color: AppColors.textPrimary,
                    ),
                  ),
                  Row(
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: AppColors.gold,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: FluentSpacing.xs),
                      Text(
                        'Active outing chat',
                        style: FluentType.caption2.copyWith(
                          color: AppColors.gold,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline),
            tooltip: 'Booking Details',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (ctx) => BookingDetailScreen(booking: booking),
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Order summary banner
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: FluentSpacing.l,
              vertical: FluentSpacing.s,
            ),
            color: AppColors.surface,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.calendar_today_outlined,
                      size: 13,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: FluentSpacing.sNudge),
                    Text(
                      DateFormat('EEE, MMM d • h:mm a')
                          .format(booking.startTime),
                      style: FluentType.numeric(FluentType.caption1Strong)
                          .copyWith(color: AppColors.textPrimary),
                    ),
                  ],
                ),
                BookingStatusChip(status: booking.status),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.border),

          // Message bubbles list
          Expanded(
            child: messages.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(FluentSpacing.xxl),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.chat_bubble_outline,
                            size: 40,
                            color: AppColors.textMuted,
                          ),
                          const SizedBox(height: FluentSpacing.mNudge),
                          Text(
                            'Say hello to ${booking.providerName}',
                            style: FluentType.body2Strong.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: FluentSpacing.xs),
                          Text(
                            'Coordinate meeting spots, share expectations, or discuss details.',
                            textAlign: TextAlign.center,
                            style: FluentType.caption2.copyWith(
                              color: AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(
                      horizontal: FluentSpacing.l,
                      vertical: FluentSpacing.l,
                    ),
                    itemCount: messages.length,
                    itemBuilder: (context, index) {
                      final msg = messages[index];
                      final currentUserId =
                          ref.watch(authControllerProvider).user?.id;
                      final isMe = (currentUserId != null &&
                              currentUserId.isNotEmpty &&
                              msg.senderId == currentUserId) ||
                          msg.senderId == booking.seekerId ||
                          msg.senderId == 'user-guest-001' ||
                          msg.senderId == 'user-seeker-001' ||
                          msg.senderName == 'Alex Rivera';

                      return Align(
                        alignment: isMe
                            ? Alignment.centerRight
                            : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.only(
                            bottom: FluentSpacing.m,
                          ),
                          padding: const EdgeInsets.symmetric(
                            horizontal: FluentSpacing.m,
                            vertical: FluentSpacing.mNudge,
                          ),
                          constraints: BoxConstraints(
                            maxWidth: MediaQuery.of(context).size.width * 0.78,
                          ),
                          decoration: BoxDecoration(
                            color: isMe ? AppColors.primary : AppColors.surface,
                            borderRadius: BorderRadius.only(
                              topLeft: const Radius.circular(
                                FluentRadius.xLarge,
                              ),
                              topRight: const Radius.circular(
                                FluentRadius.xLarge,
                              ),
                              bottomLeft: Radius.circular(
                                isMe ? FluentRadius.xLarge : FluentRadius.medium,
                              ),
                              bottomRight: Radius.circular(
                                isMe ? FluentRadius.medium : FluentRadius.xLarge,
                              ),
                            ),
                            border: isMe
                                ? null
                                : Border.all(color: AppColors.border),
                          ),
                          child: Column(
                            crossAxisAlignment: isMe
                                ? CrossAxisAlignment.end
                                : CrossAxisAlignment.start,
                            children: [
                              Text(
                                msg.content,
                                style: FluentType.body2.copyWith(
                                  color: isMe
                                      ? Colors.white
                                      : AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: FluentSpacing.xs),
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    DateFormat('h:mm a').format(msg.sentAt),
                                    style: FluentType.numeric(
                                      FluentType.caption2,
                                    ).copyWith(
                                      color: isMe
                                          ? Colors.white.withValues(alpha: 0.8)
                                          : AppColors.textMuted,
                                    ),
                                  ),
                                  if (isMe) ...[
                                    const SizedBox(width: FluentSpacing.xs),
                                    Icon(
                                      Icons.done_all,
                                      size: 13,
                                      color: Colors.white.withValues(
                                        alpha: 0.85,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),

          // Message input bar
          SafeArea(
            child: Container(
              padding: const EdgeInsets.fromLTRB(
                FluentSpacing.l,
                FluentSpacing.s,
                FluentSpacing.l,
                FluentSpacing.m,
              ),
              decoration: const BoxDecoration(
                color: AppColors.surface,
                border: Border(top: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      textCapitalization: TextCapitalization.sentences,
                      decoration: const InputDecoration(
                        hintText: 'Type your message...',
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: FluentSpacing.l,
                          vertical: FluentSpacing.m,
                        ),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: FluentSpacing.s),
                  IconButton.filled(
                    onPressed: _sendMessage,
                    icon: const Icon(Icons.send_rounded, size: 20),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

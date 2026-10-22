import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/chat_repository.dart';
import '../../models/chat_message.dart';
import '../auth/auth_controller.dart';

final chatRepositoryProvider = Provider<ChatRepository>(
  (ref) => ChatRepository(ref.read(apiClientProvider)),
);

final chatMessagesProvider =
    StateNotifierProvider.family<ChatNotifier, List<ChatMessage>, String>(
  (ref, orderId) => ChatNotifier(
    orderId,
    ref.read(chatRepositoryProvider),
    ref,
  ),
);

class ChatNotifier extends StateNotifier<List<ChatMessage>> {
  ChatNotifier(this.orderId, this._repository, this._ref) : super(const []) {
    loadMessages();
  }

  final String orderId;
  final ChatRepository _repository;
  final Ref _ref;

  Future<void> loadMessages() async {
    final msgs = await _repository.getMessages(orderId);
    state = msgs;
  }

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    final auth = _ref.read(authControllerProvider);
    final user = auth.user;
    final senderId = user?.id ?? 'user-seeker-001';
    final senderName = user?.fullName ?? 'Alex Rivera';

    final sent = await _repository.sendMessage(
      orderId: orderId,
      senderId: senderId,
      senderName: senderName,
      content: text.trim(),
    );

    state = [...state, sent];

    // Simulate companion response after 1.5s for lively interactive mobile UX
    Timer(const Duration(milliseconds: 1400), () {
      final companionReplies = [
        'That sounds like a wonderful plan! Looking forward to it.',
        'Got it! See you there on time.',
        'Perfect, let me know if there are any specific spots you would like to visit.',
        'Sounds great to me!',
      ];
      final replyText = companionReplies[state.length % companionReplies.length];

      final reply = ChatMessage(
        id: 'reply-${DateTime.now().millisecondsSinceEpoch}',
        orderId: orderId,
        senderId: 'provider-user',
        senderName: 'Companion',
        content: replyText,
        sentAt: DateTime.now(),
        isRead: true,
      );
      state = [...state, reply];
    });
  }
}


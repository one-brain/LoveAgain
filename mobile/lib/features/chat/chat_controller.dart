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
    _startPolling();
  }

  final String orderId;
  final ChatRepository _repository;
  final Ref _ref;
  Timer? _pollTimer;

  void _startPolling() {
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      loadMessages();
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  Future<void> loadMessages() async {
    try {
      final msgs = await _repository.getMessages(orderId);
      if (mounted) {
        state = msgs;
      }
    } catch (_) {}
  }

  Future<ChatMessage?> sendMessage(String text) async {
    if (text.trim().isEmpty) return null;

    final auth = _ref.read(authControllerProvider);
    final user = auth.user;
    final senderId = user?.id.isNotEmpty == true ? user!.id : 'user-seeker-001';
    final senderName = user?.fullName.isNotEmpty == true ? user!.fullName : 'Alex Rivera';

    final sent = await _repository.sendMessage(
      orderId: orderId,
      senderId: senderId,
      senderName: senderName,
      content: text.trim(),
    );

    if (mounted) {
      if (!state.any((m) => m.id == sent.id)) {
        state = [...state, sent];
      }
    }
    return sent;
  }
}


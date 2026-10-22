import '../../core/api_client.dart';
import '../../models/chat_message.dart';
import '../mock_data.dart';

class ChatRepository {
  ChatRepository(this._api);

  final ApiClient _api;

  final Map<String, List<ChatMessage>> _messages = Map<String, List<ChatMessage>>.from(
    MockData.seedMessages.map((k, v) => MapEntry(k, List<ChatMessage>.from(v))),
  );

  Future<List<ChatMessage>> getMessages(String orderId) async {
    try {
      final response = await _api.get<dynamic>('/chat/orders/$orderId/messages');
      if (response.data is List) {
        final list = (response.data as List)
            .map((m) => ChatMessage.fromJson(m as Map<String, dynamic>))
            .toList();
        if (list.isNotEmpty) return list;
      }
    } catch (_) {
      // Fallback
    }

    return _messages[orderId] ?? [];
  }

  Future<ChatMessage> sendMessage({
    required String orderId,
    required String senderId,
    required String senderName,
    required String content,
  }) async {
    final message = ChatMessage(
      id: 'msg-${DateTime.now().millisecondsSinceEpoch}',
      orderId: orderId,
      senderId: senderId,
      senderName: senderName,
      content: content,
      sentAt: DateTime.now(),
      isRead: true,
    );

    try {
      await _api.post('/chat/orders/$orderId/messages', data: message.toJson());
    } catch (_) {
      // Fallback
    }

    _messages.putIfAbsent(orderId, () => []).add(message);
    return message;
  }
}


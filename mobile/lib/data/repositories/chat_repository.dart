import '../../core/api_client.dart';
import '../../models/chat_message.dart';

class ChatRepository {
  ChatRepository(this._api);

  final ApiClient _api;
  final Map<String, List<ChatMessage>> _messages = {};

  Future<List<ChatMessage>> getMessages(String orderId) async {
    try {
      final response = await _api.get<dynamic>('/chat/orders/$orderId/messages');
      if (response.data is List) {
        final list = (response.data as List)
            .map((m) => ChatMessage.fromJson(m as Map<String, dynamic>))
            .toList();
        _messages[orderId] = list;
        return list;
      }
    } catch (_) {
      // Return cached messages if offline
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
      await _api.post('/chat/orders/$orderId/messages', data: {
        'content': content,
        'messageType': 'Text',
      });
    } catch (_) {
      // In offline/preview, keep local message
    }

    _messages.putIfAbsent(orderId, () => []).add(message);
    return message;
  }
}

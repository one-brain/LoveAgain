import 'package:dio/dio.dart';
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
    } on DioException catch (e) {
      if (e.response?.statusCode == 403) {
        throw ApiException.fromDioException(e);
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
    try {
      final response = await _api.post<Map<String, dynamic>>(
        '/chat/orders/$orderId/messages',
        data: {
          'content': content,
          'messageType': 'Text',
        },
      );

      if (response.data != null) {
        final created = ChatMessage.fromJson(response.data!);
        _messages.putIfAbsent(orderId, () => []).add(created);
        return created;
      }
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    } catch (_) {
      // In offline/test fallback
    }

    final message = ChatMessage(
      id: 'msg-${DateTime.now().millisecondsSinceEpoch}',
      orderId: orderId,
      senderId: senderId,
      senderName: senderName,
      content: content,
      sentAt: DateTime.now(),
      isRead: true,
    );
    _messages.putIfAbsent(orderId, () => []).add(message);
    return message;
  }
}

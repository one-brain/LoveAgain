class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.orderId,
    required this.senderId,
    required this.senderName,
    required this.content,
    required this.sentAt,
    this.isRead = false,
    this.messageType = 'Text',
  });

  final String id;
  final String orderId;
  final String senderId;
  final String senderName;
  final String content;
  final DateTime sentAt;
  final bool isRead;
  final String messageType;

  Map<String, dynamic> toJson() => {
        'id': id,
        'orderId': orderId,
        'senderId': senderId,
        'senderName': senderName,
        'content': content,
        'sentAt': sentAt.toIso8601String(),
        'isRead': isRead,
        'messageType': messageType,
      };

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as String? ?? '',
      orderId: json['orderId'] as String? ?? '',
      senderId: json['senderId'] as String? ?? '',
      senderName: json['senderName'] as String? ?? '',
      content: json['content'] as String? ?? '',
      sentAt: DateTime.tryParse(json['sentAt'] as String? ?? '') ?? DateTime.now(),
      isRead: json['isRead'] as bool? ?? false,
      messageType: json['messageType'] as String? ?? 'Text',
    );
  }
}


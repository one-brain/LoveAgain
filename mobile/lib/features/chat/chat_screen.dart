import 'package:flutter/material.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final draftController = TextEditingController();
  final messages = <String>[
    'Hey Maya, I saw your note about the late gallery opening.',
    'The new photography wing is lovely after sunset. Want to meet by the east entrance?',
  ];

  @override
  void dispose() {
    draftController.dispose();
    super.dispose();
  }

  void send() {
    final text = draftController.text.trim();
    if (text.isEmpty) return;
    setState(() {
      messages.add(text);
      draftController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Messages')),
      body: Column(children: [
        Expanded(
            child: ListView.builder(
                padding: const EdgeInsets.all(20),
                itemCount: messages.length,
                itemBuilder: (context, index) {
                  final mine = index.isEven;
                  return Align(
                      alignment:
                          mine ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(13),
                          constraints: const BoxConstraints(maxWidth: 320),
                          decoration: BoxDecoration(
                              color: mine
                                  ? const Color(0xff587363)
                                  : const Color(0xffebe8de),
                              borderRadius: BorderRadius.circular(12)),
                          child: Text(messages[index],
                              style: TextStyle(
                                  color: mine
                                      ? Colors.white
                                      : const Color(0xff252522),
                                  height: 1.4))));
                })),
        SafeArea(
            child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
                child: Row(children: [
                  Expanded(
                      child: TextField(
                          controller: draftController,
                          decoration: const InputDecoration(
                              hintText: 'Write a message...',
                              border: OutlineInputBorder()))),
                  const SizedBox(width: 8),
                  IconButton.filled(
                      onPressed: send, icon: const Icon(Icons.send))
                ]))),
      ]),
    );
  }
}

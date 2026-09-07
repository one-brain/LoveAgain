import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../models/provider.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({required this.provider, super.key});

  final ProviderProfile provider;

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  double duration = 2;
  bool submitted = false;
  final requestController = TextEditingController();

  @override
  void dispose() {
    requestController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final total = widget.provider.rate * duration;
    return Scaffold(
      appBar: AppBar(title: const Text('Book a moment')),
      body: ListView(padding: const EdgeInsets.all(20), children: [
        ListTile(
            contentPadding: EdgeInsets.zero,
            leading: CircleAvatar(
                backgroundColor: const Color(0xffe8b4a5),
                child: Text(widget.provider.initials)),
            title: Text(widget.provider.name,
                style: const TextStyle(fontWeight: FontWeight.w700)),
            subtitle: Text(widget.provider.role)),
        const SizedBox(height: 24),
        Text('Plan the hour',
            style: Theme.of(context)
                .textTheme
                .headlineSmall
                ?.copyWith(fontWeight: FontWeight.w700)),
        const SizedBox(height: 18),
        Text('Duration: ${duration.toStringAsFixed(1)} hours'),
        Slider(
            value: duration,
            min: 1,
            max: 6,
            divisions: 10,
            label: duration.toStringAsFixed(1),
            onChanged: (value) => setState(() => duration = value)),
        const SizedBox(height: 12),
        TextField(
            controller: requestController,
            maxLines: 4,
            decoration: const InputDecoration(
                labelText: 'Special requests',
                hintText:
                    'Anything that would make this moment feel more like you?',
                border: OutlineInputBorder())),
        const SizedBox(height: 24),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Text('Estimated total'),
          Text('\$${total.toStringAsFixed(0)}',
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 22))
        ]),
        const SizedBox(height: 18),
        FilledButton.icon(
            onPressed:
                submitted ? null : () => setState(() => submitted = true),
            icon: Icon(submitted ? Icons.check : Icons.arrow_forward),
            label: Text(submitted ? 'Request sent' : 'Request this moment')),
        if (submitted) ...[
          const SizedBox(height: 12),
          Text(
              'Your request is ready. You can continue the conversation before payment.',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.black54)),
          TextButton(
              onPressed: () => context.go('/'),
              child: const Text('Back to discovery'))
        ],
      ]),
    );
  }
}

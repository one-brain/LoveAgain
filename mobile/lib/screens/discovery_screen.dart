import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/provider.dart';

class DiscoveryScreen extends StatefulWidget {
  const DiscoveryScreen({super.key});

  @override
  State<DiscoveryScreen> createState() => _DiscoveryScreenState();
}

class _DiscoveryScreenState extends State<DiscoveryScreen> {
  String query = '';

  @override
  Widget build(BuildContext context) {
    final visibleProviders = providers.where((provider) {
      final searchable =
          '${provider.name} ${provider.role} ${provider.city} ${provider.specialties.join(' ')}'
              .toLowerCase();
      return searchable.contains(query.toLowerCase());
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cue', style: TextStyle(fontWeight: FontWeight.w700)),
        actions: [
          IconButton(
              onPressed: () => context.push('/messages'),
              icon: const Icon(Icons.chat_bubble_outline)),
          IconButton(
              onPressed: () => context.push('/login'),
              icon: const Icon(Icons.person_outline))
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
        children: [
          Text('FIND GOOD COMPANY',
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  letterSpacing: 1.4,
                  color: const Color(0xff587363),
                  fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),
          Text('A better hour\nstarts here.',
              style: Theme.of(context)
                  .textTheme
                  .displaySmall
                  ?.copyWith(fontWeight: FontWeight.w700, height: .98)),
          const SizedBox(height: 14),
          Text(
              'Thoughtful companions for events, hobbies, and the ordinary moments worth sharing.',
              style: Theme.of(context)
                  .textTheme
                  .bodyLarge
                  ?.copyWith(color: Colors.black54, height: 1.45)),
          const SizedBox(height: 24),
          TextField(
            onChanged: (value) => setState(() => query = value),
            decoration: InputDecoration(
                hintText: 'Search by moment or name',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: const Color(0xfffffdf9),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(6),
                    borderSide: BorderSide.none)),
          ),
          const SizedBox(height: 28),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('Near you',
                style: Theme.of(context)
                    .textTheme
                    .headlineSmall
                    ?.copyWith(fontWeight: FontWeight.w700)),
            Text('${visibleProviders.length} available',
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(color: Colors.black54))
          ]),
          const SizedBox(height: 14),
          ...visibleProviders
              .map((provider) => _ProviderCard(provider: provider)),
        ],
      ),
    );
  }
}

class _ProviderCard extends StatelessWidget {
  const _ProviderCard({required this.provider});

  final ProviderProfile provider;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      elevation: 0,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: const BorderSide(color: Color(0xffdfdcd3))),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            CircleAvatar(
                radius: 27,
                backgroundColor: const Color(0xffe8b4a5),
                child: Text(provider.initials,
                    style: const TextStyle(
                        color: Color(0xff252522),
                        fontWeight: FontWeight.w600))),
            const SizedBox(width: 12),
            Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text(provider.name,
                      style: const TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 3),
                  Text('${provider.role} · ${provider.city}',
                      style:
                          const TextStyle(color: Colors.black54, fontSize: 12))
                ])),
            Text('\$${provider.rate}/h',
                style: const TextStyle(fontWeight: FontWeight.w700)),
          ]),
          const SizedBox(height: 14),
          Wrap(
              spacing: 6,
              children: provider.specialties
                  .map((specialty) => Chip(
                      label: Text(specialty),
                      visualDensity: VisualDensity.compact,
                      backgroundColor: const Color(0xffedf1eb),
                      side: BorderSide.none))
                  .toList()),
          const SizedBox(height: 8),
          Row(children: [
            const Icon(Icons.star, size: 15, color: Color(0xffb37e36)),
            const SizedBox(width: 4),
            Text('${provider.rating} rating',
                style: const TextStyle(fontSize: 12, color: Colors.black54)),
            const Spacer(),
            FilledButton(
                onPressed: () => context.push('/book', extra: provider),
                child: const Text('Book a moment'))
          ]),
        ]),
      ),
    );
  }
}

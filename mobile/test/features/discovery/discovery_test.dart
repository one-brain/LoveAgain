import 'package:flutter_test/flutter_test.dart';
import 'package:cue_mobile/core/api_client.dart';
import 'package:cue_mobile/data/repositories/discovery_repository.dart';

void main() {
  group('DiscoveryRepository Tests', () {
    late DiscoveryRepository repo;

    setUp(() {
      repo = DiscoveryRepository(ApiClient());
    });

    test('retrieves default catalog of providers', () async {
      final providers = await repo.getProviders();
      expect(providers.isNotEmpty, true);
      expect(providers.length, greaterThanOrEqualTo(5));
    });

    test('filters providers by query text', () async {
      final providers = await repo.getProviders(query: 'Museum');
      expect(providers.length, greaterThanOrEqualTo(1));
      expect(providers.first.name, 'Maya Rodriguez');
    });

    test('filters providers by specialty', () async {
      final providers = await repo.getProviders(specialty: 'Language Exchange');
      expect(providers.length, greaterThanOrEqualTo(1));
      expect(providers.first.name, 'Jonah Kim');
    });

    test('sorts providers by price ascending', () async {
      final providers = await repo.getProviders(sortBy: 'price_low');
      expect(providers.length, greaterThanOrEqualTo(2));
      for (var i = 0; i < providers.length - 1; i++) {
        expect(providers[i].rate, lessThanOrEqualTo(providers[i + 1].rate));
      }
    });

    test('sorts providers by price descending', () async {
      final providers = await repo.getProviders(sortBy: 'price_high');
      expect(providers.length, greaterThanOrEqualTo(2));
      for (var i = 0; i < providers.length - 1; i++) {
        expect(providers[i].rate, greaterThanOrEqualTo(providers[i + 1].rate));
      }
    });
  });
}


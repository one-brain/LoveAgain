import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:cue_mobile/core/api_client.dart';
import 'package:cue_mobile/data/repositories/discovery_repository.dart';
import 'package:cue_mobile/models/provider.dart';
import '../../fixtures/seed_data.dart';

class FakeDiscoveryApiClient extends ApiClient {
  FakeDiscoveryApiClient() : super(dio: Dio());

  @override
  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters}) async {
    if (path.contains('/discovery/providers')) {
      var list = List<ProviderProfile>.from(SeedData.seedProviders);
      final q = queryParameters?['q']?.toString().toLowerCase();
      if (q != null && q.isNotEmpty) {
        list = list.where((p) =>
          p.name.toLowerCase().contains(q) ||
          p.role.toLowerCase().contains(q) ||
          p.bio.toLowerCase().contains(q) ||
          p.specialties.any((s) => s.toLowerCase().contains(q))).toList();
      }
      final specialty = queryParameters?['specialty']?.toString().toLowerCase();
      if (specialty != null && specialty != 'all') {
        list = list.where((p) =>
          p.specialties.any((s) => s.toLowerCase().contains(specialty)) ||
          p.role.toLowerCase().contains(specialty) ||
          p.bio.toLowerCase().contains(specialty)).toList();
      }
      final sortBy = queryParameters?['sortBy']?.toString();
      if (sortBy == 'price_low') {
        list.sort((a, b) => a.rate.compareTo(b.rate));
      } else if (sortBy == 'price_high') {
        list.sort((a, b) => b.rate.compareTo(a.rate));
      }

      final jsonItems = list.map((p) => {
        'providerId': p.id,
        'displayName': p.name,
        'photoUrl': p.photoUrl,
        'hourlyRate': p.rate,
        'bio': p.bio,
        'specialties': p.specialties,
        'averageRating': p.rating,
        'isVerified': p.isVerified,
        'trustScore': p.trustScore,
        'city': p.city,
      }).toList();

      return Response<T>(
        data: {'items': jsonItems, 'totalCount': jsonItems.length} as T,
        statusCode: 200,
        requestOptions: RequestOptions(path: path),
      );
    }

    return Response<T>(
      data: null as T,
      statusCode: 404,
      requestOptions: RequestOptions(path: path),
    );
  }
}

void main() {
  group('DiscoveryRepository Tests', () {
    late DiscoveryRepository repo;

    setUp(() {
      repo = DiscoveryRepository(FakeDiscoveryApiClient());
    });

    test('retrieves default catalog of providers', () async {
      final providers = await repo.getProviders();
      expect(providers.isNotEmpty, true);
      expect(providers.length, greaterThanOrEqualTo(5));
    });

    test('filters providers by query text', () async {
      final providers = await repo.getProviders(query: 'Gallery');
      expect(providers.length, greaterThanOrEqualTo(1));
      expect(providers.first.name, 'Ananya Sen');
    });

    test('filters providers by specialty', () async {
      final providers = await repo.getProviders(specialty: 'Literature');
      expect(providers.length, greaterThanOrEqualTo(1));
      expect(providers.any((p) => p.name == 'Kabir Varma' || p.name == 'Meera Nambiar'), true);
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

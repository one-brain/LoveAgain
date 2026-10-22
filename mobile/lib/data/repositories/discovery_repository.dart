import '../../core/api_client.dart';
import '../../models/provider.dart';
import '../mock_data.dart';

class DiscoveryRepository {
  DiscoveryRepository(this._api);

  final ApiClient _api;

  Future<List<ProviderProfile>> getProviders({
    String? query,
    String? specialty,
    double? minRate,
    double? maxRate,
    String? sortBy,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (query != null && query.isNotEmpty) queryParams['q'] = query;
      if (specialty != null && specialty != 'All') queryParams['specialty'] = specialty;
      if (minRate != null) queryParams['minRate'] = minRate;
      if (maxRate != null) queryParams['maxRate'] = maxRate;
      if (sortBy != null) queryParams['sortBy'] = sortBy;

      final response = await _api.get<dynamic>(
        '/discovery/providers',
        queryParameters: queryParams,
      );

      if (response.data is List) {
        final list = (response.data as List)
            .map((e) => ProviderProfile.fromJson(e as Map<String, dynamic>))
            .toList();
        if (list.isNotEmpty) return list;
      }
    } catch (_) {
      // Fallback to local catalog
    }

    // Filter local mock providers
    var results = List<ProviderProfile>.from(MockData.seedProviders);

    if (query != null && query.trim().isNotEmpty) {
      final q = query.toLowerCase();
      results = results.where((p) {
        final text = '${p.name} ${p.role} ${p.city} ${p.bio} ${p.specialties.join(' ')}'.toLowerCase();
        return text.contains(q);
      }).toList();
    }

    if (specialty != null && specialty != 'All') {
      results = results.where((p) {
        return p.specialties.any((s) => s.toLowerCase().contains(specialty.toLowerCase())) ||
            p.role.toLowerCase().contains(specialty.toLowerCase());
      }).toList();
    }

    if (maxRate != null) {
      results = results.where((p) => p.rate <= maxRate).toList();
    }

    if (sortBy == 'price_low') {
      results.sort((a, b) => a.rate.compareTo(b.rate));
    } else if (sortBy == 'price_high') {
      results.sort((a, b) => b.rate.compareTo(a.rate));
    } else if (sortBy == 'rating') {
      results.sort((a, b) => b.rating.compareTo(a.rating));
    } else if (sortBy == 'trust') {
      results.sort((a, b) => b.trustScore.compareTo(a.trustScore));
    }

    return results;
  }

  Future<ProviderProfile?> getProviderById(String id) async {
    try {
      final response = await _api.get<Map<String, dynamic>>('/discovery/providers/$id');
      if (response.data != null) {
        return ProviderProfile.fromJson(response.data!);
      }
    } catch (_) {
      // Fallback
    }

    return MockData.seedProviders.firstWhere(
      (p) => p.id == id,
      orElse: () => MockData.seedProviders.first,
    );
  }
}


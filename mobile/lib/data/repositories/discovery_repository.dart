import '../../core/api_client.dart';
import '../../models/provider.dart';

class DiscoveryRepository {
  DiscoveryRepository(this._api);

  final ApiClient _api;

  Future<List<ProviderProfile>> getProviders({
    String? query,
    String? specialty,
    double? minRate,
    double? maxRate,
    String? sortBy,
    String? city,
  }) async {
    final queryParams = <String, dynamic>{'pageSize': 50};
    if (query != null && query.isNotEmpty) queryParams['q'] = query;
    if (specialty != null && specialty != 'All') queryParams['specialty'] = specialty;
    if (minRate != null) queryParams['minRate'] = minRate;
    if (maxRate != null) queryParams['maxRate'] = maxRate;
    if (sortBy != null) queryParams['sortBy'] = sortBy;
    if (city != null && city.isNotEmpty) queryParams['city'] = city;

    final response = await _api.get<dynamic>(
      '/discovery/providers',
      queryParameters: queryParams,
    );

    final data = response.data;
    List<dynamic>? items;
    if (data is Map && data['items'] is List) {
      items = data['items'] as List<dynamic>;
    } else if (data is List) {
      items = data;
    }

    if (items != null) {
      return items
          .map((e) => ProviderProfile.fromJson(e as Map<String, dynamic>))
          .toList();
    }

    return const [];
  }

  Future<ProviderProfile?> getProviderById(String id) async {
    final response = await _api.get<Map<String, dynamic>>('/discovery/providers/$id');
    if (response.data != null) {
      return ProviderProfile.fromJson(response.data!);
    }
    return null;
  }
}

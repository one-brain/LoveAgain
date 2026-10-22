import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/discovery_repository.dart';
import '../../models/provider.dart';
import '../auth/auth_controller.dart';

final discoveryRepositoryProvider = Provider<DiscoveryRepository>(
  (ref) => DiscoveryRepository(ref.read(apiClientProvider)),
);

class DiscoveryFilter {
  const DiscoveryFilter({
    this.query = '',
    this.specialty = 'All',
    this.sortBy = 'recommended',
    this.maxRate,
  });

  final String query;
  final String specialty;
  final String sortBy;
  final double? maxRate;

  DiscoveryFilter copyWith({
    String? query,
    String? specialty,
    String? sortBy,
    double? maxRate,
  }) {
    return DiscoveryFilter(
      query: query ?? this.query,
      specialty: specialty ?? this.specialty,
      sortBy: sortBy ?? this.sortBy,
      maxRate: maxRate ?? this.maxRate,
    );
  }
}

final discoveryFilterProvider = StateProvider<DiscoveryFilter>(
  (ref) => const DiscoveryFilter(),
);

final discoveryProvidersProvider = FutureProvider<List<ProviderProfile>>((ref) async {
  final repo = ref.read(discoveryRepositoryProvider);
  final filter = ref.watch(discoveryFilterProvider);

  return repo.getProviders(
    query: filter.query,
    specialty: filter.specialty,
    sortBy: filter.sortBy,
    maxRate: filter.maxRate,
  );
});


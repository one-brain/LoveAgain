import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';
import '../../core/widgets/cue_brand_logo.dart';
import '../../models/provider.dart';
import '../widgets/rating_stars.dart';
import '../widgets/trust_score_badge.dart';
import '../widgets/verified_badge.dart';
import 'discovery_controller.dart';

class DiscoveryScreen extends ConsumerStatefulWidget {
  const DiscoveryScreen({super.key});

  @override
  ConsumerState<DiscoveryScreen> createState() => _DiscoveryScreenState();
}

class _DiscoveryScreenState extends ConsumerState<DiscoveryScreen> {
  final _searchController = TextEditingController();

  final List<String> _categories = const [
    'All',
    'Coffee Dates',
    'Restaurant Visits',
    'Shopping',
    'Movies & Cinema',
    'Weekend Activities',
    'Special Events',
    'Art & Culture',
    'Outdoor & Fitness',
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filter = ref.watch(discoveryFilterProvider);
    final providersAsync = ref.watch(discoveryProvidersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const CueBrandLogo(subtitle: 'Companion'),
        actions: [
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline),
            tooltip: 'Messages',
            onPressed: () => context.push('/messages'),
          ),
        ],
      ),
      body: CustomScrollView(
        slivers: [
          // Hero & Tagline
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                FluentSpacing.l,
                FluentSpacing.l,
                FluentSpacing.l,
                FluentSpacing.m,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: FluentSpacing.s,
                      vertical: FluentSpacing.xxs,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.goldLight,
                      borderRadius: BorderRadius.circular(FluentRadius.medium),
                      border: Border.all(color: AppColors.goldBorder),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.verified_user_rounded,
                          size: 13,
                          color: AppColors.gold,
                        ),
                        const SizedBox(width: FluentSpacing.xs),
                        Text(
                          'Curated companionship',
                          style: FluentType.caption2.copyWith(
                            color: AppColors.gold,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: FluentSpacing.s),
                  Text(
                    'A better hour\nstarts here.',
                    style: FluentType.title1.copyWith(
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: FluentSpacing.s),
                  Text(
                    'Vetted companions for exhibitions, dinners, language exchange, and everyday moments.',
                    style: FluentType.body2.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: FluentSpacing.l),
                  // Search Field
                  TextField(
                    controller: _searchController,
                    onChanged: (val) {
                      ref
                          .read(discoveryFilterProvider.notifier)
                          .update((s) => s.copyWith(query: val));
                    },
                    decoration: InputDecoration(
                      hintText: 'Search by companion, activity, or city...',
                      prefixIcon: const Icon(
                        Icons.search,
                        color: AppColors.textSecondary,
                      ),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                                icon: const Icon(Icons.clear, size: 18),
                                onPressed: () {
                                  _searchController.clear();
                                  ref
                                      .read(discoveryFilterProvider.notifier)
                                      .update((s) => s.copyWith(query: ''));
                                },
                              )
                          : null,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Categories Horizontal Chips
          SliverToBoxAdapter(
            child: SizedBox(
              height: 44,
              child: ListView.separated(
                padding:
                    const EdgeInsets.symmetric(horizontal: FluentSpacing.l),
                scrollDirection: Axis.horizontal,
                itemCount: _categories.length,
                separatorBuilder: (context, index) =>
                    const SizedBox(width: FluentSpacing.s),
                itemBuilder: (context, index) {
                  final cat = _categories[index];
                  final isSelected = filter.specialty == cat;
                  return ChoiceChip(
                    label: Text(cat),
                    selected: isSelected,
                    selectedColor: AppColors.primaryLight,
                    backgroundColor: AppColors.surface,
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(FluentRadius.circular),
                    ),
                    labelStyle: (isSelected
                            ? FluentType.caption1Strong
                            : FluentType.caption1)
                        .copyWith(
                      color: isSelected
                          ? AppColors.brandForeground
                          : AppColors.textPrimary,
                    ),
                    side: BorderSide(
                      color:
                          isSelected ? AppColors.brandStroke : AppColors.border,
                    ),
                    onSelected: (selected) {
                      ref.read(discoveryFilterProvider.notifier).update(
                            (s) =>
                                s.copyWith(specialty: selected ? cat : 'All'),
                          );
                    },
                  );
                },
              ),
            ),
          ),

          // Section Header (Results Count & Sort)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                FluentSpacing.l,
                FluentSpacing.xl,
                FluentSpacing.l,
                FluentSpacing.mNudge,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  providersAsync.when(
                    data: (list) => Text(
                      'Available companions (${list.length})',
                      style:
                          FluentType.numeric(FluentType.body1Strong).copyWith(
                        color: AppColors.textPrimary,
                      ),
                    ),
                    loading: () => Text(
                      'Finding companions...',
                      style: FluentType.body1Strong.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    error: (_, __) => Text(
                      'Companions',
                      style: FluentType.body1Strong.copyWith(
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  PopupMenuButton<String>(
                    initialValue: filter.sortBy,
                    tooltip: 'Sort by',
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: FluentSpacing.mNudge,
                        vertical: FluentSpacing.sNudge,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(FluentRadius.large),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.sort,
                            size: 16,
                            color: AppColors.textSecondary,
                          ),
                          const SizedBox(width: FluentSpacing.xs),
                          Text(
                            'Sort',
                            style: FluentType.caption1Strong.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    onSelected: (sortBy) {
                      ref
                          .read(discoveryFilterProvider.notifier)
                          .update((s) => s.copyWith(sortBy: sortBy));
                    },
                    itemBuilder: (context) => const [
                      PopupMenuItem(
                        value: 'recommended',
                        child: Text('Recommended'),
                      ),
                      PopupMenuItem(
                        value: 'rating',
                        child: Text('Highest rated'),
                      ),
                      PopupMenuItem(
                        value: 'trust',
                        child: Text('Highest trust score'),
                      ),
                      PopupMenuItem(
                        value: 'price_low',
                        child: Text('Price: low to high'),
                      ),
                      PopupMenuItem(
                        value: 'price_high',
                        child: Text('Price: high to low'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Providers List
          providersAsync.when(
            data: (list) {
              if (list.isEmpty) {
                return SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.all(FluentSpacing.l),
                    padding: const EdgeInsets.all(FluentSpacing.xxl),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      children: [
                        const Icon(
                          Icons.search_off_rounded,
                          size: 44,
                          color: AppColors.textMuted,
                        ),
                        const SizedBox(height: FluentSpacing.m),
                        Text(
                          'No companions found',
                          style: FluentType.body1Strong.copyWith(
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: FluentSpacing.sNudge),
                        Text(
                          'Try clearing search filters or selecting another category.',
                          textAlign: TextAlign.center,
                          style: FluentType.caption1.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: FluentSpacing.l),
                        OutlinedButton(
                          onPressed: () {
                            _searchController.clear();
                            ref
                                .read(discoveryFilterProvider.notifier)
                                .update((_) => const DiscoveryFilter());
                          },
                          child: const Text('Reset filters'),
                        ),
                      ],
                    ),
                  ),
                );
              }

              return SliverPadding(
                padding: const EdgeInsets.fromLTRB(
                  FluentSpacing.l,
                  0,
                  FluentSpacing.l,
                  FluentSpacing.xxl,
                ),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final provider = list[index];
                      return ProviderCard(provider: provider);
                    },
                    childCount: list.length,
                  ),
                ),
              );
            },
            loading: () => const SliverFillRemaining(
              child: Center(
                child: CircularProgressIndicator(),
              ),
            ),
            error: (err, _) => SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.all(FluentSpacing.l),
                padding: const EdgeInsets.all(FluentSpacing.xxl),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    const Icon(
                      Icons.wifi_off_rounded,
                      size: 44,
                      color: AppColors.dangerForeground,
                    ),
                    const SizedBox(height: FluentSpacing.m),
                    Text(
                      'Connection to Cue services unavailable',
                      style: FluentType.body1Strong.copyWith(
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: FluentSpacing.sNudge),
                    Text(
                      'Unable to retrieve live companion catalog. Check your network or gateway connection.',
                      textAlign: TextAlign.center,
                      style: FluentType.caption1.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: FluentSpacing.l),
                    FilledButton.icon(
                      onPressed: () => ref.refresh(discoveryProvidersProvider),
                      icon: const Icon(Icons.refresh, size: 18),
                      label: const Text('Retry connection'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class ProviderCard extends StatelessWidget {
  const ProviderCard({required this.provider, super.key});

  final ProviderProfile provider;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: FluentSpacing.m),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(FluentRadius.xLarge),
        border: Border.all(color: AppColors.border),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(FluentRadius.xLarge),
        onTap: () {
          context.push('/provider/${provider.id}', extra: provider);
        },
        child: Padding(
          padding: const EdgeInsets.all(FluentSpacing.l),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Row: Avatar, Info, Rate
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(
                    radius: 26,
                    backgroundColor: AppColors.primaryLight,
                    child: Text(
                      provider.initials,
                      style: FluentType.body1Strong.copyWith(
                        color: AppColors.brandForeground,
                      ),
                    ),
                  ),
                  const SizedBox(width: FluentSpacing.m),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                provider.name,
                                style: FluentType.body1Strong.copyWith(
                                  color: AppColors.textPrimary,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (provider.isVerified) ...[
                              const SizedBox(width: FluentSpacing.sNudge),
                              const VerifiedBadge(size: 14),
                            ],
                          ],
                        ),
                        const SizedBox(height: FluentSpacing.xxs),
                        Text(
                          provider.role,
                          style: FluentType.caption1Strong.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: FluentSpacing.xs),
                        Row(
                          children: [
                            const Icon(
                              Icons.location_on_outlined,
                              size: 13,
                              color: AppColors.textMuted,
                            ),
                            const SizedBox(width: FluentSpacing.xxs),
                            Text(
                              provider.city,
                              style: FluentType.caption2.copyWith(
                                color: AppColors.textMuted,
                              ),
                            ),
                            if (provider.distanceKm != null) ...[
                              const SizedBox(width: FluentSpacing.sNudge),
                              Text(
                                '• ${provider.distanceKm!.toStringAsFixed(1)} km',
                                style: FluentType.numeric(FluentType.caption2)
                                    .copyWith(color: AppColors.textMuted),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '₹${provider.rate}',
                        style: FluentType.numeric(FluentType.title3).copyWith(
                          color: AppColors.brandForeground,
                        ),
                      ),
                      Text(
                        '/ hour',
                        style: FluentType.caption2.copyWith(
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: FluentSpacing.m),

              // Specialties Chips
              Wrap(
                spacing: FluentSpacing.sNudge,
                runSpacing: FluentSpacing.sNudge,
                children: provider.specialties.take(3).map((spec) {
                  return Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: FluentSpacing.s,
                      vertical: FluentSpacing.xs,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceMuted,
                      borderRadius: BorderRadius.circular(FluentRadius.medium),
                      border: Border.all(color: AppColors.borderSubtle),
                    ),
                    child: Text(
                      spec,
                      style: FluentType.caption2.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: FluentSpacing.m),
              const Divider(height: 1, color: AppColors.border),
              const SizedBox(height: FluentSpacing.m),

              // Bottom Row: Rating, Trust score, and Book button
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      RatingStars(
                        rating: provider.rating,
                        reviewCount: provider.reviewCount,
                        size: 15,
                      ),
                      const SizedBox(width: FluentSpacing.mNudge),
                      TrustScoreBadge(
                          score: provider.trustScore, compact: true),
                    ],
                  ),
                  Row(
                    children: [
                      OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: FluentSpacing.m,
                            vertical: FluentSpacing.s,
                          ),
                          minimumSize: const Size(44, 36),
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        onPressed: () {
                          context.push(
                            '/provider/${provider.id}',
                            extra: provider,
                          );
                        },
                        child: Text(
                          'View',
                          style: FluentType.caption1Strong.copyWith(
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ),
                      const SizedBox(width: FluentSpacing.s),
                      FilledButton(
                        style: FilledButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: FluentSpacing.l,
                            vertical: FluentSpacing.s,
                          ),
                          minimumSize: const Size(44, 36),
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        onPressed: () {
                          context.push('/book', extra: provider);
                        },
                        child: Text(
                          'Book',
                          style: FluentType.caption1Strong.copyWith(
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

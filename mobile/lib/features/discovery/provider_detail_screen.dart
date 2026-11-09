import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../models/provider.dart';
import '../widgets/rating_stars.dart';
import '../widgets/trust_score_badge.dart';
import '../widgets/verified_badge.dart';

class ProviderDetailScreen extends StatefulWidget {
  const ProviderDetailScreen({required this.provider, super.key});

  final ProviderProfile provider;

  @override
  State<ProviderDetailScreen> createState() => _ProviderDetailScreenState();
}

class _ProviderDetailScreenState extends State<ProviderDetailScreen> {
  AvailabilitySlot? _selectedSlot;

  @override
  Widget build(BuildContext context) {
    final p = widget.provider;

    return Scaffold(
      appBar: AppBar(
        title: Text(p.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Shared profile for ${p.name}')),
              );
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
          FluentSpacing.l,
          FluentSpacing.m,
          FluentSpacing.l,
          100,
        ),
        children: [
          // Profile Header Card
          Container(
            padding: const EdgeInsets.all(FluentSpacing.xl),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(FluentRadius.xLarge),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 44,
                  backgroundColor: AppColors.primaryLight,
                  child: Text(
                    p.initials,
                    style: FluentType.title1.copyWith(
                      color: AppColors.brandForeground,
                    ),
                  ),
                ),
                const SizedBox(height: FluentSpacing.m),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      p.name,
                      style: FluentType.title2.copyWith(
                        color: AppColors.textPrimary,
                      ),
                    ),
                    if (p.isVerified) ...[
                      const SizedBox(width: FluentSpacing.sNudge),
                      const VerifiedBadge(size: 16),
                    ],
                  ],
                ),
                const SizedBox(height: FluentSpacing.xs),
                Text(
                  p.role,
                  style: FluentType.body2Strong.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: FluentSpacing.sNudge),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.location_on_outlined,
                      size: 15,
                      color: AppColors.textMuted,
                    ),
                    const SizedBox(width: FluentSpacing.xxs),
                    Text(
                      p.city,
                      style: FluentType.caption1.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    if (p.distanceKm != null) ...[
                      const SizedBox(width: FluentSpacing.s),
                      Text(
                        '(${p.distanceKm!.toStringAsFixed(1)} km away)',
                        style: FluentType.numeric(FluentType.caption1).copyWith(
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: FluentSpacing.l),
                const Divider(height: 1, color: AppColors.border),
                const SizedBox(height: FluentSpacing.m),
                // Badges & Metrics Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    Column(
                      children: [
                        RatingStars(rating: p.rating, size: 16),
                        const SizedBox(height: FluentSpacing.xxs),
                        Text(
                          '${p.reviewCount} reviews',
                          style: FluentType.numeric(FluentType.caption2).copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    Container(width: 1, height: 28, color: AppColors.border),
                    TrustScoreBadge(score: p.trustScore),
                    Container(width: 1, height: 28, color: AppColors.border),
                    Column(
                      children: [
                        Text(
                          '₹${p.rate}/hr',
                          style: FluentType.numeric(FluentType.body1Strong)
                              .copyWith(color: AppColors.brandForeground),
                        ),
                        const SizedBox(height: FluentSpacing.xxs),
                        Text(
                          'Hourly rate',
                          style: FluentType.caption2.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: FluentSpacing.xl),

          // About Section
          Text(
            'About',
            style: FluentType.body1Strong.copyWith(
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: FluentSpacing.s),
          Container(
            padding: const EdgeInsets.all(FluentSpacing.l),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(FluentRadius.xLarge),
              border: Border.all(color: AppColors.border),
            ),
            child: Text(
              p.bio.isNotEmpty
                  ? p.bio
                  : 'Experienced companion ready to accompany you for cultural events, conversation, and memorable shared moments.',
              style: FluentType.body2.copyWith(color: AppColors.textPrimary),
            ),
          ),
          const SizedBox(height: FluentSpacing.xl),

          // Specialties Section
          Text(
            'Specialties & activities',
            style: FluentType.body1Strong.copyWith(
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: FluentSpacing.mNudge),
          Wrap(
            spacing: FluentSpacing.s,
            runSpacing: FluentSpacing.s,
            children: p.specialties.map((specialty) {
              return Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: FluentSpacing.m,
                  vertical: FluentSpacing.sNudge,
                ),
                decoration: BoxDecoration(
                  color: AppColors.surfaceMuted,
                  borderRadius: BorderRadius.circular(FluentRadius.circular),
                  border: Border.all(color: AppColors.border),
                ),
                child: Text(
                  specialty,
                  style: FluentType.caption1Strong.copyWith(
                    color: AppColors.textPrimary,
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: FluentSpacing.xxl),

          // Available Slots Section
          if (p.upcomingSlots.isNotEmpty) ...[
            Text(
              'Upcoming availability',
              style: FluentType.body1Strong.copyWith(
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: FluentSpacing.xs),
            Text(
              'Select a preferred slot to pre-fill your booking request:',
              style: FluentType.caption1.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: FluentSpacing.mNudge),
            Wrap(
              spacing: FluentSpacing.s,
              runSpacing: FluentSpacing.s,
              children: p.upcomingSlots.map((slot) {
                final isSelected = _selectedSlot?.id == slot.id;
                final dateStr = DateFormat('EEE, MMM d • h:mm a')
                    .format(slot.startTime);
                return ChoiceChip(
                  label: Text(dateStr),
                  selected: isSelected,
                  selectedColor: AppColors.primaryLight,
                  labelStyle: FluentType.numeric(
                    isSelected ? FluentType.caption1Strong : FluentType.caption1,
                  ).copyWith(
                    color: isSelected
                        ? AppColors.brandForeground
                        : AppColors.textPrimary,
                  ),
                  onSelected: (selected) {
                    setState(() {
                      _selectedSlot = selected ? slot : null;
                    });
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: FluentSpacing.xxl),
          ],

          // Trust & Safety Highlight
          Container(
            padding: const EdgeInsets.all(FluentSpacing.l),
            decoration: BoxDecoration(
              color: AppColors.goldLight,
              borderRadius: BorderRadius.circular(FluentRadius.xLarge),
              border: Border.all(color: AppColors.goldBorder),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.verified_user_rounded,
                  color: AppColors.gold,
                  size: 24,
                ),
                const SizedBox(width: FluentSpacing.m),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Verified Cue companion',
                        style: FluentType.body2Strong.copyWith(
                          color: AppColors.gold,
                        ),
                      ),
                      const SizedBox(height: FluentSpacing.xxs),
                      Text(
                        'Government ID checked. In-person rating threshold maintained above 4.7 stars.',
                        style: FluentType.caption1.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: FluentSpacing.xxl),

          // Reviews Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Reviews & feedback',
                style: FluentType.body1Strong.copyWith(
                  color: AppColors.textPrimary,
                ),
              ),
              Text(
                '${p.reviews.length} shown',
                style: FluentType.numeric(FluentType.caption1).copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: FluentSpacing.m),
          if (p.reviews.isEmpty)
            Container(
              padding: const EdgeInsets.all(FluentSpacing.l),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                border: Border.all(color: AppColors.border),
              ),
              child: Text(
                'No public reviews yet. Be the first to book and share your experience!',
                style: FluentType.caption1.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            )
          else
            ...p.reviews.map((rev) => _ReviewTile(review: rev)),
        ],
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: FluentSpacing.l,
          vertical: FluentSpacing.m,
        ),
        decoration: BoxDecoration(
          color: AppColors.surface,
          boxShadow: FluentShadows.shadow4,
          border: const Border(top: BorderSide(color: AppColors.border)),
        ),
        child: SafeArea(
          child: Row(
            children: [
              Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Price',
                    style: FluentType.caption2.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  Text(
                    '₹${p.rate} / hr',
                    style: FluentType.numeric(FluentType.title3).copyWith(
                      color: AppColors.brandForeground,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: FluentSpacing.xxl),
              Expanded(
                child: FilledButton.icon(
                  onPressed: () {
                    context.push(
                      '/book',
                      extra: {
                        'provider': p,
                        'initialSlot': _selectedSlot,
                      },
                    );
                  },
                  icon: const Icon(Icons.calendar_month),
                  label: const Text('Book Outing'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ReviewTile extends StatelessWidget {
  const _ReviewTile({required this.review});

  final ProviderReview review;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: FluentSpacing.m),
      padding: const EdgeInsets.all(FluentSpacing.l),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(FluentRadius.xLarge),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                review.reviewerName,
                style: FluentType.body2Strong.copyWith(
                  color: AppColors.textPrimary,
                ),
              ),
              RatingStars(rating: review.rating, size: 14),
            ],
          ),
          const SizedBox(height: FluentSpacing.sNudge),
          Text(
            review.comment,
            style: FluentType.caption1.copyWith(color: AppColors.textPrimary),
          ),
        ],
      ),
    );
  }
}


import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';
import '../auth/auth_controller.dart';
import '../widgets/trust_score_badge.dart';
import '../widgets/verified_badge.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _isDiscoverable = true;

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);
    final user = auth.user;
    final isHost = user?.isHost == true || auth.isHostMode;

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Profile preferences updated')),
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
          40,
        ),
        children: [
          // User Card
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
                  radius: 36,
                  backgroundColor: AppColors.primaryLight,
                  child: Text(
                    user?.initials ?? 'AR',
                    style: FluentType.title1.copyWith(
                      color: AppColors.brandForeground,
                    ),
                  ),
                ),
                const SizedBox(height: FluentSpacing.m),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Flexible(
                      child: Text(
                        user?.fullName ?? 'Alex Rivera',
                        style: FluentType.title3.copyWith(
                          color: AppColors.textPrimary,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (user?.isVerified ?? true) ...[
                      const SizedBox(width: FluentSpacing.sNudge),
                      const VerifiedBadge(size: 16),
                    ],
                  ],
                ),
                const SizedBox(height: FluentSpacing.xs),
                Text(
                  user?.email ?? 'alex.rivera@example.com',
                  style: FluentType.caption1.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: FluentSpacing.xs),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.location_on_outlined,
                      size: 14,
                      color: AppColors.textMuted,
                    ),
                    const SizedBox(width: FluentSpacing.xxs),
                    Text(
                      user?.city ?? 'Bengaluru',
                      style: FluentType.caption2.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                if (user?.bio != null) ...[
                  const SizedBox(height: FluentSpacing.m),
                  Text(
                    user!.bio!,
                    textAlign: TextAlign.center,
                    style: FluentType.caption1.copyWith(
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: FluentSpacing.xl),

          // Host Dashboard summary (Visible for registered companions / hosts)
          if (isHost) ...[
            Container(
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
                      Expanded(
                        child: Text(
                          'Host earnings & ledger',
                          style: FluentType.body1Strong.copyWith(
                            color: AppColors.textPrimary,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: FluentSpacing.s),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: FluentSpacing.s,
                          vertical: FluentSpacing.xxs,
                        ),
                        decoration: BoxDecoration(
                          color: _isDiscoverable
                              ? AppColors.successBackground
                              : AppColors.surfaceMuted,
                          borderRadius: BorderRadius.circular(
                            FluentRadius.medium,
                          ),
                          border: Border.all(
                            color: _isDiscoverable
                                ? AppColors.success.withValues(alpha: 0.25)
                                : AppColors.border,
                          ),
                        ),
                        child: Text(
                          _isDiscoverable ? 'Discoverable' : 'Paused',
                          style: FluentType.caption2.copyWith(
                            fontWeight: FontWeight.w600,
                            color: _isDiscoverable
                                ? AppColors.successForeground
                                : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: FluentSpacing.l),
                  Row(
                    children: [
                      Expanded(
                        child: _buildMetricTile(
                          'Released escrow',
                          '₹32,400',
                          Icons.account_balance_wallet_outlined,
                          AppColors.brandForeground,
                        ),
                      ),
                      const SizedBox(width: FluentSpacing.m),
                      Expanded(
                        child: _buildMetricTile(
                          'Peer rating',
                          '4.95 ★',
                          Icons.star_outline_rounded,
                          AppColors.gold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: FluentSpacing.m),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          'Accept new outing requests',
                          style: FluentType.caption1.copyWith(
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ),
                      const SizedBox(width: FluentSpacing.s),
                      Switch(
                        value: _isDiscoverable,
                        onChanged: (val) {
                          setState(() => _isDiscoverable = val);
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: FluentSpacing.xl),
          ],

          // Trust Score & Reputation Card
          Container(
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
                    Expanded(
                      child: Row(
                        children: [
                          const Icon(
                            Icons.verified_user_rounded,
                            size: 20,
                            color: AppColors.gold,
                          ),
                          const SizedBox(width: FluentSpacing.s),
                          Flexible(
                            child: Text(
                              'Trust & Reputation',
                              style: FluentType.body1Strong.copyWith(
                                color: AppColors.textPrimary,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: FluentSpacing.s),
                    TrustScoreBadge(score: user?.trustScore ?? 96),
                  ],
                ),
                const SizedBox(height: FluentSpacing.m),
                Text(
                  'Your trust score reflects verified identity, completed dual-PIN verified outings, positive peer reviews, and punctuality.',
                  style: FluentType.caption1.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: FluentSpacing.m),
                const Divider(height: 1, color: AppColors.border),
                const SizedBox(height: FluentSpacing.m),
                // Recent trust events
                Text(
                  'Immutable trust events',
                  style: FluentType.caption2.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: FluentSpacing.s),
                _buildTrustEventRow(
                  '+10 pts',
                  'Aadhaar / Passport and phone verification completed',
                  'Oct 18, 2026',
                  true,
                ),
                const SizedBox(height: FluentSpacing.sNudge),
                _buildTrustEventRow(
                  '+5 pts',
                  '5-star completed NGMA museum companion outing',
                  'Oct 19, 2026',
                  true,
                ),
              ],
            ),
          ),
          const SizedBox(height: FluentSpacing.xl),

          // Menu Actions
          Container(
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(FluentRadius.xLarge),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(
                    Icons.verified_user_outlined,
                    color: AppColors.gold,
                  ),
                  title: const Text('Community Safety Guidelines'),
                  trailing: const Icon(
                    Icons.arrow_forward_ios,
                    size: 14,
                    color: AppColors.textMuted,
                  ),
                  onTap: () => _showSafetyGuidelines(context),
                ),
                const Divider(height: 1, indent: 56, color: AppColors.border),
                ListTile(
                  leading: const Icon(
                    Icons.help_outline,
                    color: AppColors.brandForeground,
                  ),
                  title: const Text('Support & Help Desk'),
                  trailing: const Icon(
                    Icons.arrow_forward_ios,
                    size: 14,
                    color: AppColors.textMuted,
                  ),
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Support ticket system ready at port 5010'),
                      ),
                    );
                  },
                ),
                const Divider(height: 1, indent: 56, color: AppColors.border),
                ListTile(
                  leading: const Icon(
                    Icons.logout,
                    color: AppColors.statusCancelled,
                  ),
                  title: Text(
                    'Sign Out',
                    style: FluentType.body1.copyWith(
                      color: AppColors.statusCancelled,
                    ),
                  ),
                  onTap: () async {
                    await ref.read(authControllerProvider.notifier).signOut();
                    if (context.mounted) {
                      context.go('/login');
                    }
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricTile(
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(FluentSpacing.m),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: BorderRadius.circular(FluentRadius.xLarge),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: FluentSpacing.sNudge),
              Expanded(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: FluentType.caption2.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: FluentSpacing.sNudge),
          Text(
            value,
            style: FluentType.numeric(FluentType.body1Strong).copyWith(
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrustEventRow(
    String change,
    String description,
    String date,
    bool isPositive,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: FluentSpacing.xs),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: FluentSpacing.sNudge,
              vertical: FluentSpacing.xxs,
            ),
            decoration: BoxDecoration(
              color: isPositive
                  ? AppColors.successBackground
                  : AppColors.dangerBackground,
              borderRadius: BorderRadius.circular(FluentRadius.medium),
            ),
            child: Text(
              change,
              style: FluentType.numeric(FluentType.caption2).copyWith(
                fontWeight: FontWeight.w600,
                color: isPositive
                    ? AppColors.successForeground
                    : AppColors.statusCancelled,
              ),
            ),
          ),
          const SizedBox(width: FluentSpacing.s),
          Expanded(
            child: Text(
              description,
              style: FluentType.caption2.copyWith(
                color: AppColors.textPrimary,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: FluentSpacing.s),
          Text(
            date,
            style: FluentType.numeric(FluentType.caption2).copyWith(
              color: AppColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }

  void _showSafetyGuidelines(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(FluentRadius.xLarge),
        ),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(FluentSpacing.xxl),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Community safety principles',
                style: FluentType.title3.copyWith(
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: FluentSpacing.m),
              _buildGuidelineItem(
                Icons.public,
                'Public spaces first',
                'All first and second outings must take place in public, well-lit spaces like galleries, cafes, museums, or events.',
              ),
              _buildGuidelineItem(
                Icons.pin,
                'Dual-PIN mutual verification',
                'Verify arrival and completion PINs in person to safeguard escrow deposits.',
              ),
              _buildGuidelineItem(
                Icons.health_and_safety_outlined,
                'Strictly platonic companionship',
                'Cue is dedicated to shared interests, conversation, and activities. Romantic solicitation or adult services are strictly prohibited.',
              ),
              const SizedBox(height: FluentSpacing.l),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('I understand & agree'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildGuidelineItem(IconData icon, String title, String body) {
    return Padding(
      padding: const EdgeInsets.only(bottom: FluentSpacing.m),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: AppColors.brandForeground),
          const SizedBox(width: FluentSpacing.mNudge),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: FluentType.body2Strong.copyWith(
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: FluentSpacing.xxs),
                Text(
                  body,
                  style: FluentType.caption2.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

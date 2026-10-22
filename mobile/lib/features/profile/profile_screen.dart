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
    final isProviderMode = auth.isProviderMode;

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Settings saved')),
              );
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 40),
        children: [
          // User Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 38,
                  backgroundColor: AppColors.primaryLight,
                  child: Text(
                    user?.initials ?? 'AR',
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primaryDark,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      user?.fullName ?? 'Alex Rivera',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    if (user?.isVerified ?? true) ...[
                      const SizedBox(width: 6),
                      const VerifiedBadge(size: 16),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  user?.email ?? 'alex.rivera@example.com',
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
                if (user?.bio != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    user!.bio!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 13,
                      height: 1.4,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Role Switcher Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isProviderMode ? 'Provider Mode' : 'Seeker Mode',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      isProviderMode
                          ? 'Viewing incoming orders & companion dashboard'
                          : 'Viewing companion discovery & outings',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                Switch(
                  value: isProviderMode,
                  activeThumbColor: AppColors.primary,
                  onChanged: (val) {
                    ref.read(authControllerProvider.notifier).toggleRole();
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Provider Dashboard summary (Visible when Provider Mode is on)
          if (isProviderMode) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Companion Dashboard',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _isDiscoverable
                              ? const Color(0xFFD1FAE5)
                              : const Color(0xFFF3F4F6),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _isDiscoverable ? 'Discoverable' : 'Paused',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: _isDiscoverable
                                ? const Color(0xFF047857)
                                : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: _buildMetricTile(
                          'Total Earnings',
                          '\$384.00',
                          Icons.payments_outlined,
                          AppColors.primary,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildMetricTile(
                          'Rating',
                          '4.95 ★',
                          Icons.star_outline_rounded,
                          const Color(0xFFF59E0B),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Accept new booking requests',
                        style: TextStyle(
                            fontSize: 13, fontWeight: FontWeight.w500),
                      ),
                      Switch(
                        value: _isDiscoverable,
                        activeThumbColor: AppColors.sage,
                        onChanged: (val) {
                          setState(() => _isDiscoverable = val);
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
          ],

          // Trust Score & Reputation Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.shield_rounded,
                            size: 20, color: AppColors.sage),
                        SizedBox(width: 8),
                        Text(
                          'Trust & Reputation',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                    TrustScoreBadge(score: user?.trustScore ?? 95),
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  'Your trust score reflects completed sessions, identity verification, positive peer reviews, and punctuality.',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 14),
                const Divider(height: 1, color: AppColors.border),
                const SizedBox(height: 12),
                // Recent trust events
                const Text(
                  'Immutable Trust Events',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                _buildTrustEventRow(
                  '+10 pts',
                  'Identity and phone verification completed',
                  'Oct 18, 2026',
                  true,
                ),
                const SizedBox(height: 6),
                _buildTrustEventRow(
                  '+5 pts',
                  '5-star completed museum companion order',
                  'Oct 19, 2026',
                  true,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Menu Actions
          Container(
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.security, color: AppColors.sage),
                  title: const Text('Community Safety Guidelines'),
                  trailing: const Icon(Icons.arrow_forward_ios,
                      size: 14, color: AppColors.textMuted),
                  onTap: () => _showSafetyGuidelines(context),
                ),
                const Divider(height: 1, indent: 56, color: AppColors.border),
                ListTile(
                  leading:
                      const Icon(Icons.help_outline, color: AppColors.primary),
                  title: const Text('Support & Help Desk'),
                  trailing: const Icon(Icons.arrow_forward_ios,
                      size: 14, color: AppColors.textMuted),
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                          content:
                              Text('Support ticket system ready at port 5010')),
                    );
                  },
                ),
                const Divider(height: 1, indent: 56, color: AppColors.border),
                ListTile(
                  leading: const Icon(Icons.logout,
                      color: AppColors.statusCancelled),
                  title: const Text(
                    'Sign Out',
                    style: TextStyle(color: AppColors.statusCancelled),
                  ),
                  onTap: () async {
                    await ref
                        .read(authControllerProvider.notifier)
                        .signOut();
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
      String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrustEventRow(
      String delta, String description, String date, bool positive) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: positive
                ? const Color(0xFFD1FAE5)
                : const Color(0xFFFEE2E2),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            delta,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: positive
                  ? const Color(0xFF047857)
                  : AppColors.statusCancelled,
            ),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            description,
            style: const TextStyle(fontSize: 12, color: AppColors.textPrimary),
          ),
        ),
        Text(
          date,
          style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
        ),
      ],
    );
  }

  void _showSafetyGuidelines(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => const Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Cue Safety Guidelines',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
            ),
            SizedBox(height: 12),
            Text(
              '1. Always meet initially in well-lit public spaces (cafes, museums, parks).\n'
              '2. Communicate exclusively through the in-app chat for auditability and safety tracking.\n'
              '3. Payments are protected in escrow until session completion.\n'
              '4. In case of discomfort, end the session and tap Contact Support immediately.',
              style: TextStyle(fontSize: 13, height: 1.5),
            ),
            SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

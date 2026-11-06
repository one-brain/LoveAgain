import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';
import 'auth_controller.dart';

class ProfileSetupScreen extends ConsumerStatefulWidget {
  const ProfileSetupScreen({
    required this.phone,
    super.key,
  });

  final String phone;

  @override
  ConsumerState<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends ConsumerState<ProfileSetupScreen> {
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  String _selectedRole = 'Guest';

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    super.dispose();
  }

  Future<void> _handleCompleteSetup() async {
    final firstName = _firstNameController.text.trim();
    final lastName = _lastNameController.text.trim();

    if (firstName.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your first name.')),
      );
      return;
    }

    final result = await ref
        .read(authControllerProvider.notifier)
        .verifyMobileOtp(
          phone: widget.phone,
          otp: '', // Phone already verified in Step 1
          firstName: firstName,
          lastName: lastName,
        );

    if (result != null && !result.isNewUser && mounted) {
      ref.read(authControllerProvider.notifier).setRole(_selectedRole);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Welcome to Cue! Your profile is ready.')),
      );
      try {
        context.go('/');
      } catch (_) {}
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Complete Your Profile'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(
            horizontal: FluentSpacing.xl,
            vertical: FluentSpacing.xl,
          ),
          children: [
            // Header Icon & Title
            Center(
              child: Container(
                padding: const EdgeInsets.all(FluentSpacing.l),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                  border: Border.all(color: AppColors.border),
                ),
                child: const Icon(
                  Icons.person_outline_rounded,
                  size: 36,
                  color: AppColors.brandForeground,
                ),
              ),
            ),
            const SizedBox(height: FluentSpacing.xl),
            Text(
              'Welcome to Cue',
              textAlign: TextAlign.center,
              style: FluentType.title2.copyWith(color: AppColors.textPrimary),
            ),
            const SizedBox(height: FluentSpacing.s),
            Text(
              'Please tell us your name to finish creating your account.',
              textAlign: TextAlign.center,
              style: FluentType.body2.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: FluentSpacing.xxl),

            // Verified Mobile Card
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: FluentSpacing.l,
                vertical: FluentSpacing.m,
              ),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                border: Border.all(color: AppColors.goldBorder),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(FluentSpacing.sNudge),
                    decoration: BoxDecoration(
                      color: AppColors.goldLight,
                      borderRadius: BorderRadius.circular(FluentRadius.medium),
                      border: Border.all(color: AppColors.goldBorder),
                    ),
                    child: const Icon(
                      Icons.verified_user_rounded,
                      size: 18,
                      color: AppColors.gold,
                    ),
                  ),
                  const SizedBox(width: FluentSpacing.m),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Verified mobile',
                          style: FluentType.caption2.copyWith(
                            color: AppColors.textMuted,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          widget.phone,
                          style: FluentType.numeric(FluentType.body2Strong).copyWith(
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: FluentSpacing.s,
                      vertical: FluentSpacing.xs,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.goldLight,
                      borderRadius: BorderRadius.circular(FluentRadius.medium),
                      border: Border.all(color: AppColors.goldBorder),
                    ),
                    child: Text(
                      'VERIFIED',
                      style: FluentType.caption2.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.gold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: FluentSpacing.xxl),

            // First Name Field
            TextField(
              controller: _firstNameController,
              autofocus: true,
              textCapitalization: TextCapitalization.words,
              decoration: InputDecoration(
                labelText: 'First Name',
                hintText: 'e.g. Alex',
                prefixIcon: const Icon(
                  Icons.person_outline,
                  color: AppColors.textSecondary,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(FluentRadius.large),
                  borderSide: const BorderSide(color: AppColors.borderStrong),
                ),
              ),
            ),
            const SizedBox(height: FluentSpacing.l),

            // Last Name Field
            TextField(
              controller: _lastNameController,
              textCapitalization: TextCapitalization.words,
              decoration: InputDecoration(
                labelText: 'Last Name',
                hintText: 'e.g. Seeker',
                prefixIcon: const Icon(
                  Icons.badge_outlined,
                  color: AppColors.textSecondary,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(FluentRadius.large),
                  borderSide: const BorderSide(color: AppColors.borderStrong),
                ),
              ),
            ),
            const SizedBox(height: FluentSpacing.xl),

            // Membership Type Selection
            Text(
              'Membership type',
              style: FluentType.caption1Strong.copyWith(
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: FluentSpacing.s),
            Row(
              children: [
                Expanded(
                  child: ChoiceChip(
                    label: const Text('Guest (Book Outings)'),
                    selected: _selectedRole == 'Guest',
                    selectedColor: AppColors.primaryLight,
                    onSelected: (val) => setState(() => _selectedRole = 'Guest'),
                  ),
                ),
                const SizedBox(width: FluentSpacing.s),
                Expanded(
                  child: ChoiceChip(
                    label: const Text('Host (Offer Companionship)'),
                    selected: _selectedRole == 'Host',
                    selectedColor: AppColors.primaryLight,
                    onSelected: (val) => setState(() => _selectedRole = 'Host'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: FluentSpacing.xxl),

            // Error notice if any
            if (auth.error != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: FluentSpacing.m,
                  vertical: FluentSpacing.mNudge,
                ),
                decoration: BoxDecoration(
                  color: AppColors.dangerBackground,
                  borderRadius: BorderRadius.circular(FluentRadius.large),
                  border: Border.all(color: AppColors.danger.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.error_outline,
                      size: 18,
                      color: AppColors.dangerForeground,
                    ),
                    const SizedBox(width: FluentSpacing.s),
                    Expanded(
                      child: Text(
                        auth.error!,
                        style: FluentType.caption1Strong.copyWith(
                          color: AppColors.dangerForeground,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: FluentSpacing.l),
            ],

            // Submit Button
            FilledButton(
              onPressed: auth.isLoading ? null : _handleCompleteSetup,
              style: FilledButton.styleFrom(
                minimumSize: const Size.fromHeight(48),
                backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(FluentRadius.large),
                ),
              ),
              child: auth.isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : Text(
                      'Complete Account Setup',
                      style: FluentType.body2Strong.copyWith(color: Colors.white),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

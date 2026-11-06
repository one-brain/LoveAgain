import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';
import 'auth_controller.dart';

enum AuthMethod { mobile, email }

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  AuthMethod _authMethod = AuthMethod.mobile;
  String _countryCode = '+91';
  bool _obscurePassword = true;
  bool _isEmailSignUp = false;

  final _phoneController = TextEditingController();
  final _emailController = TextEditingController(text: 'alex.seeker@cue.local');
  final _passwordController = TextEditingController(text: 'CueDemo123!');
  final _firstNameController = TextEditingController(text: 'Alex');
  final _lastNameController = TextEditingController(text: 'Seeker');
  String _selectedRole = 'Guest';

  @override
  void dispose() {
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    super.dispose();
  }

  Future<void> _submitMobileOtp() async {
    final rawPhone = _phoneController.text.trim();
    final digits = rawPhone.replaceAll(RegExp(r'\D'), '');

    if (digits.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid 10-digit mobile number.')),
      );
      return;
    }

    final fullPhone = rawPhone.startsWith('+') ? rawPhone : '$_countryCode$digits';

    final success = await ref
        .read(authControllerProvider.notifier)
        .sendMobileOtp(fullPhone);

    if (success && mounted) {
      context.push(
        '/otp-verify?phone=${Uri.encodeComponent(fullPhone)}',
        extra: fullPhone,
      );
    }
  }

  Future<void> _submitEmailAuth() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || !email.contains('@')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid email address.')),
      );
      return;
    }

    if (password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your password.')),
      );
      return;
    }

    bool success;
    if (_isEmailSignUp) {
      success = await ref.read(authControllerProvider.notifier).register(
            email: email,
            password: password,
            firstName: _firstNameController.text.trim(),
            lastName: _lastNameController.text.trim(),
            roles: [_selectedRole],
          );
    } else {
      success = await ref
          .read(authControllerProvider.notifier)
          .login(email, password);
    }

    if (success && mounted) {
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
        automaticallyImplyLeading: false,
        title: Text(
          _authMethod == AuthMethod.email && _isEmailSignUp
              ? 'Create Cue Account'
              : 'Sign In to Cue',
        ),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(
            horizontal: FluentSpacing.xl,
            vertical: FluentSpacing.l,
          ),
          children: [
            // Brand Header
            Center(
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: FluentSpacing.l,
                  vertical: FluentSpacing.s,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(FluentRadius.large),
                ),
                child: Text(
                  'Cue',
                  style: FluentType.title2.copyWith(color: Colors.white),
                ),
              ),
            ),
            const SizedBox(height: FluentSpacing.l),
            Text(
              _authMethod == AuthMethod.email && _isEmailSignUp
                  ? 'Join as a Guest or Host'
                  : 'Welcome back to Cue',
              textAlign: TextAlign.center,
              style: FluentType.title2.copyWith(color: AppColors.textPrimary),
            ),
            const SizedBox(height: FluentSpacing.sNudge),
            Text(
              _authMethod == AuthMethod.mobile
                  ? 'Enter your 10-digit mobile number to receive a secure passcode.'
                  : (_isEmailSignUp
                      ? 'Curated companionship for gallery walks, dining, and cultural outings.'
                      : 'Sign in to coordinate bookings, escrow, and conversations.'),
              textAlign: TextAlign.center,
              style: FluentType.body2.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: FluentSpacing.xxl),

            // Segmented Auth Method Switcher
            Container(
              padding: const EdgeInsets.all(FluentSpacing.xs),
              decoration: BoxDecoration(
                color: AppColors.surfaceMuted,
                borderRadius: BorderRadius.circular(FluentRadius.large),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => _authMethod = AuthMethod.mobile),
                      borderRadius: BorderRadius.circular(FluentRadius.medium),
                      child: AnimatedContainer(
                        duration: FluentMotion.normal,
                        curve: FluentMotion.easyEase,
                        padding: const EdgeInsets.symmetric(
                          vertical: FluentSpacing.mNudge,
                        ),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: _authMethod == AuthMethod.mobile
                              ? AppColors.surface
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(FluentRadius.medium),
                          border: _authMethod == AuthMethod.mobile
                              ? Border.all(color: AppColors.border)
                              : null,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.phone_android_rounded,
                              size: 16,
                              color: _authMethod == AuthMethod.mobile
                                  ? AppColors.brandForeground
                                  : AppColors.textMuted,
                            ),
                            const SizedBox(width: FluentSpacing.sNudge),
                            Text(
                              'Mobile & OTP',
                              style: (_authMethod == AuthMethod.mobile
                                      ? FluentType.caption1Strong
                                      : FluentType.caption1)
                                  .copyWith(
                                color: _authMethod == AuthMethod.mobile
                                    ? AppColors.brandForeground
                                    : AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => _authMethod = AuthMethod.email),
                      borderRadius: BorderRadius.circular(FluentRadius.medium),
                      child: AnimatedContainer(
                        duration: FluentMotion.normal,
                        curve: FluentMotion.easyEase,
                        padding: const EdgeInsets.symmetric(
                          vertical: FluentSpacing.mNudge,
                        ),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: _authMethod == AuthMethod.email
                              ? AppColors.surface
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(FluentRadius.medium),
                          border: _authMethod == AuthMethod.email
                              ? Border.all(color: AppColors.border)
                              : null,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.mail_outline_rounded,
                              size: 16,
                              color: _authMethod == AuthMethod.email
                                  ? AppColors.brandForeground
                                  : AppColors.textMuted,
                            ),
                            const SizedBox(width: FluentSpacing.sNudge),
                            Text(
                              'Email & Password',
                              style: (_authMethod == AuthMethod.email
                                      ? FluentType.caption1Strong
                                      : FluentType.caption1)
                                  .copyWith(
                                color: _authMethod == AuthMethod.email
                                    ? AppColors.brandForeground
                                    : AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: FluentSpacing.xxl),

            // ERROR DISPLAY
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

            // 1. MOBILE PHONE OTP TAB
            if (_authMethod == AuthMethod.mobile) ...[
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    height: 52,
                    padding: const EdgeInsets.symmetric(
                      horizontal: FluentSpacing.mNudge,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(FluentRadius.large),
                      border: Border.all(color: AppColors.borderStrong),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _countryCode,
                        icon: const Icon(
                          Icons.arrow_drop_down,
                          color: AppColors.textSecondary,
                          size: 20,
                        ),
                        style: FluentType.numeric(FluentType.body2Strong).copyWith(
                          color: AppColors.textPrimary,
                        ),
                        items: const [
                          DropdownMenuItem(value: '+91', child: Text('🇮🇳 +91')),
                          DropdownMenuItem(value: '+1', child: Text('🇺🇸 +1')),
                          DropdownMenuItem(value: '+44', child: Text('🇬🇧 +44')),
                          DropdownMenuItem(value: '+971', child: Text('🇦🇪 +971')),
                          DropdownMenuItem(value: '+65', child: Text('🇸🇬 +65')),
                        ],
                        onChanged: (val) {
                          if (val != null) setState(() => _countryCode = val);
                        },
                      ),
                    ),
                  ),
                  const SizedBox(width: FluentSpacing.mNudge),
                  Expanded(
                    child: TextField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      style: FluentType.numeric(FluentType.body2).copyWith(
                        color: AppColors.textPrimary,
                      ),
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(10),
                      ],
                      decoration: InputDecoration(
                        labelText: 'Mobile Number',
                        hintText: '99000 00003',
                        prefixIcon: const Icon(
                          Icons.phone_outlined,
                          color: AppColors.textSecondary,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(FluentRadius.large),
                          borderSide: const BorderSide(color: AppColors.borderStrong),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: FluentSpacing.m),
              Row(
                children: [
                  const Icon(Icons.verified_user_outlined, size: 14, color: AppColors.gold),
                  const SizedBox(width: FluentSpacing.sNudge),
                  Expanded(
                    child: Text(
                      'We will send an OTP via SMS to verify your mobile number. New members are registered automatically.',
                      style: FluentType.caption2.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: FluentSpacing.xxl),
              FilledButton(
                onPressed: auth.isLoading ? null : _submitMobileOtp,
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
                        'Get Verification Code',
                        style: FluentType.body2Strong.copyWith(color: Colors.white),
                      ),
              ),
            ],

            // 2. EMAIL & PASSWORD TAB
            if (_authMethod == AuthMethod.email) ...[
              if (_isEmailSignUp) ...[
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _firstNameController,
                        decoration: InputDecoration(
                          labelText: 'First Name',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(FluentRadius.large),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: FluentSpacing.m),
                    Expanded(
                      child: TextField(
                        controller: _lastNameController,
                        decoration: InputDecoration(
                          labelText: 'Last Name',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(FluentRadius.large),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: FluentSpacing.m),
                Text(
                  'Membership type',
                  style: FluentType.caption1Strong.copyWith(
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: FluentSpacing.sNudge),
                Row(
                  children: [
                    Expanded(
                      child: ChoiceChip(
                        label: const Text('Guest (Book Outings)'),
                        selected: _selectedRole == 'Guest',
                        selectedColor: AppColors.primaryLight,
                        onSelected: (val) =>
                            setState(() => _selectedRole = 'Guest'),
                      ),
                    ),
                    const SizedBox(width: FluentSpacing.s),
                    Expanded(
                      child: ChoiceChip(
                        label: const Text('Host (Offer Companionship)'),
                        selected: _selectedRole == 'Host',
                        selectedColor: AppColors.primaryLight,
                        onSelected: (val) =>
                            setState(() => _selectedRole = 'Host'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: FluentSpacing.m),
              ],
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: 'Email Address',
                  hintText: 'name@example.com',
                  prefixIcon: const Icon(
                    Icons.email_outlined,
                    color: AppColors.textSecondary,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(FluentRadius.large),
                    borderSide: const BorderSide(color: AppColors.borderStrong),
                  ),
                ),
              ),
              const SizedBox(height: FluentSpacing.l),
              TextField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: 'Password',
                  prefixIcon: const Icon(
                    Icons.lock_outline,
                    color: AppColors.textSecondary,
                  ),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined,
                      color: AppColors.textSecondary,
                      size: 20,
                    ),
                    onPressed: () =>
                        setState(() => _obscurePassword = !_obscurePassword),
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(FluentRadius.large),
                    borderSide: const BorderSide(color: AppColors.borderStrong),
                  ),
                ),
              ),
              const SizedBox(height: FluentSpacing.xxl),
              FilledButton(
                onPressed: auth.isLoading ? null : _submitEmailAuth,
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
                        _isEmailSignUp ? 'Create Account' : 'Sign In',
                        style: FluentType.body2Strong.copyWith(color: Colors.white),
                      ),
              ),
              const SizedBox(height: FluentSpacing.l),
              Center(
                child: TextButton(
                  onPressed: () =>
                      setState(() => _isEmailSignUp = !_isEmailSignUp),
                  child: Text(
                    _isEmailSignUp
                        ? 'Already have an account? Sign In'
                        : 'New to Cue? Create an account',
                    style: FluentType.caption1Strong.copyWith(
                      color: AppColors.brandForeground,
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

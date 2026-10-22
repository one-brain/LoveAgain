import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';
import 'auth_controller.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  bool _isSignUp = false;

  final _emailController = TextEditingController(text: 'alex.rivera@example.com');
  final _passwordController = TextEditingController(text: 'SecretPass123!');
  final _firstNameController = TextEditingController(text: 'Alex');
  final _lastNameController = TextEditingController(text: 'Rivera');
  String _selectedRole = 'Seeker';

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in email and password')),
      );
      return;
    }

    bool success;
    if (_isSignUp) {
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
      context.go('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Text(_isSignUp ? 'Create Cue Account' : 'Sign In to Cue'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          // Logo & Title
          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                'Cue',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 24,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            _isSignUp ? 'Join the companion community.' : 'Keep the good hours going.',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _isSignUp
                ? 'Sign up to discover companionship or offer your time.'
                : 'Sign in to coordinate bookings and conversations.',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 24),

          // Toggle Tab (Sign In vs Sign Up)
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: AppColors.surfaceMuted,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _isSignUp = false),
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: !_isSignUp ? AppColors.surface : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                        boxShadow: !_isSignUp
                            ? [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.05),
                                  blurRadius: 4,
                                )
                              ]
                            : null,
                      ),
                      child: Text(
                        'Sign In',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight:
                              !_isSignUp ? FontWeight.w700 : FontWeight.w500,
                          color: !_isSignUp
                              ? AppColors.textPrimary
                              : AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _isSignUp = true),
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: _isSignUp ? AppColors.surface : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                        boxShadow: _isSignUp
                            ? [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.05),
                                  blurRadius: 4,
                                )
                              ]
                            : null,
                      ),
                      child: Text(
                        'Create Account',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight:
                              _isSignUp ? FontWeight.w700 : FontWeight.w500,
                          color: _isSignUp
                              ? AppColors.textPrimary
                              : AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Sign Up Extra Fields
          if (_isSignUp) ...[
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _firstNameController,
                    decoration: const InputDecoration(labelText: 'First Name'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _lastNameController,
                    decoration: const InputDecoration(labelText: 'Last Name'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              'I want to join as:',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                Expanded(
                  child: ChoiceChip(
                    label: const Text('Seeker (Book Companions)'),
                    selected: _selectedRole == 'Seeker',
                    selectedColor: AppColors.primaryLight,
                    onSelected: (val) =>
                        setState(() => _selectedRole = 'Seeker'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ChoiceChip(
                    label: const Text('Companion (Offer Time)'),
                    selected: _selectedRole == 'Provider',
                    selectedColor: AppColors.primaryLight,
                    onSelected: (val) =>
                        setState(() => _selectedRole = 'Provider'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
          ],

          // Email field
          TextField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(
              labelText: 'Email Address',
              prefixIcon: Icon(Icons.email_outlined, color: AppColors.textSecondary),
            ),
          ),
          const SizedBox(height: 16),

          // Password field
          TextField(
            controller: _passwordController,
            obscureText: true,
            decoration: const InputDecoration(
              labelText: 'Password',
              prefixIcon: Icon(Icons.lock_outline, color: AppColors.textSecondary),
            ),
          ),
          if (auth.error != null) ...[
            const SizedBox(height: 12),
            Text(
              auth.error!,
              style: const TextStyle(
                color: AppColors.statusCancelled,
                fontSize: 13,
              ),
            ),
          ],
          const SizedBox(height: 24),

          // Submit Button
          FilledButton(
            onPressed: auth.isLoading ? null : _submit,
            child: Text(auth.isLoading
                ? 'Processing...'
                : (_isSignUp ? 'Create Account' : 'Sign In')),
          ),
          const SizedBox(height: 16),

          // Quick Demo Sign In
          OutlinedButton.icon(
            onPressed: () async {
              _emailController.text = 'alex.rivera@example.com';
              _passwordController.text = 'SecretPass123!';
              await ref
                  .read(authControllerProvider.notifier)
                  .login('alex.rivera@example.com', 'SecretPass123!');
              if (context.mounted) {
                context.go('/');
              }
            },
            icon: const Icon(Icons.flash_on, color: AppColors.primary),
            label: const Text('Instant Demo Sign In (Alex Rivera)'),
          ),
        ],
      ),
    );
  }
}

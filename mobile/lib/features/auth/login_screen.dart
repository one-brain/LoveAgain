import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'auth_controller.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Sign in to Cue')),
      body: ListView(padding: const EdgeInsets.all(24), children: [
        Text('Keep the good hours going.',
            style: Theme.of(context)
                .textTheme
                .headlineMedium
                ?.copyWith(fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        const Text('Sign in to manage your bookings and conversations.'),
        const SizedBox(height: 32),
        TextField(
            controller: emailController,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(
                labelText: 'Email', border: OutlineInputBorder())),
        const SizedBox(height: 16),
        TextField(
            controller: passwordController,
            obscureText: true,
            decoration: const InputDecoration(
                labelText: 'Password', border: OutlineInputBorder())),
        if (auth.error != null) ...[
          const SizedBox(height: 12),
          Text(auth.error!, style: TextStyle(color: Colors.red))
        ],
        const SizedBox(height: 24),
        FilledButton(
            onPressed: auth.isLoading
                ? null
                : () async {
                    final success = await ref
                        .read(authControllerProvider.notifier)
                        .login(emailController.text.trim(),
                            passwordController.text);
                    if (success && context.mounted) context.go('/');
                  },
            child: Text(auth.isLoading ? 'Signing in...' : 'Sign in')),
      ]),
    );
  }
}

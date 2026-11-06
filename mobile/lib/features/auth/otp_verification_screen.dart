import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';
import 'auth_controller.dart';

class OtpVerificationScreen extends ConsumerStatefulWidget {
  const OtpVerificationScreen({
    required this.email,
    super.key,
  });

  final String email;

  @override
  ConsumerState<OtpVerificationScreen> createState() =>
      _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends ConsumerState<OtpVerificationScreen> {
  static const int _otpLength = 6;
  final List<TextEditingController> _controllers =
      List.generate(_otpLength, (_) => TextEditingController());
  final List<FocusNode> _focusNodes =
      List.generate(_otpLength, (_) => FocusNode());

  int _resendCountdown = 30;
  Timer? _timer;

  bool get _isPhone => !widget.email.contains('@');

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  void _startCountdown() {
    _resendCountdown = 30;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_resendCountdown > 0) {
        setState(() => _resendCountdown--);
      } else {
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  String get _currentCode =>
      _controllers.map((c) => c.text.trim()).join();

  Future<void> _handleVerify() async {
    final code = _currentCode;
    if (code.length != _otpLength) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter all 6 digits of the OTP.')),
      );
      return;
    }

    if (_isPhone) {
      final result = await ref
          .read(authControllerProvider.notifier)
          .verifyMobileOtp(
            phone: widget.email,
            otp: code,
          );

      if (result != null && result.isNewUser && mounted) {
        HapticFeedback.mediumImpact();
        try {
          context.push(
            '/profile-setup?phone=${Uri.encodeComponent(widget.email)}',
            extra: widget.email,
          );
        } catch (_) {}
        return;
      }

      if (result != null && !result.isNewUser && mounted) {
        HapticFeedback.mediumImpact();
        try {
          context.go('/');
        } catch (_) {}
      } else if (mounted) {
        HapticFeedback.heavyImpact();
      }
    } else {
      final success = await ref
          .read(authControllerProvider.notifier)
          .verifyOtp(widget.email, code);

      if (success && mounted) {
        HapticFeedback.mediumImpact();
        try {
          context.go('/');
        } catch (_) {}
      } else if (mounted) {
        HapticFeedback.heavyImpact();
      }
    }
  }

  Future<void> _handleResend() async {
    if (_resendCountdown > 0) return;

    for (final c in _controllers) {
      c.clear();
    }
    _focusNodes.first.requestFocus();

    bool ok = false;
    if (_isPhone) {
      ok = await ref
          .read(authControllerProvider.notifier)
          .sendMobileOtp(widget.email);
    } else {
      ok = await ref
          .read(authControllerProvider.notifier)
          .requestOtp(widget.email);
    }

    if (ok && mounted) {
      _startCountdown();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.primary,
          content: Text('A fresh 6-digit OTP has been sent to ${widget.email}'),
        ),
      );
    }
  }

  void _onDigitChanged(int index, String value) {
    if (value.length > 1) {
      // User pasted multiple characters (e.g., full OTP from SMS or clipboard)
      final digits = value.replaceAll(RegExp(r'\D'), '');
      for (int i = 0; i < _otpLength; i++) {
        if (i < digits.length) {
          _controllers[i].text = digits[i];
        }
      }
      if (digits.length >= _otpLength) {
        _focusNodes.last.unfocus();
        _handleVerify();
      } else {
        _focusNodes[digits.length].requestFocus();
      }
      return;
    }

    if (value.isNotEmpty) {
      if (index < _otpLength - 1) {
        _focusNodes[index + 1].requestFocus();
      } else {
        _focusNodes[index].unfocus();
        _handleVerify();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Verify Identity'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            ref.read(authControllerProvider.notifier).resetOtp();
            if (Navigator.of(context).canPop()) {
              Navigator.of(context).pop();
            } else {
              try {
                context.pop();
              } catch (_) {}
            }
          },
        ),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(
            horizontal: FluentSpacing.xl,
            vertical: FluentSpacing.xl,
          ),
          children: [
            // Shield & Target Header
            Center(
              child: Container(
                padding: const EdgeInsets.all(FluentSpacing.l),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                  border: Border.all(color: AppColors.border),
                ),
                child: Icon(
                  _isPhone
                      ? Icons.phone_android_outlined
                      : Icons.mark_email_read_outlined,
                  size: 36,
                  color: AppColors.brandForeground,
                ),
              ),
            ),
            const SizedBox(height: FluentSpacing.xl),
            Text(
              'Enter 6-digit code',
              textAlign: TextAlign.center,
              style: FluentType.title2.copyWith(color: AppColors.textPrimary),
            ),
            const SizedBox(height: FluentSpacing.s),
            Text.rich(
              TextSpan(
                style: FluentType.body2.copyWith(color: AppColors.textSecondary),
                children: [
                  const TextSpan(text: 'We sent a verification passcode to\n'),
                  TextSpan(
                    text: widget.email,
                    style: FluentType.numeric(FluentType.body2Strong).copyWith(
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: FluentSpacing.xxxl),

            // 6 Segmented Digit Boxes
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: List.generate(_otpLength, (index) {
                return SizedBox(
                  width: 48,
                  height: 56,
                  child: KeyboardListener(
                    focusNode: FocusNode(),
                    onKeyEvent: (event) {
                      if (event is KeyDownEvent &&
                          event.logicalKey == LogicalKeyboardKey.backspace) {
                        if (_controllers[index].text.isEmpty && index > 0) {
                          _controllers[index - 1].clear();
                          _focusNodes[index - 1].requestFocus();
                        }
                      }
                    },
                    child: TextField(
                      controller: _controllers[index],
                      focusNode: _focusNodes[index],
                      keyboardType: TextInputType.number,
                      textAlign: TextAlign.center,
                      autofocus: index == 0,
                      maxLength: 1,
                      style: FluentType.numeric(FluentType.title2).copyWith(
                        color: AppColors.brandForeground,
                      ),
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                      ],
                      decoration: InputDecoration(
                        counterText: '',
                        contentPadding: EdgeInsets.zero,
                        filled: true,
                        fillColor: AppColors.surface,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(FluentRadius.large),
                          borderSide: const BorderSide(color: AppColors.borderStrong),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(FluentRadius.large),
                          borderSide: const BorderSide(color: AppColors.borderStrong),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(FluentRadius.large),
                          borderSide: const BorderSide(
                            color: AppColors.brandStroke,
                            width: 2,
                          ),
                        ),
                      ),
                      onChanged: (val) => _onDigitChanged(index, val),
                    ),
                  ),
                );
              }),
            ),
            const SizedBox(height: FluentSpacing.l),

            // Error notice
            if (auth.error != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: FluentSpacing.m,
                  vertical: FluentSpacing.s,
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
                      size: 16,
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
              onPressed: auth.isLoading ? null : _handleVerify,
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
                      'Verify & Continue',
                      style: FluentType.body2Strong.copyWith(color: Colors.white),
                    ),
            ),
            const SizedBox(height: FluentSpacing.xxl),

            // Resend Countdown Row
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  "Didn't receive the code? ",
                  style: FluentType.caption1.copyWith(color: AppColors.textSecondary),
                ),
                TextButton(
                  onPressed: _resendCountdown == 0 ? _handleResend : null,
                  child: Text(
                    _resendCountdown > 0
                        ? 'Resend in ${_resendCountdown}s'
                        : 'Resend code',
                    style: FluentType.numeric(FluentType.caption1Strong).copyWith(
                      color: _resendCountdown > 0
                          ? AppColors.textMuted
                          : AppColors.brandForeground,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

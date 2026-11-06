import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme.dart';

class PinVerificationModal extends StatefulWidget {
  const PinVerificationModal({
    required this.title,
    required this.subtitle,
    required this.onVerify,
    this.primaryColor = AppColors.primary,
    this.accentBadge = 'Mutual 6-Digit PIN',
    super.key,
  });

  final String title;
  final String subtitle;
  final Future<bool> Function(String pin) onVerify;
  final Color primaryColor;
  final String accentBadge;

  static Future<bool?> show(
    BuildContext context, {
    required String title,
    required String subtitle,
    required Future<bool> Function(String pin) onVerify,
    Color primaryColor = AppColors.primary,
    String accentBadge = 'Mutual 6-Digit PIN',
  }) {
    return showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => PinVerificationModal(
        title: title,
        subtitle: subtitle,
        onVerify: onVerify,
        primaryColor: primaryColor,
        accentBadge: accentBadge,
      ),
    );
  }

  @override
  State<PinVerificationModal> createState() => _PinVerificationModalState();
}

class _PinVerificationModalState extends State<PinVerificationModal> {
  static const int _pinLength = 6;
  final List<TextEditingController> _controllers =
      List.generate(_pinLength, (_) => TextEditingController());
  final List<FocusNode> _focusNodes =
      List.generate(_pinLength, (_) => FocusNode());

  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  String get _currentPin => _controllers.map((c) => c.text.trim()).join();

  Future<void> _submitPin() async {
    final pin = _currentPin;
    if (pin.length != _pinLength) {
      setState(() => _errorMessage = 'Please enter all 6 digits.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final success = await widget.onVerify(pin);

    if (!mounted) return;

    if (success) {
      HapticFeedback.mediumImpact();
      Navigator.of(context).pop(true);
    } else {
      HapticFeedback.heavyImpact();
      setState(() {
        _isLoading = false;
        _errorMessage = 'Invalid PIN code. Please verify and try again.';
      });
      for (final c in _controllers) {
        c.clear();
      }
      _focusNodes.first.requestFocus();
    }
  }

  void _onDigitChanged(int index, String value) {
    if (value.length > 1) {
      // Paste handler
      final digits = value.replaceAll(RegExp(r'\D'), '');
      for (int i = 0; i < _pinLength; i++) {
        if (i < digits.length) {
          _controllers[i].text = digits[i];
        }
      }
      if (digits.length >= _pinLength) {
        _focusNodes.last.unfocus();
        _submitPin();
      } else {
        _focusNodes[digits.length].requestFocus();
      }
      return;
    }

    if (value.isNotEmpty) {
      if (index < _pinLength - 1) {
        _focusNodes[index + 1].requestFocus();
      } else {
        _focusNodes[index].unfocus();
        _submitPin();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      padding: EdgeInsets.fromLTRB(
        FluentSpacing.xl,
        FluentSpacing.l,
        FluentSpacing.xl,
        bottomInset + FluentSpacing.xxl,
      ),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(FluentRadius.xLarge),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.borderStrong,
                borderRadius: BorderRadius.circular(FluentRadius.small),
              ),
            ),
          ),
          const SizedBox(height: FluentSpacing.l),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  widget.title,
                  style: FluentType.title3.copyWith(
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.of(context).pop(false),
              ),
            ],
          ),
          const SizedBox(height: FluentSpacing.xs),
          Text(
            widget.subtitle,
            style: FluentType.caption1.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: FluentSpacing.xxl),

          // 6 Segmented Boxes
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(_pinLength, (index) {
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
                      color: widget.primaryColor,
                    ),
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                    ],
                    decoration: InputDecoration(
                      counterText: '',
                      contentPadding: EdgeInsets.zero,
                      filled: true,
                      fillColor: AppColors.surfaceMuted,
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
                        borderSide: BorderSide(
                          color: widget.primaryColor,
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

          if (_errorMessage != null) ...[
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: FluentSpacing.m,
                vertical: FluentSpacing.s,
              ),
              decoration: BoxDecoration(
                color: AppColors.dangerBackground,
                borderRadius: BorderRadius.circular(FluentRadius.large),
                border: Border.all(
                  color: AppColors.danger.withValues(alpha: 0.3),
                ),
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
                      _errorMessage!,
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

          SizedBox(
            width: double.infinity,
            height: 48,
            child: FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: widget.primaryColor,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(FluentRadius.large),
                ),
              ),
              onPressed: _isLoading ? null : _submitPin,
              child: _isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : Text(
                      'Verify PIN & Proceed',
                      style: FluentType.body2Strong.copyWith(color: Colors.white),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}


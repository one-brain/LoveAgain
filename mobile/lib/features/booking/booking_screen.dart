import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../core/constants.dart';
import '../../core/theme.dart';
import '../../models/provider.dart';
import '../widgets/trust_score_badge.dart';
import '../widgets/verified_badge.dart';
import 'booking_controller.dart';

class BookingScreen extends ConsumerStatefulWidget {
  const BookingScreen({
    required this.provider,
    this.initialSlot,
    super.key,
  });

  final ProviderProfile provider;
  final AvailabilitySlot? initialSlot;

  @override
  ConsumerState<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends ConsumerState<BookingScreen> {
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  TimeOfDay _selectedTime = const TimeOfDay(hour: 14, minute: 0);
  double _duration = 2.0;
  double _maxDuration = 6.0;
  AvailabilitySlot? _selectedSlot;
  List<AvailabilitySlot> _availableSlots = [];
  bool _loadingSlots = false;
  String? _submissionError;
  final _addressController =
      TextEditingController(text: 'Indiranagar 100ft Road, Bengaluru');
  final _requestController = TextEditingController();
  bool _submitting = false;

  final List<String> _suggestedLocations = const [
    'Indiranagar 100ft Rd, Bengaluru',
    'NGMA Gallery, Bengaluru',
    'Kala Ghoda Cafe, Mumbai',
    'NCPA Nariman Point, Mumbai',
    'Hauz Khas Village, Delhi',
  ];

  @override
  void initState() {
    super.initState();
    _availableSlots = List<AvailabilitySlot>.from(widget.provider.upcomingSlots);

    if (widget.initialSlot != null) {
      _applySlot(widget.initialSlot!);
    } else if (_availableSlots.isNotEmpty) {
      _applySlot(_availableSlots.first);
    }

    _fetchFreshSlots();
  }

  void _applySlot(AvailabilitySlot slot) {
    _selectedSlot = slot;
    final localStart = slot.startTime.toLocal();
    _selectedDate = localStart;
    _selectedTime = TimeOfDay.fromDateTime(localStart);
    final slotDuration =
        slot.endTime.difference(slot.startTime).inMinutes / 60.0;
    _maxDuration = slotDuration > 0 ? slotDuration : 6.0;
    _duration = min(2.0, _maxDuration);
    if (_duration < 1.0 && _maxDuration >= 1.0) {
      _duration = 1.0;
    }
  }

  Future<void> _fetchFreshSlots() async {
    setState(() => _loadingSlots = true);
    try {
      final fetched = await ref
          .read(bookingRepositoryProvider)
          .getCompanionAvailability(widget.provider.id);
      if (mounted) {
        setState(() {
          _availableSlots = fetched;
          _loadingSlots = false;
          if (_selectedSlot == null && fetched.isNotEmpty) {
            _applySlot(fetched.first);
          } else if (_selectedSlot != null) {
            // Keep matching slot if present in fetched
            final match = fetched.where((s) => s.id == _selectedSlot!.id);
            if (match.isNotEmpty) {
              _applySlot(match.first);
            }
          }
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _loadingSlots = false);
      }
    }
  }

  @override
  void dispose() {
    _addressController.dispose();
    _requestController.dispose();
    super.dispose();
  }

  double get _providerEarnings => widget.provider.rate * _duration;
  double get _platformFee =>
      ((_providerEarnings * AppConstants.platformFeeRate) * 100).round() / 100;
  double get _totalAmount =>
      ((_providerEarnings + _platformFee) * 100).round() / 100;

  DateTime get _startDateTime {
    if (_selectedSlot != null) {
      return _selectedSlot!.startTime;
    }
    return DateTime(
      _selectedDate.year,
      _selectedDate.month,
      _selectedDate.day,
      _selectedTime.hour,
      _selectedTime.minute,
    );
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppColors.primary,
              onPrimary: Colors.white,
              surface: AppColors.surface,
              onSurface: AppColors.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        _selectedDate = picked;
        _selectedSlot = null;
      });
    }
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
    );
    if (picked != null) {
      setState(() {
        _selectedTime = picked;
        _selectedSlot = null;
      });
    }
  }

  Future<void> _submitBooking() async {
    if (_addressController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please provide a meeting location')),
      );
      return;
    }

    setState(() {
      _submitting = true;
      _submissionError = null;
    });

    final booking =
        await ref.read(bookingControllerProvider.notifier).createBooking(
              provider: widget.provider,
              startTime: _startDateTime,
              durationHours: _duration,
              meetingAddress: _addressController.text.trim(),
              specialRequests: _requestController.text.trim().isNotEmpty
                  ? _requestController.text.trim()
                  : null,
            );

    final errorMsg = ref.read(bookingControllerProvider).error;

    setState(() {
      _submitting = false;
      if (booking == null) {
        _submissionError = errorMsg ?? 'Failed to create booking. Please try again.';
      }
    });

    if (mounted) {
      if (booking != null) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (dialogCtx) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(FluentRadius.xLarge),
            ),
            title: Row(
              children: [
                const Icon(
                  Icons.check_circle,
                  color: AppColors.successForeground,
                  size: 24,
                ),
                const SizedBox(width: FluentSpacing.mNudge),
                Text(
                  'Booking confirmed',
                  style: FluentType.title3.copyWith(
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your booking with ${widget.provider.name} has been placed.',
                  style: FluentType.body2.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: FluentSpacing.m),
                Container(
                  padding: const EdgeInsets.all(FluentSpacing.m),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceMuted,
                    borderRadius: BorderRadius.circular(FluentRadius.large),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Date:',
                            style: FluentType.caption1.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                          Text(
                            DateFormat('EEE, MMM d • h:mm a')
                                .format(_startDateTime),
                            style: FluentType.numeric(FluentType.caption1Strong)
                                .copyWith(color: AppColors.textPrimary),
                          ),
                        ],
                      ),
                      const SizedBox(height: FluentSpacing.sNudge),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Total:',
                            style: FluentType.caption1.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                          Text(
                            '₹${_totalAmount.toStringAsFixed(2)}',
                            style: FluentType.numeric(FluentType.body2Strong)
                                .copyWith(color: AppColors.brandForeground),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            actions: [
              FilledButton(
                onPressed: () {
                  Navigator.of(dialogCtx).pop();
                  context.go('/');
                },
                child: const Text('View in Bookings'),
              ),
            ],
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.error_outline, color: Colors.white, size: 20),
                const SizedBox(width: FluentSpacing.s),
                Expanded(
                  child: Text(
                    _submissionError ?? 'Booking request failed.',
                    style: FluentType.caption1Strong.copyWith(
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
            backgroundColor: AppColors.danger,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.provider;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Book a companion'),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
          FluentSpacing.l,
          FluentSpacing.m,
          FluentSpacing.l,
          100,
        ),
        children: [
          // Provider Header Card
          Container(
            padding: const EdgeInsets.all(FluentSpacing.l),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(FluentRadius.xLarge),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppColors.primaryLight,
                  child: Text(
                    p.initials,
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
                          Text(
                            p.name,
                            style: FluentType.body1Strong.copyWith(
                              color: AppColors.textPrimary,
                            ),
                          ),
                          if (p.isVerified) ...[
                            const SizedBox(width: FluentSpacing.xs),
                            const VerifiedBadge(size: 14),
                          ],
                        ],
                      ),
                      const SizedBox(height: FluentSpacing.xxs),
                      Text(
                        p.role,
                        style: FluentType.caption1Strong.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                TrustScoreBadge(score: p.trustScore, compact: true),
              ],
            ),
          ),
          const SizedBox(height: FluentSpacing.xxl),

          // Availability Slot Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Available slots',
                style: FluentType.body1Strong.copyWith(
                  color: AppColors.textPrimary,
                ),
              ),
              if (_loadingSlots)
                const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
            ],
          ),
          const SizedBox(height: FluentSpacing.sNudge),
          if (_availableSlots.isNotEmpty) ...[
            Text(
              'Select an open slot to schedule your outing:',
              style: FluentType.caption1.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: FluentSpacing.s),
            Wrap(
              spacing: FluentSpacing.s,
              runSpacing: FluentSpacing.s,
              children: _availableSlots.map((slot) {
                final isSelected = _selectedSlot?.id == slot.id;
                final localStart = slot.startTime.toLocal();
                final localEnd = slot.endTime.toLocal();
                final startStr =
                    DateFormat('EEE, MMM d • h:mm a').format(localStart);
                final endStr = DateFormat('h:mm a').format(localEnd);
                return ChoiceChip(
                  label: Text('$startStr - $endStr'),
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
                    if (selected) {
                      setState(() => _applySlot(slot));
                    }
                  },
                );
              }).toList(),
            ),
          ] else if (!_loadingSlots) ...[
            Container(
              padding: const EdgeInsets.all(FluentSpacing.m),
              decoration: BoxDecoration(
                color: AppColors.goldLight,
                borderRadius: BorderRadius.circular(FluentRadius.large),
                border: Border.all(color: AppColors.goldBorder),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.info_outline,
                    color: AppColors.gold,
                    size: 18,
                  ),
                  const SizedBox(width: FluentSpacing.s),
                  Expanded(
                    child: Text(
                      'No pre-scheduled slots loaded. Selecting a custom slot will be subject to host availability.',
                      style: FluentType.caption2.copyWith(
                        color: AppColors.gold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: FluentSpacing.xl),

          // Date & Time Picker Card
          Text(
            'Schedule your moment',
            style: FluentType.body1Strong.copyWith(
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: FluentSpacing.m),
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: _pickDate,
                  borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                  child: Container(
                    padding: const EdgeInsets.all(FluentSpacing.m),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Date',
                          style: FluentType.caption2.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: FluentSpacing.xs),
                        Row(
                          children: [
                            const Icon(
                              Icons.calendar_month,
                              size: 16,
                              color: AppColors.brandForeground,
                            ),
                            const SizedBox(width: FluentSpacing.sNudge),
                            Text(
                              DateFormat('MMM d, yyyy').format(_selectedDate),
                              style: FluentType.numeric(FluentType.caption1Strong)
                                  .copyWith(color: AppColors.textPrimary),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: FluentSpacing.m),
              Expanded(
                child: InkWell(
                  onTap: _pickTime,
                  borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                  child: Container(
                    padding: const EdgeInsets.all(FluentSpacing.m),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Start time',
                          style: FluentType.caption2.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: FluentSpacing.xs),
                        Row(
                          children: [
                            const Icon(
                              Icons.access_time,
                              size: 16,
                              color: AppColors.brandForeground,
                            ),
                            const SizedBox(width: FluentSpacing.sNudge),
                            Text(
                              _selectedTime.format(context),
                              style: FluentType.numeric(FluentType.caption1Strong)
                                  .copyWith(color: AppColors.textPrimary),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: FluentSpacing.xl),

          // Duration Slider Card
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
                    Text(
                      'Session duration',
                      style: FluentType.body2Strong.copyWith(
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: FluentSpacing.s,
                        vertical: FluentSpacing.xxs,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(FluentRadius.medium),
                      ),
                      child: Text(
                        '${_duration.toStringAsFixed(1)} hours',
                        style: FluentType.numeric(FluentType.caption1Strong)
                            .copyWith(color: AppColors.brandForeground),
                      ),
                    ),
                  ],
                ),
                Slider(
                  value: _duration.clamp(
                    1.0,
                    _maxDuration > 1.0 ? _maxDuration : 1.0,
                  ),
                  min: 1.0,
                  max: _maxDuration > 1.0 ? _maxDuration : 1.0,
                  divisions: (_maxDuration > 1.0)
                      ? ((_maxDuration - 1.0) * 2).round().clamp(1, 20)
                      : null,
                  label: '${_duration.toStringAsFixed(1)} hrs',
                  onChanged: _maxDuration > 1.0
                      ? (val) => setState(() => _duration = val)
                      : null,
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '1 hr',
                      style: FluentType.numeric(FluentType.caption2).copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    Text(
                      'Max ${_maxDuration.toStringAsFixed(1)} hrs',
                      style: FluentType.numeric(FluentType.caption2).copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: FluentSpacing.xl),

          // Meeting Location
          Text(
            'Meeting location',
            style: FluentType.body1Strong.copyWith(
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: FluentSpacing.s),
          TextField(
            controller: _addressController,
            decoration: const InputDecoration(
              hintText: 'Enter specific street address or landmark...',
              prefixIcon: Icon(
                Icons.pin_drop_outlined,
                color: AppColors.brandForeground,
              ),
            ),
          ),
          const SizedBox(height: FluentSpacing.s),
          Wrap(
            spacing: FluentSpacing.sNudge,
            runSpacing: FluentSpacing.sNudge,
            children: _suggestedLocations.map((loc) {
              return ActionChip(
                label: Text(loc),
                labelStyle: FluentType.caption2.copyWith(
                  color: AppColors.textPrimary,
                ),
                backgroundColor: AppColors.surface,
                side: const BorderSide(color: AppColors.border),
                onPressed: () {
                  setState(() {
                    _addressController.text = loc;
                  });
                },
              );
            }).toList(),
          ),
          const SizedBox(height: FluentSpacing.xl),

          // Special Requests Field
          Text(
            'Special requests / notes',
            style: FluentType.body1Strong.copyWith(
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: FluentSpacing.s),
          TextField(
            controller: _requestController,
            maxLines: 3,
            decoration: const InputDecoration(
              hintText:
                  'Any particular focus, dietary preferences, or plans for this moment?',
            ),
          ),
          const SizedBox(height: FluentSpacing.xxl),

          // Transparent Price Breakdown
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
                Text(
                  'Price breakdown',
                  style: FluentType.body2Strong.copyWith(
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: FluentSpacing.m),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '₹${p.rate} × ${_duration.toStringAsFixed(1)} hours',
                      style: FluentType.numeric(FluentType.caption1).copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    Text(
                      '₹${_providerEarnings.toStringAsFixed(0)}',
                      style: FluentType.numeric(FluentType.caption1Strong)
                          .copyWith(color: AppColors.textPrimary),
                    ),
                  ],
                ),
                const SizedBox(height: FluentSpacing.s),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Text(
                          'Cue platform & escrow fee (10%)',
                          style: FluentType.caption1.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(width: FluentSpacing.xs),
                        const Icon(
                          Icons.info_outline,
                          size: 13,
                          color: AppColors.textMuted,
                        ),
                      ],
                    ),
                    Text(
                      '₹${_platformFee.toStringAsFixed(0)}',
                      style: FluentType.numeric(FluentType.caption1).copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: FluentSpacing.m),
                  child: Divider(height: 1, color: AppColors.border),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Total escrow hold',
                      style: FluentType.body2Strong.copyWith(
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      '₹${_totalAmount.toStringAsFixed(0)}',
                      style: FluentType.numeric(FluentType.title3).copyWith(
                        color: AppColors.brandForeground,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (_submissionError != null) ...[
            const SizedBox(height: FluentSpacing.l),
            Container(
              padding: const EdgeInsets.all(FluentSpacing.m),
              decoration: BoxDecoration(
                color: AppColors.dangerBackground,
                borderRadius: BorderRadius.circular(FluentRadius.xLarge),
                border: Border.all(
                  color: AppColors.danger.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(
                    Icons.error_outline,
                    color: AppColors.dangerForeground,
                    size: 20,
                  ),
                  const SizedBox(width: FluentSpacing.mNudge),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Booking request failed',
                          style: FluentType.caption1Strong.copyWith(
                            color: AppColors.dangerForeground,
                          ),
                        ),
                        const SizedBox(height: FluentSpacing.xs),
                        Text(
                          _submissionError!,
                          style: FluentType.caption2.copyWith(
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
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
          child: SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: _submitting ? null : _submitBooking,
              icon: _submitting
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.check_circle_outline),
              label: Text(
                _submitting
                    ? 'Requesting...'
                    : 'Confirm & request outing (₹${_totalAmount.toStringAsFixed(0)})',
                style: FluentType.numeric(FluentType.body2Strong).copyWith(
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

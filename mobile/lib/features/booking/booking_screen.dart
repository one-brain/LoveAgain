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
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: const Row(
              children: [
                Icon(Icons.check_circle, color: AppColors.sage, size: 28),
                SizedBox(width: 10),
                Text('Booking Confirmed!'),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your booking with ${widget.provider.name} has been placed.',
                  style: const TextStyle(fontSize: 14, height: 1.4),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceMuted,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Date:',
                              style: TextStyle(
                                  fontSize: 13,
                                  color: AppColors.textSecondary)),
                          Text(
                            DateFormat('EEE, MMM d • h:mm a')
                                .format(_startDateTime),
                            style: const TextStyle(
                                fontSize: 13, fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Total:',
                              style: TextStyle(
                                  fontSize: 13,
                                  color: AppColors.textSecondary)),
                          Text(
                            '₹${_totalAmount.toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: AppColors.primary,
                            ),
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
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _submissionError ?? 'Booking request failed.',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            backgroundColor: AppColors.statusCancelled,
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
        title: const Text('Book a Companion'),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 100),
        children: [
          // Provider Header Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor: AppColors.primaryLight,
                  child: Text(
                    p.initials,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primaryDark,
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            p.name,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          if (p.isVerified) ...[
                            const SizedBox(width: 4),
                            const VerifiedBadge(size: 14),
                          ],
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        p.role,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.sage,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                TrustScoreBadge(score: p.trustScore, compact: true),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Availability Slot Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Available Slots',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
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
          const SizedBox(height: 6),
          if (_availableSlots.isNotEmpty) ...[
            const Text(
              'Select an open slot to schedule your outing:',
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
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
                  labelStyle: TextStyle(
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected
                        ? AppColors.primaryDark
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
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.goldLight,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                    color: AppColors.gold.withValues(alpha: 0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, color: AppColors.goldDark, size: 18),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'No pre-scheduled slots loaded. Selecting a custom slot will be subject to host availability.',
                      style:
                          TextStyle(fontSize: 12, color: AppColors.goldDark),
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 20),

          // Date & Time Picker Card
          const Text(
            'Schedule Your Moment',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: _pickDate,
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Date',
                          style: TextStyle(
                              fontSize: 11, color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.calendar_month,
                                size: 16, color: AppColors.primary),
                            const SizedBox(width: 6),
                            Text(
                              DateFormat('MMM d, yyyy').format(_selectedDate),
                              style: const TextStyle(
                                  fontSize: 14, fontWeight: FontWeight.w700),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: InkWell(
                  onTap: _pickTime,
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Start Time',
                          style: TextStyle(
                              fontSize: 11, color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.access_time,
                                size: 16, color: AppColors.primary),
                            const SizedBox(width: 6),
                            Text(
                              _selectedTime.format(context),
                              style: const TextStyle(
                                  fontSize: 14, fontWeight: FontWeight.w700),
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
          const SizedBox(height: 20),

          // Duration Slider Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Session Duration',
                      style:
                          TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '${_duration.toStringAsFixed(1)} hours',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primaryDark,
                        ),
                      ),
                    ),
                  ],
                ),
                Slider(
                  value: _duration.clamp(1.0, _maxDuration > 1.0 ? _maxDuration : 1.0),
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
                    const Text('1 hr',
                        style: TextStyle(
                            fontSize: 11, color: AppColors.textSecondary)),
                    Text('Max ${_maxDuration.toStringAsFixed(1)} hrs',
                        style: const TextStyle(
                            fontSize: 11, color: AppColors.textSecondary)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Meeting Location
          const Text(
            'Meeting Location',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _addressController,
            decoration: const InputDecoration(
              hintText: 'Enter specific street address or landmark...',
              prefixIcon: Icon(Icons.pin_drop_outlined, color: AppColors.primary),
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: _suggestedLocations.map((loc) {
              return ActionChip(
                label: Text(loc),
                labelStyle: const TextStyle(fontSize: 11),
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
          const SizedBox(height: 20),

          // Special Requests Field
          const Text(
            'Special Requests / Notes',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _requestController,
            maxLines: 3,
            decoration: const InputDecoration(
              hintText:
                  'Any particular focus, dietary preferences, or plans for this moment?',
            ),
          ),
          const SizedBox(height: 24),

          // Transparent Price Breakdown
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Price Breakdown',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '₹${p.rate} x ${_duration.toStringAsFixed(1)} hours',
                      style: const TextStyle(
                          fontSize: 14, color: AppColors.textSecondary),
                    ),
                    Text(
                      '₹${_providerEarnings.toStringAsFixed(0)}',
                      style: const TextStyle(
                          fontSize: 14, fontWeight: FontWeight.w600, fontFamily: 'monospace'),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Text(
                          'Cue Platform & Escrow Fee (10%)',
                          style: TextStyle(
                              fontSize: 13, color: AppColors.textSecondary),
                        ),
                        SizedBox(width: 4),
                        Icon(Icons.info_outline,
                            size: 13, color: AppColors.textMuted),
                      ],
                    ),
                    Text(
                      '₹${_platformFee.toStringAsFixed(0)}',
                      style: const TextStyle(
                          fontSize: 13, color: AppColors.textSecondary, fontFamily: 'monospace'),
                    ),
                  ],
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 12),
                  child: Divider(height: 1, color: AppColors.border),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Total Escrow Hold',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      '₹${_totalAmount.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primary,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (_submissionError != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.statusCancelled.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                    color: AppColors.statusCancelled.withValues(alpha: 0.3)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.error_outline,
                      color: AppColors.statusCancelled, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Booking Request Failed',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: AppColors.statusCancelled,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _submissionError!,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textPrimary,
                            height: 1.3,
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
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, -3),
            ),
          ],
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
                          strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.check_circle_outline),
              label: Text(_submitting
                  ? 'Requesting...'
                  : 'Confirm & Request Outing (₹${_totalAmount.toStringAsFixed(0)})'),
            ),
          ),
        ),
      ),
    );
  }
}

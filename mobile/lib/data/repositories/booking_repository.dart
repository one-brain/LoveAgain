import '../../core/api_client.dart';
import '../../models/booking.dart';

class BookingRepository {
  BookingRepository(this._api);

  final ApiClient _api;

  // In-memory cache for fast UI updates
  final List<Booking> _cachedBookings = [];

  Future<List<Booking>> getMyBookings() async {
    try {
      final response = await _api.get<dynamic>('/bookings');
      if (response.data is List) {
        final list = (response.data as List)
            .map((b) => Booking.fromJson(b as Map<String, dynamic>))
            .toList();
        _cachedBookings.clear();
        _cachedBookings.addAll(list);
        return list;
      }
    } catch (_) {
      // Return cached bookings if offline
    }
    return List<Booking>.unmodifiable(_cachedBookings);
  }

  Future<Booking> createBooking(Booking booking) async {
    final response = await _api.post<Map<String, dynamic>>(
      '/bookings',
      data: {
        'providerId': booking.providerId,
        'startTime': booking.startTime.toIso8601String(),
        'endTime': booking.endTime.toIso8601String(),
        'hourlyRate': booking.hourlyRate,
        'durationHours': booking.durationHours,
        'meetingAddress': booking.meetingAddress,
        'requirements': booking.specialRequests != null
            ? {'notes': booking.specialRequests}
            : null,
      },
    );

    if (response.data != null && response.data!['orderId'] != null) {
      final createdOrderId = response.data!['orderId'].toString();
      final arrivalPin = response.data!['arrivalPin']?.toString() ??
          response.data!['checkInPin']?.toString() ??
          booking.arrivalPin;
      final completionPin = response.data!['completionPin']?.toString() ??
          booking.completionPin;

      final created = Booking(
        orderId: createdOrderId,
        providerId: booking.providerId,
        providerName: booking.providerName,
        providerInitials: booking.providerInitials,
        providerPhotoUrl: booking.providerPhotoUrl,
        seekerId: booking.seekerId,
        seekerName: booking.seekerName,
        startTime: booking.startTime,
        endTime: booking.endTime,
        hourlyRate: booking.hourlyRate,
        durationHours: booking.durationHours,
        providerEarnings: booking.providerEarnings,
        platformFee: booking.platformFee,
        totalAmount: booking.totalAmount,
        status: BookingStatus.confirmed,
        meetingAddress: booking.meetingAddress,
        specialRequests: booking.specialRequests,
        arrivalPin: arrivalPin,
        completionPin: completionPin,
      );

      _cachedBookings.removeWhere((b) => b.orderId == createdOrderId);
      _cachedBookings.insert(0, created);
      return created;
    }

    _cachedBookings.insert(0, booking);
    return booking;
  }

  Future<Booking> checkInWithPin(String orderId, String pin) async {
    final response = await _api.patch<Map<String, dynamic>>(
      '/bookings/$orderId/checkin',
      data: {'pin': pin},
    );

    final index = _cachedBookings.indexWhere((b) => b.orderId == orderId);
    if (index != -1) {
      final updated = _cachedBookings[index].copyWith(status: BookingStatus.inProgress);
      _cachedBookings[index] = updated;
      return updated;
    }

    if (response.data != null) {
      return Booking.fromJson(response.data!);
    }
    throw StateError('Outing $orderId not found');
  }

  Future<Booking> completeWithPin(String orderId, String completionPin) async {
    final response = await _api.patch<Map<String, dynamic>>(
      '/bookings/$orderId/complete',
      data: {'completionPin': completionPin},
    );

    final index = _cachedBookings.indexWhere((b) => b.orderId == orderId);
    if (index != -1) {
      final updated = _cachedBookings[index].copyWith(status: BookingStatus.completed);
      _cachedBookings[index] = updated;
      return updated;
    }

    if (response.data != null) {
      return Booking.fromJson(response.data!);
    }
    throw StateError('Outing $orderId not found');
  }

  Future<bool> reportSafetyIncident(
    String orderId, {
    required String reason,
    String? contactAlerted,
  }) async {
    try {
      await _api.post<Map<String, dynamic>>(
        '/bookings/$orderId/cancel',
        data: {'reason': 'Safety Incident: $reason. Alerted: $contactAlerted'},
      );
    } catch (_) {
      // Fallback
    }

    final index = _cachedBookings.indexWhere((b) => b.orderId == orderId);
    if (index != -1) {
      final updated = _cachedBookings[index].copyWith(
        status: BookingStatus.disputed,
      );
      _cachedBookings[index] = updated;
    }
    return true;
  }

  Future<Booking> updateStatus(String orderId, BookingStatus status) async {
    try {
      switch (status) {
        case BookingStatus.confirmed:
          await _api.patch('/bookings/$orderId/confirm');
          break;
        case BookingStatus.cancelled:
          await _api.post('/bookings/$orderId/cancel', data: {'reason': 'User requested cancellation'});
          break;
        case BookingStatus.disputed:
          await _api.post('/bookings/$orderId/cancel', data: {'reason': 'Safety alert or dispute reported'});
          break;
        default:
          break;
      }
    } catch (_) {
      // Fallback
    }

    final index = _cachedBookings.indexWhere((b) => b.orderId == orderId);
    if (index != -1) {
      final updated = _cachedBookings[index].copyWith(status: status);
      _cachedBookings[index] = updated;
      return updated;
    }
    throw StateError('Booking $orderId not found');
  }
}

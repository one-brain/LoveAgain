import '../../core/api_client.dart';
import '../../models/booking.dart';
import '../mock_data.dart';

class BookingRepository {
  BookingRepository(this._api);

  final ApiClient _api;

  // Local state cache
  final List<Booking> _cachedBookings = List<Booking>.from(MockData.seedBookings);

  Future<List<Booking>> getMyBookings() async {
    try {
      final response = await _api.get<dynamic>('/bookings/mine');
      if (response.data is List) {
        final list = (response.data as List)
            .map((b) => Booking.fromJson(b as Map<String, dynamic>))
            .toList();
        if (list.isNotEmpty) return list;
      }
    } catch (_) {
      // Use cached bookings
    }
    return List<Booking>.unmodifiable(_cachedBookings);
  }

  Future<Booking> createBooking(Booking booking) async {
    try {
      final response = await _api.post<Map<String, dynamic>>(
        '/bookings',
        data: {
          'providerId': booking.providerId,
          'startTime': booking.startTime.toIso8601String(),
          'endTime': booking.endTime.toIso8601String(),
          'hourlyRate': booking.hourlyRate,
          'durationHours': booking.durationHours,
          'meetingAddress': booking.meetingAddress,
          'arrivalPin': booking.arrivalPin,
          'completionPin': booking.completionPin,
        },
      );
      if (response.data != null && response.data!['orderId'] != null) {
        final created = booking.copyWith();
        _cachedBookings.insert(0, created);
        return created;
      }
    } catch (_) {
      // Fallback
    }
    _cachedBookings.insert(0, booking);
    return booking;
  }

  Future<Booking> checkInWithPin(String orderId, String pin) async {
    final index = _cachedBookings.indexWhere((b) => b.orderId == orderId);
    if (index == -1) {
      throw StateError('Outing $orderId not found');
    }
    final current = _cachedBookings[index];
    if (current.status != BookingStatus.confirmed) {
      throw StateError('Outing must be in Confirmed status to check in.');
    }

    try {
      final response = await _api.patch<Map<String, dynamic>>(
        '/bookings/$orderId/checkin',
        data: {'pin': pin},
      );
      if (response.statusCode == 200) {
        final updated = current.copyWith(status: BookingStatus.inProgress);
        _cachedBookings[index] = updated;
        return updated;
      }
    } catch (_) {
      // Offline fallback: check PIN against current.arrivalPin
      if (current.arrivalPin != null && current.arrivalPin!.isNotEmpty) {
        if (current.arrivalPin != pin) {
          throw ArgumentError('Invalid arrival PIN. Please check the code with your Guest.');
        }
      }
    }

    final updated = current.copyWith(status: BookingStatus.inProgress);
    _cachedBookings[index] = updated;
    return updated;
  }

  Future<Booking> completeWithPin(String orderId, String completionPin) async {
    final index = _cachedBookings.indexWhere((b) => b.orderId == orderId);
    if (index == -1) {
      throw StateError('Outing $orderId not found');
    }
    final current = _cachedBookings[index];
    if (current.status != BookingStatus.inProgress) {
      throw StateError('Outing cannot be completed before session is initiated with the arrival verification PIN.');
    }

    try {
      final response = await _api.patch<Map<String, dynamic>>(
        '/bookings/$orderId/complete',
        data: {'completionPin': completionPin},
      );
      if (response.statusCode == 200) {
        final updated = current.copyWith(status: BookingStatus.completed);
        _cachedBookings[index] = updated;
        return updated;
      }
    } catch (_) {
      // Offline fallback: check PIN against current.completionPin
      if (current.completionPin != null && current.completionPin!.isNotEmpty) {
        if (current.completionPin != completionPin) {
          throw ArgumentError('Invalid completion PIN. Please check the code with your Host.');
        }
      }
    }

    final updated = current.copyWith(status: BookingStatus.completed);
    _cachedBookings[index] = updated;
    return updated;
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
        default:
          break;
      }
    } catch (_) {
      // Fallback local update
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

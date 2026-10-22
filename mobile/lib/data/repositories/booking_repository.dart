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

  Future<Booking> updateStatus(String orderId, BookingStatus status) async {
    try {
      switch (status) {
        case BookingStatus.confirmed:
          await _api.patch('/bookings/$orderId/confirm');
          break;
        case BookingStatus.inProgress:
          await _api.patch('/bookings/$orderId/start');
          break;
        case BookingStatus.completed:
          await _api.patch('/bookings/$orderId/complete');
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


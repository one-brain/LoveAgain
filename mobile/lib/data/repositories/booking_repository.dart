import 'package:dio/dio.dart';
import '../../core/api_client.dart';
import '../../models/booking.dart';
import '../../models/provider.dart';

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
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    } catch (_) {
      // Return cached bookings if offline
    }
    return List<Booking>.unmodifiable(_cachedBookings);
  }

  Future<List<AvailabilitySlot>> getCompanionAvailability(String providerId) async {
    try {
      final response = await _api.get<dynamic>('/bookings/availability/$providerId');
      if (response.data is List) {
        return (response.data as List)
            .map((s) => AvailabilitySlot.fromJson(s as Map<String, dynamic>))
            .where((s) => !s.isBooked)
            .toList();
      }
    } catch (_) {
      // In offline/test mode return empty
    }
    return [];
  }

  Future<Booking> createBooking(Booking booking) async {
    try {
      final response = await _api.post<Map<String, dynamic>>(
        '/bookings',
        data: {
          'providerId': booking.providerId,
          'startTime': booking.startTime.toUtc().toIso8601String(),
          'endTime': booking.endTime.toUtc().toIso8601String(),
          'hourlyRate': booking.hourlyRate,
          'durationHours': booking.durationHours,
          'meetingAddress': booking.meetingAddress,
          'requirements': booking.specialRequests != null
              ? {'notes': booking.specialRequests}
              : null,
        },
      );

      final data = response.data;
      if (data != null && (data['orderId'] != null || data['id'] != null)) {
        final createdOrderId = (data['orderId'] ?? data['id']).toString();
        final arrivalPin = data['arrivalPin']?.toString() ??
            data['checkInPin']?.toString() ??
            booking.arrivalPin;
        final completionPin = data['completionPin']?.toString() ??
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
          totalAmount: (data['totalAmount'] as num?)?.toDouble() ?? booking.totalAmount,
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

      throw const ApiException(message: 'Invalid response from booking service');
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  Future<Booking> checkInWithPin(String orderId, String pin) async {
    try {
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
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
  }

  Future<Booking> completeWithPin(String orderId, String completionPin) async {
    try {
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
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
    }
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
    } on DioException catch (e) {
      throw ApiException.fromDioException(e);
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

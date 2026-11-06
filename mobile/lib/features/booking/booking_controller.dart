import 'dart:math';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api_client.dart';
import '../../data/repositories/booking_repository.dart';
import '../../models/booking.dart';
import '../../models/provider.dart';
import '../auth/auth_controller.dart';
import '../wallet/wallet_controller.dart';

final bookingRepositoryProvider = Provider<BookingRepository>(
  (ref) => BookingRepository(ref.read(apiClientProvider)),
);

class BookingsState {
  const BookingsState({
    this.bookings = const [],
    this.isLoading = false,
    this.error,
    this.selectedTab = 'active',
    this.selectedRoleFilter = 'all',
    this.currentUserId,
  });

  final List<Booking> bookings;
  final bool isLoading;
  final String? error;
  final String selectedTab;
  final String selectedRoleFilter;
  final String? currentUserId;

  bool _matchesRole(Booking b) {
    if (selectedRoleFilter == 'all') return true;
    final isHost = (currentUserId != null &&
        currentUserId!.isNotEmpty &&
        b.providerId == currentUserId);
    if (selectedRoleFilter == 'host') return isHost;
    if (selectedRoleFilter == 'guest') return !isHost;
    return true;
  }

  List<Booking> get activeBookings {
    final list = bookings
        .where((b) =>
            _matchesRole(b) &&
            (b.status == BookingStatus.confirmed ||
                b.status == BookingStatus.pendingPayment ||
                b.status == BookingStatus.inProgress ||
                b.status == BookingStatus.disputed))
        .toList();
    list.sort((a, b) => a.startTime.compareTo(b.startTime));
    return list;
  }

  List<Booking> get completedBookings {
    final list = bookings
        .where((b) => _matchesRole(b) && b.status == BookingStatus.completed)
        .toList();
    list.sort((a, b) => b.startTime.compareTo(a.startTime));
    return list;
  }

  List<Booking> get cancelledBookings {
    final list = bookings
        .where((b) => _matchesRole(b) && b.status == BookingStatus.cancelled)
        .toList();
    list.sort((a, b) => b.startTime.compareTo(a.startTime));
    return list;
  }

  List<Booking> get filteredBookings {
    switch (selectedTab) {
      case 'active':
        return activeBookings;
      case 'completed':
        return completedBookings;
      case 'cancelled':
        return cancelledBookings;
      default:
        final list = List<Booking>.from(bookings);
        list.sort((a, b) => a.startTime.compareTo(b.startTime));
        return list;
    }
  }

  BookingsState copyWith({
    List<Booking>? bookings,
    bool? isLoading,
    String? error,
    String? selectedTab,
    String? selectedRoleFilter,
    String? currentUserId,
  }) {
    return BookingsState(
      bookings: bookings ?? this.bookings,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      selectedTab: selectedTab ?? this.selectedTab,
      selectedRoleFilter: selectedRoleFilter ?? this.selectedRoleFilter,
      currentUserId: currentUserId ?? this.currentUserId,
    );
  }
}

final bookingControllerProvider =
    StateNotifierProvider<BookingController, BookingsState>(
  (ref) => BookingController(
    ref.read(bookingRepositoryProvider),
    ref,
  ),
);

class BookingController extends StateNotifier<BookingsState> {
  BookingController(this._repository, this._ref) : super(const BookingsState()) {
    loadBookings();
  }

  final BookingRepository _repository;
  final Ref _ref;

  Future<void> loadBookings() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final list = await _repository.getMyBookings();
      final currentUserId = _ref.read(authControllerProvider).user?.id;
      state = state.copyWith(
        bookings: list,
        currentUserId: currentUserId,
        isLoading: false,
        error: null,
      );
    } catch (e) {
      final msg = e is ApiException ? e.message : 'Could not load outings';
      state = state.copyWith(isLoading: false, error: msg);
    }
  }

  void setTab(String tab) {
    state = state.copyWith(selectedTab: tab);
  }

  void setRoleFilter(String role) {
    state = state.copyWith(selectedRoleFilter: role);
  }

  Future<Booking?> createBooking({
    required ProviderProfile provider,
    required DateTime startTime,
    required double durationHours,
    required String meetingAddress,
    String? specialRequests,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final auth = _ref.read(authControllerProvider);
      final currentUserId = auth.user?.id.isNotEmpty == true
          ? auth.user!.id
          : '6d59d945-c2ea-42e6-b195-34737b8cde33';
      final currentUserName = auth.user?.fullName.isNotEmpty == true
          ? auth.user!.fullName
          : 'Alex Seeker';

      final random = Random();
      final arrivalPin = (100000 + random.nextInt(900000)).toString();
      final completionPin = (100000 + random.nextInt(900000)).toString();

      final newBooking = Booking.create(
        orderId: 'ord-${DateTime.now().millisecondsSinceEpoch}',
        providerId: provider.id.isNotEmpty ? provider.id : '00000000-0000-0000-0000-000000000042',
        providerName: provider.name,
        providerInitials: provider.initials,
        providerPhotoUrl: provider.photoUrl,
        seekerId: currentUserId,
        seekerName: currentUserName,
        startTime: startTime,
        durationHours: durationHours,
        hourlyRate: provider.rate.toDouble(),
        meetingAddress: meetingAddress,
        specialRequests: specialRequests,
        status: BookingStatus.confirmed,
        arrivalPin: arrivalPin,
        completionPin: completionPin,
      );

      final created = await _repository.createBooking(newBooking);
      try {
        final paymentRepo = _ref.read(paymentRepositoryProvider);
        await paymentRepo.checkoutWithWallet(created.orderId);
      } catch (_) {
        // If wallet has insufficient funds, booking stays pendingPayment
      }
      final updatedList = [created, ...state.bookings];
      state = state.copyWith(bookings: updatedList, isLoading: false, error: null);
      return created;
    } catch (e) {
      final errorMessage = e is ApiException
          ? e.message
          : (e is ArgumentError ? e.message.toString() : 'Failed to request outing');
      state = state.copyWith(
        isLoading: false,
        error: errorMessage,
      );
      return null;
    }
  }

  Future<bool> checkInWithPin(String orderId, String pin) async {
    try {
      final updated = await _repository.checkInWithPin(orderId, pin);
      final list = state.bookings.map((b) => b.orderId == orderId ? updated : b).toList();
      state = state.copyWith(bookings: list, error: null);
      return true;
    } catch (e) {
      final msg = e is ApiException ? e.message : 'Check-in failed. Please verify the arrival PIN.';
      state = state.copyWith(error: msg);
      return false;
    }
  }

  Future<bool> completeWithPin(String orderId, String completionPin) async {
    try {
      final updated = await _repository.completeWithPin(orderId, completionPin);
      final list = state.bookings.map((b) => b.orderId == orderId ? updated : b).toList();
      state = state.copyWith(bookings: list, error: null);
      return true;
    } catch (e) {
      final msg = e is ApiException ? e.message : 'Outing completion failed. Please verify the completion PIN.';
      state = state.copyWith(error: msg);
      return false;
    }
  }

  Future<void> updateBookingStatus(String orderId, BookingStatus newStatus) async {
    try {
      final updated = await _repository.updateStatus(orderId, newStatus);
      final list = state.bookings.map((b) => b.orderId == orderId ? updated : b).toList();
      state = state.copyWith(bookings: list);
    } catch (_) {
      // Local fallback
      final list = state.bookings.map((b) {
        if (b.orderId == orderId) {
          return b.copyWith(status: newStatus);
        }
        return b;
      }).toList();
      state = state.copyWith(bookings: list);
    }
  }

  Future<bool> cancelBooking(String orderId, String reason) async {
    try {
      await _repository.updateStatus(orderId, BookingStatus.cancelled);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> reportSafetyIncident(
    String orderId, {
    required String reason,
    String? contactAlerted,
  }) async {
    final success = await _repository.reportSafetyIncident(
      orderId,
      reason: reason,
      contactAlerted: contactAlerted,
    );
    await loadBookings();
    return success;
  }

  Future<void> endOutingWithSafetyDispute(
    String orderId,
    String reason,
  ) async {
    await _repository.reportSafetyIncident(
      orderId,
      reason: 'Safety Incident Dispatched: $reason',
    );
    await updateBookingStatus(orderId, BookingStatus.disputed);
  }

  Future<void> payBooking(String orderId) async {
    try {
      final paymentRepo = _ref.read(paymentRepositoryProvider);
      await paymentRepo.checkoutWithWallet(orderId);
    } catch (_) {}
    await updateBookingStatus(orderId, BookingStatus.confirmed);
    await loadBookings();
  }

  Future<void> startBooking(String orderId) async {
    final b = state.bookings.firstWhere((item) => item.orderId == orderId,
        orElse: () => state.bookings.first);
    await checkInWithPin(orderId, b.arrivalPin ?? '482910');
  }

  Future<void> completeBooking(String orderId) async {
    final b = state.bookings.firstWhere((item) => item.orderId == orderId,
        orElse: () => state.bookings.first);
    await completeWithPin(orderId, b.completionPin ?? '739184');
  }

  Future<void> submitReview(
      String orderId, double rating, String comment) async {
    final list = state.bookings.map((b) {
      if (b.orderId == orderId) {
        return b.copyWith(hasReview: true);
      }
      return b;
    }).toList();
    state = state.copyWith(bookings: list);
  }
}

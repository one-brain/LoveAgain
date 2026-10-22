import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/booking_repository.dart';
import '../../models/booking.dart';
import '../../models/provider.dart';
import '../auth/auth_controller.dart';

final bookingRepositoryProvider = Provider<BookingRepository>(
  (ref) => BookingRepository(ref.read(apiClientProvider)),
);

class BookingsState {
  const BookingsState({
    this.bookings = const [],
    this.isLoading = false,
    this.error,
    this.selectedTab = 'active',
  });

  final List<Booking> bookings;
  final bool isLoading;
  final String? error;
  final String selectedTab;

  List<Booking> get activeBookings => bookings
      .where((b) =>
          b.status == BookingStatus.confirmed ||
          b.status == BookingStatus.pendingPayment ||
          b.status == BookingStatus.inProgress)
      .toList();

  List<Booking> get completedBookings =>
      bookings.where((b) => b.status == BookingStatus.completed).toList();

  List<Booking> get cancelledBookings =>
      bookings.where((b) => b.status == BookingStatus.cancelled).toList();

  List<Booking> get filteredBookings {
    switch (selectedTab) {
      case 'active':
        return activeBookings;
      case 'completed':
        return completedBookings;
      case 'cancelled':
        return cancelledBookings;
      default:
        return bookings;
    }
  }

  BookingsState copyWith({
    List<Booking>? bookings,
    bool? isLoading,
    String? error,
    String? selectedTab,
  }) {
    return BookingsState(
      bookings: bookings ?? this.bookings,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      selectedTab: selectedTab ?? this.selectedTab,
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
      state = state.copyWith(bookings: list, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Could not load bookings');
    }
  }

  void setTab(String tab) {
    state = state.copyWith(selectedTab: tab);
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
      final currentUserId = auth.user?.id ?? 'user-seeker-001';
      final currentUserName = auth.user?.fullName ?? 'Alex Rivera';

      final newBooking = Booking.create(
        orderId: 'ord-${DateTime.now().millisecondsSinceEpoch}',
        providerId: provider.id.isNotEmpty ? provider.id : 'prov-001',
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
      );

      final created = await _repository.createBooking(newBooking);
      final updatedList = [created, ...state.bookings];
      state = state.copyWith(bookings: updatedList, isLoading: false);
      return created;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e is ArgumentError ? e.message.toString() : 'Failed to request booking',
      );
      return null;
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

  Future<void> cancelBooking(String orderId, String reason) async {
    await updateBookingStatus(orderId, BookingStatus.cancelled);
  }

  Future<void> payBooking(String orderId) async {
    await updateBookingStatus(orderId, BookingStatus.confirmed);
  }

  Future<void> startBooking(String orderId) async {
    await updateBookingStatus(orderId, BookingStatus.inProgress);
  }

  Future<void> completeBooking(String orderId) async {
    await updateBookingStatus(orderId, BookingStatus.completed);
  }

  Future<void> submitReview(String orderId, double rating, String comment) async {
    final list = state.bookings.map((b) {
      if (b.orderId == orderId) {
        return b.copyWith(hasReview: true);
      }
      return b;
    }).toList();
    state = state.copyWith(bookings: list);
  }
}


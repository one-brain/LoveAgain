enum BookingStatus {
  pendingPayment,
  confirmed,
  inProgress,
  completed,
  cancelled,
  disputed;

  String get label {
    switch (this) {
      case BookingStatus.pendingPayment:
        return 'Pending Payment';
      case BookingStatus.confirmed:
        return 'Confirmed';
      case BookingStatus.inProgress:
        return 'In Progress';
      case BookingStatus.completed:
        return 'Completed';
      case BookingStatus.cancelled:
        return 'Cancelled';
      case BookingStatus.disputed:
        return 'Disputed';
    }
  }

  static BookingStatus fromString(String val) {
    switch (val.toLowerCase()) {
      case 'pendingpayment':
      case 'pending':
        return BookingStatus.pendingPayment;
      case 'confirmed':
        return BookingStatus.confirmed;
      case 'inprogress':
        return BookingStatus.inProgress;
      case 'completed':
        return BookingStatus.completed;
      case 'cancelled':
      case 'canceled':
        return BookingStatus.cancelled;
      case 'disputed':
        return BookingStatus.disputed;
      default:
        return BookingStatus.pendingPayment;
    }
  }
}

typedef Outing = Booking;
typedef OutingStatus = BookingStatus;

class Booking {
  const Booking({
    required this.orderId,
    required this.providerId,
    required this.providerName,
    required this.seekerId,
    required this.seekerName,
    required this.startTime,
    required this.endTime,
    required this.hourlyRate,
    required this.durationHours,
    required this.providerEarnings,
    required this.platformFee,
    required this.totalAmount,
    required this.status,
    this.providerInitials = '',
    this.providerPhotoUrl,
    this.meetingAddress = 'Indiranagar 100ft Road, Bengaluru',
    this.specialRequests,
    this.hasReview = false,
    this.createdAt,
    this.arrivalPin,
    this.completionPin,
  });

  final String orderId;
  final String providerId;
  final String providerName;
  final String providerInitials;
  final String? providerPhotoUrl;
  final String seekerId;
  final String seekerName;
  final DateTime startTime;
  final DateTime endTime;
  final double hourlyRate;
  final double durationHours;
  final double providerEarnings;
  final double platformFee;
  final double totalAmount;
  final BookingStatus status;
  final String meetingAddress;
  final String? specialRequests;
  final bool hasReview;
  final DateTime? createdAt;
  final String? arrivalPin;
  final String? completionPin;

  // Canonical Host & Guest Aliases
  String get hostId => providerId;
  String get hostName => providerName;
  String get hostInitials => providerInitials;
  String? get hostPhotoUrl => providerPhotoUrl;
  String get guestId => seekerId;
  String get guestName => seekerName;
  double get hostEarnings => providerEarnings;

  /// Invariant check as defined in CONTEXT.md & specs
  static void validateInvariants({
    required String seekerId,
    required String providerId,
    required DateTime startTime,
    required DateTime endTime,
    required double providerEarnings,
    required double platformFee,
    required double totalAmount,
  }) {
    if (seekerId == providerId) {
      throw ArgumentError('An outing must involve different guest and host users.');
    }
    if (!endTime.isAfter(startTime)) {
      throw ArgumentError('Booking end time must be strictly after start time.');
    }
    if (providerEarnings < 0 || platformFee < 0 || totalAmount < 0) {
      throw ArgumentError('Monetary values must be non-negative.');
    }
    // Epsilon comparison for floating point equality
    final diff = ((providerEarnings + platformFee) - totalAmount).abs();
    if (diff > 0.05) {
      throw ArgumentError(
        'Host earnings ($providerEarnings) plus platform fee ($platformFee) must equal total amount ($totalAmount).',
      );
    }
  }

  /// Factory helper that computes amounts using the platform fee (10%) and validates invariants
  factory Booking.create({
    required String orderId,
    required String providerId,
    required String providerName,
    required String providerInitials,
    required String seekerId,
    required String seekerName,
    required DateTime startTime,
    required double durationHours,
    required double hourlyRate,
    String? providerPhotoUrl,
    String meetingAddress = 'Indiranagar 100ft Road, Bengaluru',
    String? specialRequests,
    BookingStatus status = BookingStatus.pendingPayment,
    String? arrivalPin,
    String? completionPin,
  }) {
    final endTime = startTime.add(Duration(minutes: (durationHours * 60).round()));
    final baseEarnings = hourlyRate * durationHours;
    final platformFee = (baseEarnings * 0.10 * 100).round() / 100;
    final totalAmount = ((baseEarnings + platformFee) * 100).round() / 100;

    validateInvariants(
      seekerId: seekerId,
      providerId: providerId,
      startTime: startTime,
      endTime: endTime,
      providerEarnings: baseEarnings,
      platformFee: platformFee,
      totalAmount: totalAmount,
    );

    return Booking(
      orderId: orderId,
      providerId: providerId,
      providerName: providerName,
      providerInitials: providerInitials,
      providerPhotoUrl: providerPhotoUrl,
      seekerId: seekerId,
      seekerName: seekerName,
      startTime: startTime,
      endTime: endTime,
      hourlyRate: hourlyRate,
      durationHours: durationHours,
      providerEarnings: baseEarnings,
      platformFee: platformFee,
      totalAmount: totalAmount,
      status: status,
      meetingAddress: meetingAddress,
      specialRequests: specialRequests,
      createdAt: DateTime.now(),
      arrivalPin: arrivalPin,
      completionPin: completionPin,
    );
  }

  Booking copyWith({
    BookingStatus? status,
    bool? hasReview,
    String? specialRequests,
    String? meetingAddress,
    String? arrivalPin,
    String? completionPin,
  }) {
    return Booking(
      orderId: orderId,
      providerId: providerId,
      providerName: providerName,
      providerInitials: providerInitials,
      providerPhotoUrl: providerPhotoUrl,
      seekerId: seekerId,
      seekerName: seekerName,
      startTime: startTime,
      endTime: endTime,
      hourlyRate: hourlyRate,
      durationHours: durationHours,
      providerEarnings: providerEarnings,
      platformFee: platformFee,
      totalAmount: totalAmount,
      status: status ?? this.status,
      meetingAddress: meetingAddress ?? this.meetingAddress,
      specialRequests: specialRequests ?? this.specialRequests,
      hasReview: hasReview ?? this.hasReview,
      createdAt: createdAt,
      arrivalPin: arrivalPin ?? this.arrivalPin,
      completionPin: completionPin ?? this.completionPin,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'orderId': orderId,
      'providerId': providerId,
      'hostId': providerId,
      'providerName': providerName,
      'hostName': providerName,
      'providerInitials': providerInitials,
      'providerPhotoUrl': providerPhotoUrl,
      'seekerId': seekerId,
      'guestId': seekerId,
      'seekerName': seekerName,
      'guestName': seekerName,
      'startTime': startTime.toIso8601String(),
      'endTime': endTime.toIso8601String(),
      'hourlyRate': hourlyRate,
      'durationHours': durationHours,
      'providerEarnings': providerEarnings,
      'hostEarnings': providerEarnings,
      'platformFee': platformFee,
      'totalAmount': totalAmount,
      'status': status.name,
      'meetingAddress': meetingAddress,
      'specialRequests': specialRequests,
      'hasReview': hasReview,
      'createdAt': createdAt?.toIso8601String(),
      'arrivalPin': arrivalPin,
      'completionPin': completionPin,
    };
  }

  factory Booking.fromJson(Map<String, dynamic> json) {
    final start = DateTime.tryParse(json['startTime'] as String? ?? '') ?? DateTime.now();
    final end = DateTime.tryParse(json['endTime'] as String? ?? '') ?? start.add(const Duration(hours: 2));
    final durationHours = (json['durationHours'] as num?)?.toDouble() ??
        (end.difference(start).inMinutes / 60.0);
    final total = (json['totalAmount'] as num?)?.toDouble() ?? 1980.0;
    final fee = (json['platformFee'] as num?)?.toDouble() ?? (total * 0.10);
    final earnings = (json['providerEarnings'] as num?)?.toDouble() ??
        (json['hostEarnings'] as num?)?.toDouble() ??
        (total - fee);

    return Booking(
      orderId: json['orderId'] as String? ?? json['id'] as String? ?? '',
      providerId: json['providerId'] as String? ?? json['hostId'] as String? ?? '',
      providerName: json['providerName'] as String? ?? json['hostName'] as String? ?? 'Host',
      providerInitials: json['providerInitials'] as String? ?? json['hostInitials'] as String? ?? 'HT',
      providerPhotoUrl: json['providerPhotoUrl'] as String? ?? json['hostPhotoUrl'] as String?,
      seekerId: json['seekerId'] as String? ?? json['guestId'] as String? ?? '',
      seekerName: json['seekerName'] as String? ?? json['guestName'] as String? ?? 'Guest',
      startTime: start,
      endTime: end,
      hourlyRate: (json['hourlyRate'] as num?)?.toDouble() ?? 900.0,
      durationHours: durationHours > 0 ? durationHours : 2.0,
      providerEarnings: earnings,
      platformFee: fee,
      totalAmount: total,
      status: BookingStatus.fromString(json['status'] as String? ?? 'pendingPayment'),
      meetingAddress: json['meetingAddress'] as String? ?? 'Indiranagar 100ft Road, Bengaluru',
      specialRequests: json['specialRequests'] as String?,
      hasReview: json['hasReview'] as bool? ?? false,
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? ''),
      arrivalPin: json['arrivalPin'] as String? ?? json['checkInPin'] as String?,
      completionPin: json['completionPin'] as String?,
    );
  }
}

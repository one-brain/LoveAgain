class AvailabilitySlot {
  const AvailabilitySlot({
    required this.id,
    required this.providerId,
    required this.startTime,
    required this.endTime,
    this.isBooked = false,
    this.bookingId,
  });

  final String id;
  final String providerId;
  final DateTime startTime;
  final DateTime endTime;
  final bool isBooked;
  final String? bookingId;

  Map<String, dynamic> toJson() => {
        'id': id,
        'providerId': providerId,
        'startTime': startTime.toIso8601String(),
        'endTime': endTime.toIso8601String(),
        'isBooked': isBooked,
        'bookingId': bookingId,
      };

  factory AvailabilitySlot.fromJson(Map<String, dynamic> json) {
    return AvailabilitySlot(
      id: json['id'] as String? ?? json['slotId'] as String? ?? '',
      providerId: json['providerId'] as String? ?? '',
      startTime: DateTime.tryParse(json['startTime'] as String? ?? '') ??
          DateTime.now(),
      endTime: DateTime.tryParse(json['endTime'] as String? ?? '') ??
          DateTime.now().add(const Duration(hours: 2)),
      isBooked: json['isBooked'] as bool? ?? false,
      bookingId: json['bookingId'] as String?,
    );
  }
}

class ProviderReview {
  const ProviderReview({
    required this.id,
    required this.reviewerName,
    required this.rating,
    required this.comment,
    this.createdAt,
    this.orderId,
  });

  final String id;
  final String reviewerName;
  final double rating;
  final String comment;
  final DateTime? createdAt;
  final String? orderId;

  Map<String, dynamic> toJson() => {
        'id': id,
        'reviewerName': reviewerName,
        'rating': rating,
        'comment': comment,
        'createdAt': createdAt?.toIso8601String(),
        'orderId': orderId,
      };

  factory ProviderReview.fromJson(Map<String, dynamic> json) {
    return ProviderReview(
      id: json['id'] as String? ?? '',
      reviewerName: json['reviewerName'] as String? ?? 'Seeker',
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      comment: json['comment'] as String? ?? '',
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ??
          DateTime.now(),
      orderId: json['orderId'] as String?,
    );
  }
}

class ProviderProfile {
  const ProviderProfile({
    required this.name,
    required this.role,
    required this.city,
    required this.rate,
    required this.rating,
    required this.initials,
    required this.specialties,
    this.id = '',
    this.bio = '',
    this.trustScore = 92,
    this.isVerified = true,
    this.photoUrl,
    this.maxRadiusKm = 25,
    this.distanceKm,
    this.reviewCount = 18,
    this.upcomingSlots = const [],
    this.reviews = const [],
  });

  final String id;
  final String name;
  final String role;
  final String city;
  final int rate;
  final double rating;
  final String initials;
  final List<String> specialties;
  final String bio;
  final int trustScore;
  final bool isVerified;
  final String? photoUrl;
  final int maxRadiusKm;
  final double? distanceKm;
  final int reviewCount;
  final List<AvailabilitySlot> upcomingSlots;
  final List<ProviderReview> reviews;

  // Aliases for compatibility
  int get hourlyRate => rate;
  String get displayName => name;

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'role': role,
        'city': city,
        'rate': rate,
        'rating': rating,
        'initials': initials,
        'specialties': specialties,
        'bio': bio,
        'trustScore': trustScore,
        'isVerified': isVerified,
        'photoUrl': photoUrl,
        'maxRadiusKm': maxRadiusKm,
        'distanceKm': distanceKm,
        'reviewCount': reviewCount,
      };

  factory ProviderProfile.fromJson(Map<String, dynamic> json) {
    final rawName = json['displayName'] as String? ??
        json['name'] as String? ??
        'Companion';
    final nameParts = rawName.trim().split(' ');
    final initials = nameParts.length >= 2
        ? '${nameParts.first[0]}${nameParts.last[0]}'.toUpperCase()
        : rawName.isNotEmpty
            ? rawName.substring(0, 1).toUpperCase()
            : 'C';

    return ProviderProfile(
      id: json['providerId'] as String? ?? json['id'] as String? ?? '',
      name: rawName,
      role: json['role'] as String? ??
          (json['specialties'] as List<dynamic>?)?.firstOrNull?.toString() ??
          'Companion',
      city: json['city'] as String? ?? 'New York, NY',
      rate: (json['hourlyRate'] as num?)?.toInt() ??
          (json['rate'] as num?)?.toInt() ??
          45,
      rating: (json['averageRating'] as num?)?.toDouble() ??
          (json['rating'] as num?)?.toDouble() ??
          4.9,
      initials: initials,
      specialties: (json['specialties'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const ['Conversation', 'Art walks'],
      bio: json['bio'] as String? ?? '',
      trustScore: json['trustScore'] as int? ?? 90,
      isVerified: json['isVerified'] as bool? ?? true,
      photoUrl: json['photoUrl'] as String?,
      maxRadiusKm: json['maxRadiusKm'] as int? ?? 25,
      distanceKm: (json['distanceKm'] as num?)?.toDouble(),
      reviewCount: json['reviewCount'] as int? ?? 12,
      upcomingSlots: (json['upcomingSlots'] as List<dynamic>?)
              ?.map((s) => AvailabilitySlot.fromJson(s as Map<String, dynamic>))
              .toList() ??
          const [],
      reviews: (json['reviews'] as List<dynamic>?)
              ?.map((r) => ProviderReview.fromJson(r as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }
}

// Initial static seed providers
const providers = [
  ProviderProfile(
    id: 'prov-001',
    name: 'Maya Rodriguez',
    role: 'Museum & Art Companion',
    city: 'Brooklyn, NY',
    rate: 48,
    rating: 4.9,
    initials: 'MR',
    specialties: ['Art & Culture', 'Museum walks', 'Exhibitions', 'Quiet cafes'],
    bio:
        'Art history graduate passionate about contemporary galleries, quiet corners in museums, and thoughtful conversations about life and aesthetics.',
    trustScore: 98,
    isVerified: true,
    distanceKm: 2.4,
    reviewCount: 34,
    reviews: [
      ProviderReview(
        id: 'rev-01',
        reviewerName: 'Lucas M.',
        rating: 5.0,
        comment:
            'Maya made our visit to the Whitney museum unforgettable. Incredibly knowledgeable and relaxing presence.',
      ),
    ],
  ),
  ProviderProfile(
    id: 'prov-002',
    name: 'Jonah Kim',
    role: 'Language Exchange & Coffee',
    city: 'Manhattan, NY',
    rate: 36,
    rating: 4.8,
    initials: 'JK',
    specialties: ['Language Exchange', 'Korean', 'Coffee walks', 'Writing'],
    bio:
        'Bilingual writer and coffee aficionado. Patient language buddy for Korean and English practice over casual neighborhood strolls.',
    trustScore: 94,
    isVerified: true,
    distanceKm: 4.1,
    reviewCount: 22,
  ),
  ProviderProfile(
    id: 'prov-003',
    name: 'Celine Brooks',
    role: 'Event Plus-One & Networking',
    city: 'Queens, NY',
    rate: 62,
    rating: 5.0,
    initials: 'CB',
    specialties: ['Event Plus-One', 'Networking', 'Concerts', 'Dinner dates'],
    bio:
        'Polished, charismatic companion for corporate galas, gallery openings, friend gatherings, or live music where having good company elevates the night.',
    trustScore: 99,
    isVerified: true,
    distanceKm: 6.8,
    reviewCount: 47,
  ),
  ProviderProfile(
    id: 'prov-004',
    name: 'David Vance',
    role: 'Outdoor & Fitness Partner',
    city: 'Hoboken, NJ',
    rate: 40,
    rating: 4.9,
    initials: 'DV',
    specialties: ['Outdoor & Fitness', 'Running', 'Hiking', 'Central Park walks'],
    bio:
        'Amateur marathon runner and outdoor enthusiast. Great pacer, upbeat conversationalist, and reliable partner for morning trails.',
    trustScore: 91,
    isVerified: true,
    distanceKm: 5.3,
    reviewCount: 19,
  ),
  ProviderProfile(
    id: 'prov-005',
    name: 'Elena Rostova',
    role: 'Culinary & Dining Guide',
    city: 'SoHo, NY',
    rate: 55,
    rating: 4.95,
    initials: 'ER',
    specialties: ['Dining & Coffee', 'Food tours', 'Wine tasting', 'Culinary arts'],
    bio:
        'Culinary writer who loves finding hidden gem eateries, trying new cuisines, and sharing comfortable mealtime conversations.',
    trustScore: 96,
    isVerified: true,
    distanceKm: 1.8,
    reviewCount: 29,
  ),
];

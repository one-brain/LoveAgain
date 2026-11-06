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

  String get hostId => providerId;

  Map<String, dynamic> toJson() => {
        'id': id,
        'providerId': providerId,
        'hostId': providerId,
        'startTime': startTime.toIso8601String(),
        'endTime': endTime.toIso8601String(),
        'isBooked': isBooked,
        'bookingId': bookingId,
      };

  factory AvailabilitySlot.fromJson(Map<String, dynamic> json) {
    return AvailabilitySlot(
      id: json['id'] as String? ?? json['slotId'] as String? ?? '',
      providerId: json['providerId'] as String? ?? json['hostId'] as String? ?? '',
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
      reviewerName: json['reviewerName'] as String? ?? 'Guest',
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      comment: json['comment'] as String? ?? '',
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ??
          DateTime.now(),
      orderId: json['orderId'] as String?,
    );
  }
}

typedef HostReview = ProviderReview;
typedef HostProfile = ProviderProfile;

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
    this.trustScore = 95,
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

  // Canonical Host aliases
  String get hostId => id;
  String get hostName => name;
  String get hostInitials => initials;
  int get hourlyRate => rate;
  String get displayName => name;

  Map<String, dynamic> toJson() => {
        'id': id,
        'hostId': id,
        'name': name,
        'hostName': name,
        'role': role,
        'city': city,
        'rate': rate,
        'hourlyRate': rate,
        'rating': rating,
        'initials': initials,
        'hostInitials': initials,
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
        json['hostName'] as String? ??
        json['name'] as String? ??
        'Companion';
    final nameParts = rawName.trim().split(' ');
    final initials = nameParts.length >= 2
        ? '${nameParts.first[0]}${nameParts.last[0]}'.toUpperCase()
        : rawName.isNotEmpty
            ? rawName.substring(0, 1).toUpperCase()
            : 'C';

    return ProviderProfile(
      id: json['hostId'] as String? ??
          json['providerId'] as String? ??
          json['id'] as String? ??
          '',
      name: rawName,
      role: json['role'] as String? ??
          (json['specialties'] as List<dynamic>?)?.firstOrNull?.toString() ??
          'Curated Companion',
      city: json['city'] as String? ?? 'Bengaluru',
      rate: (json['hourlyRate'] as num?)?.toInt() ??
          (json['rate'] as num?)?.toInt() ??
          1200,
      rating: (json['averageRating'] as num?)?.toDouble() ??
          (json['rating'] as num?)?.toDouble() ??
          4.9,
      initials: initials,
      specialties: (json['specialties'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const ['Conversation', 'Art walks'],
      bio: json['bio'] as String? ?? '',
      trustScore: json['trustScore'] as int? ?? 95,
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

// Curated Indian metropolitan hosts
const providers = [
  ProviderProfile(
    id: 'prov-001',
    name: 'Ananya Sen',
    role: 'Art & Gallery Companion',
    city: 'Bengaluru (Indiranagar)',
    rate: 1500,
    rating: 4.95,
    initials: 'AS',
    specialties: ['Art & Culture', 'Gallery walks', 'Independent coffee', 'Architecture'],
    bio:
        'Curator and visual arts graduate. Passionate about local indie galleries, heritage architectural walks in Bangalore, and reflective conversations.',
    trustScore: 98,
    isVerified: true,
    distanceKm: 2.1,
    reviewCount: 38,
    reviews: [
      ProviderReview(
        id: 'rev-01',
        reviewerName: 'Rohan K.',
        rating: 5.0,
        comment:
            'Ananya was an absolute delight. Made our visit to the NGMA museum and gallery quiet, enriching, and very relaxing.',
      ),
    ],
  ),
  ProviderProfile(
    id: 'prov-002',
    name: 'Kabir Varma',
    role: 'Literature & Coffee Walks',
    city: 'Bengaluru (Koramangala)',
    rate: 1200,
    rating: 4.88,
    initials: 'KV',
    specialties: ['Coffee walks', 'Literature', 'Film discussion', 'Creative writing'],
    bio:
        'Bilingual writer and specialty pour-over enthusiast. Patient conversationalist for thoughtful dialogue over quiet evening cafes.',
    trustScore: 94,
    isVerified: true,
    distanceKm: 3.5,
    reviewCount: 26,
  ),
  ProviderProfile(
    id: 'prov-003',
    name: 'Tara Mehra',
    role: 'Symphony & Event Plus-One',
    city: 'Mumbai (Bandra West)',
    rate: 2200,
    rating: 5.0,
    initials: 'TM',
    specialties: ['Event Plus-One', 'Classical Music', 'Charity Galas', 'Fine Dining'],
    bio:
        'Polished and charismatic companion for classical concerts, corporate dinners, or cultural summits where gracious companionship elevates the evening.',
    trustScore: 99,
    isVerified: true,
    distanceKm: 5.4,
    reviewCount: 52,
  ),
  ProviderProfile(
    id: 'prov-004',
    name: 'Devansh Roy',
    role: 'Heritage Trail & Fitness Partner',
    city: 'Delhi (Hauz Khas)',
    rate: 1400,
    rating: 4.9,
    initials: 'DR',
    specialties: ['Heritage Trails', 'Morning walks', 'Photography', 'Outdoor & Fitness'],
    bio:
        'Architectural photographer and weekend runner. Knowledgeable companion for Lodhi Art District explorations and park trails.',
    trustScore: 92,
    isVerified: true,
    distanceKm: 4.2,
    reviewCount: 21,
  ),
  ProviderProfile(
    id: 'prov-005',
    name: 'Rhea Deshmukh',
    role: 'Culinary & Tea Tastings',
    city: 'Mumbai (Kala Ghoda)',
    rate: 1800,
    rating: 4.96,
    initials: 'RD',
    specialties: ['Culinary tours', 'Artisanal Tea', 'Historic cafes', 'Conversations'],
    bio:
        'Food anthropologist with an eye for South Mumbai heritage eateries, artisanal tea tastings, and relaxed, engaging discussions.',
    trustScore: 97,
    isVerified: true,
    distanceKm: 1.8,
    reviewCount: 31,
  ),
];

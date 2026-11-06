class User {
  const User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    this.roles = const ['Guest'],
    this.trustScore = 85,
    this.isVerified = false,
    this.photoUrl,
    this.bio,
    this.phone,
    this.city = 'Bengaluru',
  });

  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final List<String> roles;
  final int trustScore;
  final bool isVerified;
  final String? photoUrl;
  final String? bio;
  final String? phone;
  final String city;

  String get fullName => '$firstName $lastName'.trim();
  String get initials {
    final first = firstName.isNotEmpty ? firstName[0] : '';
    final last = lastName.isNotEmpty ? lastName[0] : '';
    return '$first$last'.toUpperCase();
  }

  // Canonical role getters
  bool get isHost => roles.contains('Host') || roles.contains('Provider');
  bool get isGuest => roles.contains('Guest') || roles.contains('Seeker');

  // Compatibility aliases
  bool get isProvider => isHost;
  bool get isSeeker => isGuest;

  User copyWith({
    String? id,
    String? email,
    String? firstName,
    String? lastName,
    List<String>? roles,
    int? trustScore,
    bool? isVerified,
    String? photoUrl,
    String? bio,
    String? phone,
    String? city,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      roles: roles ?? this.roles,
      trustScore: trustScore ?? this.trustScore,
      isVerified: isVerified ?? this.isVerified,
      photoUrl: photoUrl ?? this.photoUrl,
      bio: bio ?? this.bio,
      phone: phone ?? this.phone,
      city: city ?? this.city,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'roles': roles,
      'trustScore': trustScore,
      'isVerified': isVerified,
      'photoUrl': photoUrl,
      'bio': bio,
      'phone': phone,
      'city': city,
    };
  }

  factory User.fromJson(Map<String, dynamic> json) {
    final rawRoles = (json['roles'] as List<dynamic>?)
            ?.map((e) => e.toString())
            .toList() ??
        ['Guest'];

    // Normalize legacy roles to canonical Host/Guest
    final normalizedRoles = rawRoles.map((r) {
      if (r == 'Provider') return 'Host';
      if (r == 'Seeker') return 'Guest';
      return r;
    }).toList();

    return User(
      id: json['id'] as String? ?? json['userId'] as String? ?? '',
      email: json['email'] as String? ?? '',
      firstName: json['firstName'] as String? ?? '',
      lastName: json['lastName'] as String? ?? '',
      roles: normalizedRoles,
      trustScore: json['trustScore'] as int? ?? 85,
      isVerified: json['isVerified'] as bool? ?? false,
      photoUrl: json['photoUrl'] as String?,
      bio: json['bio'] as String?,
      phone: json['phone'] as String?,
      city: json['city'] as String? ?? 'Bengaluru',
    );
  }
}

class User {
  const User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    this.roles = const ['Seeker'],
    this.trustScore = 80,
    this.isVerified = false,
    this.photoUrl,
    this.bio,
    this.phone,
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

  String get fullName => '$firstName $lastName'.trim();
  String get initials {
    final first = firstName.isNotEmpty ? firstName[0] : '';
    final last = lastName.isNotEmpty ? lastName[0] : '';
    return '$first$last'.toUpperCase();
  }

  bool get isProvider => roles.contains('Provider');
  bool get isSeeker => roles.contains('Seeker');

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
    };
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String? ?? json['userId'] as String? ?? '',
      email: json['email'] as String? ?? '',
      firstName: json['firstName'] as String? ?? '',
      lastName: json['lastName'] as String? ?? '',
      roles: (json['roles'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          ['Seeker'],
      trustScore: json['trustScore'] as int? ?? 80,
      isVerified: json['isVerified'] as bool? ?? false,
      photoUrl: json['photoUrl'] as String?,
      bio: json['bio'] as String?,
      phone: json['phone'] as String?,
    );
  }
}


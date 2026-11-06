import '../../core/api_client.dart';
import '../../models/user.dart';

class AuthResult {
  const AuthResult({required this.token, required this.user});
  final String token;
  final User user;
}

class AuthRepository {
  AuthRepository(this._api);

  final ApiClient _api;

  Future<AuthResult> login({
    required String email,
    required String password,
  }) async {
    final response = await _api.post<Map<String, dynamic>>(
      '/auth/login',
      data: {'email': email.trim().toLowerCase(), 'password': password},
    );

    if (response.statusCode == 200 && response.data != null) {
      final data = response.data!;
      final token = data['accessToken'] as String? ?? '';
      final userData = data['user'] as Map<String, dynamic>?;
      final user = userData != null
          ? User.fromJson(userData)
          : User(
              id: data['userId'] as String? ?? '',
              email: email,
              firstName: email.split('@').first,
              lastName: '',
              roles: const ['Guest'],
            );
      _api.setAccessToken(token);
      return AuthResult(token: token, user: user);
    }

    throw ApiException(
      message: 'Invalid credentials or user not found.',
      statusCode: response.statusCode,
    );
  }

  Future<bool> requestOtp({required String email}) async {
    final isEmail = email.contains('@');
    final endpoint = isEmail ? '/auth/login-otp' : '/auth/mobile/send-otp';
    final payload = isEmail ? {'email': email.trim().toLowerCase()} : {'phone': email.trim()};

    final response = await _api.post<Map<String, dynamic>>(
      endpoint,
      data: payload,
    );
    return response.statusCode == 200;
  }

  Future<AuthResult> verifyOtp({
    required String email,
    required String code,
  }) async {
    final isEmail = email.contains('@');
    final endpoint = isEmail ? '/auth/verify-otp' : '/auth/mobile/verify-otp';
    final payload = isEmail
        ? {'email': email.trim().toLowerCase(), 'code': code.trim()}
        : {'phone': email.trim(), 'otp': code.trim()};

    final response = await _api.post<Map<String, dynamic>>(
      endpoint,
      data: payload,
    );

    if (response.statusCode == 200 && response.data != null) {
      final data = response.data!;
      final tokens = data['tokens'] as Map<String, dynamic>? ?? data;
      final token = tokens['accessToken'] as String? ?? '';
      final userData = tokens['user'] as Map<String, dynamic>?;

      final user = userData != null
          ? User.fromJson(userData)
          : User(
              id: data['userId'] as String? ?? 'user-live',
              email: email,
              firstName: email.split('@').first,
              lastName: '',
              roles: const ['Guest'],
            );
      _api.setAccessToken(token);
      return AuthResult(token: token, user: user);
    }

    throw ApiException(
      message: 'Invalid or expired OTP code.',
      statusCode: response.statusCode,
    );
  }

  Future<AuthResult> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required List<String> roles,
    String? dateOfBirth,
  }) async {
    final canonicalRoles = roles.map((r) {
      if (r == 'Provider') return 'Host';
      if (r == 'Seeker') return 'Guest';
      return r;
    }).toList();

    final response = await _api.post<Map<String, dynamic>>(
      '/auth/register',
      data: {
        'email': email.trim().toLowerCase(),
        'password': password,
        'firstName': firstName.trim(),
        'lastName': lastName.trim(),
        'roles': canonicalRoles,
        'dateOfBirth': dateOfBirth ?? '1995-01-01',
      },
    );

    if ((response.statusCode == 200 || response.statusCode == 201) && response.data != null) {
      final data = response.data!;
      final token = data['accessToken'] as String? ?? '';
      final userData = data['user'] as Map<String, dynamic>?;

      final user = userData != null
          ? User.fromJson(userData)
          : User(
              id: data['userId'] as String? ?? '',
              email: email,
              firstName: firstName,
              lastName: lastName,
              roles: canonicalRoles,
            );
      _api.setAccessToken(token);
      return AuthResult(token: token, user: user);
    }

    throw ApiException(
      message: 'Registration failed. Please check your details.',
      statusCode: response.statusCode,
    );
  }
}

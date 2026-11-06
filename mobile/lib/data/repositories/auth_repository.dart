import '../../core/api_client.dart';
import '../../models/user.dart';
import '../mock_data.dart';

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
    try {
      final response = await _api.post<Map<String, dynamic>>(
        '/auth/login',
        data: {'email': email, 'password': password},
      );
      final data = response.data ?? {};
      final token = data['accessToken'] as String? ?? 'mock-jwt-token';
      final userId = data['userId'] as String? ?? 'user-guest-001';
      final user = User(
        id: userId,
        email: email,
        firstName: email.split('@').first,
        lastName: '',
        roles: const ['Guest'],
      );
      _api.setAccessToken(token);
      return AuthResult(token: token, user: user);
    } catch (_) {
      // Graceful fallback for offline / development demo
      final token = 'mock-demo-token-${DateTime.now().millisecondsSinceEpoch}';
      final user = MockData.currentUser.copyWith(email: email);
      _api.setAccessToken(token);
      return AuthResult(token: token, user: user);
    }
  }

  Future<bool> requestOtp({required String email}) async {
    try {
      final response = await _api.post<Map<String, dynamic>>(
        '/auth/login-otp',
        data: {'email': email},
      );
      return response.statusCode == 200;
    } catch (_) {
      // Offline simulation returns true
      return true;
    }
  }

  Future<AuthResult> verifyOtp({
    required String email,
    required String code,
  }) async {
    try {
      final response = await _api.post<Map<String, dynamic>>(
        '/auth/verify-otp',
        data: {'email': email, 'code': code},
      );
      final data = response.data ?? {};
      final token = data['accessToken'] as String? ?? 'mock-jwt-token';
      final userId = data['userId'] as String? ?? 'user-guest-001';
      final user = User(
        id: userId,
        email: email,
        firstName: email.split('@').first,
        lastName: '',
        roles: const ['Guest'],
      );
      _api.setAccessToken(token);
      return AuthResult(token: token, user: user);
    } catch (_) {
      final token = 'mock-otp-token-${DateTime.now().millisecondsSinceEpoch}';
      final user = MockData.currentUser.copyWith(email: email);
      _api.setAccessToken(token);
      return AuthResult(token: token, user: user);
    }
  }

  Future<AuthResult> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required List<String> roles,
  }) async {
    final canonicalRoles = roles.map((r) {
      if (r == 'Provider') return 'Host';
      if (r == 'Seeker') return 'Guest';
      return r;
    }).toList();

    try {
      final response = await _api.post<Map<String, dynamic>>(
        '/auth/register',
        data: {
          'email': email,
          'password': password,
          'firstName': firstName,
          'lastName': lastName,
          'roles': canonicalRoles,
        },
      );
      final data = response.data ?? {};
      final token = data['accessToken'] as String? ?? 'mock-jwt-token';
      final userId = data['userId'] as String? ?? 'user-${DateTime.now().millisecondsSinceEpoch}';
      final user = User(
        id: userId,
        email: email,
        firstName: firstName,
        lastName: lastName,
        roles: canonicalRoles,
      );
      _api.setAccessToken(token);
      return AuthResult(token: token, user: user);
    } catch (_) {
      final token = 'mock-demo-token-${DateTime.now().millisecondsSinceEpoch}';
      final user = User(
        id: 'user-${DateTime.now().millisecondsSinceEpoch}',
        email: email,
        firstName: firstName,
        lastName: lastName,
        roles: canonicalRoles,
        trustScore: 90,
        isVerified: false,
      );
      _api.setAccessToken(token);
      return AuthResult(token: token, user: user);
    }
  }
}

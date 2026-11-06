import '../../core/api_client.dart';
import '../../models/user.dart';

class AuthResult {
  const AuthResult({required this.token, required this.user});
  final String token;
  final User user;
}

class MobileOtpResponse {
  const MobileOtpResponse({
    required this.message,
    required this.expiresInSeconds,
    this.devOtp,
  });

  final String message;
  final int expiresInSeconds;
  final String? devOtp;
}

class VerifyMobileOtpResult {
  const VerifyMobileOtpResult({
    required this.isNewUser,
    this.message,
    this.authResult,
  });

  final bool isNewUser;
  final String? message;
  final AuthResult? authResult;
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

  Future<MobileOtpResponse> sendMobileOtp({
    required String phone,
    String? purpose,
  }) async {
    final response = await _api.post<Map<String, dynamic>>(
      '/auth/mobile/send-otp',
      data: {
        'phone': phone.trim(),
        if (purpose != null) 'purpose': purpose,
      },
    );

    if (response.statusCode == 200 && response.data != null) {
      final data = response.data!;
      return MobileOtpResponse(
        message: data['message'] as String? ?? 'Verification code sent.',
        expiresInSeconds: data['expiresInSeconds'] as int? ?? 300,
        devOtp: data['devOtp'] as String?,
      );
    }

    throw ApiException(
      message: response.data?['error'] as String? ?? 'Failed to send OTP. Please check your number.',
      statusCode: response.statusCode,
    );
  }

  Future<VerifyMobileOtpResult> verifyMobileOtp({
    required String phone,
    required String otp,
    String? firstName,
    String? lastName,
    String? dateOfBirth,
  }) async {
    final Map<String, dynamic> payload = {
      'phone': phone.trim(),
      'otp': otp.trim(),
    };
    if (firstName != null && firstName.trim().isNotEmpty) {
      payload['firstName'] = firstName.trim();
      payload['lastName'] = lastName?.trim() ?? '';
      payload['dateOfBirth'] = dateOfBirth ?? '1995-01-01';
    }

    final response = await _api.post<Map<String, dynamic>>(
      '/auth/mobile/verify-otp',
      data: payload,
    );

    if (response.statusCode == 200 && response.data != null) {
      final data = response.data!;
      final isNewUser = data['isNewUser'] as bool? ?? false;
      if (isNewUser) {
        return VerifyMobileOtpResult(
          isNewUser: true,
          message: data['message'] as String? ??
              'Mobile verified. Please provide your name to finish registration.',
        );
      }

      final tokens = data['tokens'] as Map<String, dynamic>? ?? data;
      final token = tokens['accessToken'] as String? ?? '';
      final userData = tokens['user'] as Map<String, dynamic>?;

      final user = userData != null
          ? User.fromJson(userData)
          : User(
              id: data['userId'] as String? ?? 'user-live',
              email: 'user_${phone.replaceAll(RegExp(r'\D'), '')}@cue.local',
              firstName: firstName ?? 'Member',
              lastName: lastName ?? '',
              phone: phone,
              roles: const ['Guest'],
            );
      if (token.isNotEmpty) {
        _api.setAccessToken(token);
      }
      return VerifyMobileOtpResult(
        isNewUser: false,
        authResult: AuthResult(token: token, user: user),
      );
    }

    throw ApiException(
      message: response.data?['error'] as String? ?? 'Invalid or expired verification code.',
      statusCode: response.statusCode,
    );
  }

  Future<bool> requestOtp({required String email}) async {
    final isEmail = email.contains('@');
    if (!isEmail) {
      await sendMobileOtp(phone: email);
      return true;
    }
    final response = await _api.post<Map<String, dynamic>>(
      '/auth/login-otp',
      data: {'email': email.trim().toLowerCase()},
    );
    return response.statusCode == 200;
  }

  Future<AuthResult> verifyOtp({
    required String email,
    required String code,
    String? firstName,
    String? lastName,
  }) async {
    final isEmail = email.contains('@');
    if (!isEmail) {
      final result = await verifyMobileOtp(
        phone: email,
        otp: code,
        firstName: firstName,
        lastName: lastName,
      );
      if (result.authResult != null) {
        return result.authResult!;
      }
      throw ApiException(
        message: result.message ?? 'Registration details needed.',
      );
    }

    final response = await _api.post<Map<String, dynamic>>(
      '/auth/verify-otp',
      data: {'email': email.trim().toLowerCase(), 'code': code.trim()},
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

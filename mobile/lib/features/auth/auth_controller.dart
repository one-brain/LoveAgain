import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/api_client.dart';
import '../../core/constants.dart';
import '../../data/mock_data.dart';
import '../../data/repositories/auth_repository.dart';
import '../../models/user.dart';

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepository(ref.read(apiClientProvider)),
);

class AuthState {
  const AuthState({
    this.token,
    this.user,
    this.isLoading = false,
    this.error,
    this.activeRole = 'Guest',
    this.isOtpSent = false,
    this.pendingEmail,
  });

  final String? token;
  final User? user;
  final bool isLoading;
  final String? error;
  final String activeRole;
  final bool isOtpSent;
  final String? pendingEmail;

  bool get isAuthenticated => token != null && token!.isNotEmpty;
  bool get isHostMode => activeRole == 'Host' || activeRole == 'Provider';
  bool get isGuestMode => activeRole == 'Guest' || activeRole == 'Seeker';

  // Backward compatibility alias
  bool get isProviderMode => isHostMode;

  AuthState copyWith({
    String? token,
    User? user,
    bool? isLoading,
    String? error,
    String? activeRole,
    bool? isOtpSent,
    String? pendingEmail,
  }) {
    return AuthState(
      token: token ?? this.token,
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      activeRole: activeRole ?? this.activeRole,
      isOtpSent: isOtpSent ?? this.isOtpSent,
      pendingEmail: pendingEmail ?? this.pendingEmail,
    );
  }
}

final authControllerProvider = StateNotifierProvider<AuthController, AuthState>(
  (ref) => AuthController(
    ref.read(authRepositoryProvider),
    ref.read(apiClientProvider),
  ),
);

class AuthController extends StateNotifier<AuthState> {
  AuthController(this._repository, this._api)
      : super(const AuthState(
          token: 'cue-demo-jwt-token',
          user: MockData.currentUser,
          activeRole: 'Guest',
        )) {
    restore();
  }

  final AuthRepository _repository;
  final ApiClient _api;

  Future<void> restore() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(AppConstants.tokenKey);
      final userJson = prefs.getString(AppConstants.userKey);
      final rawRole = prefs.getString(AppConstants.userRoleKey) ?? 'Guest';
      final role = (rawRole == 'Provider' || rawRole == 'Host') ? 'Host' : 'Guest';

      final signedOut = prefs.getBool('cue.signedOut') ?? false;

      if (token != null && token.isNotEmpty) {
        _api.setAccessToken(token);
        User? user;
        if (userJson != null) {
          try {
            user = User.fromJson(jsonDecode(userJson) as Map<String, dynamic>);
          } catch (_) {
            user = MockData.currentUser;
          }
        } else {
          user = MockData.currentUser;
        }

        state = AuthState(
          token: token,
          user: user,
          activeRole: role,
        );
      } else if (!signedOut) {
        const demoToken = 'cue-demo-jwt-token';
        _api.setAccessToken(demoToken);
        state = const AuthState(
          token: demoToken,
          user: MockData.currentUser,
          activeRole: 'Guest',
        );
      } else {
        state = const AuthState();
      }
    } catch (_) {
      // Ignore restore errors
    }
  }

  Future<bool> requestOtp(String email) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final ok = await _repository.requestOtp(email: email);
      if (ok) {
        state = state.copyWith(
          isLoading: false,
          isOtpSent: true,
          pendingEmail: email,
        );
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: 'Unable to send OTP. Please try again.',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Network error requesting OTP.',
      );
      return false;
    }
  }

  Future<bool> verifyOtp(String email, String code) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final result = await _repository.verifyOtp(email: email, code: code);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConstants.tokenKey, result.token);
      await prefs.setString(AppConstants.userKey, jsonEncode(result.user.toJson()));
      await prefs.remove('cue.signedOut');

      state = AuthState(
        token: result.token,
        user: result.user,
        activeRole: state.activeRole,
        isOtpSent: false,
        pendingEmail: null,
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Invalid OTP code. Please verify and try again.',
      );
      return false;
    }
  }

  Future<bool> login(String email, String password) async {
    state = AuthState(isLoading: true, activeRole: state.activeRole);
    try {
      final result = await _repository.login(email: email, password: password);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConstants.tokenKey, result.token);
      await prefs.setString(AppConstants.userKey, jsonEncode(result.user.toJson()));
      await prefs.remove('cue.signedOut');

      state = AuthState(
        token: result.token,
        user: result.user,
        activeRole: state.activeRole,
      );
      return true;
    } catch (e) {
      state = AuthState(
        error: 'Unable to sign in. Please verify your credentials.',
        activeRole: state.activeRole,
      );
      return false;
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required List<String> roles,
  }) async {
    state = AuthState(isLoading: true, activeRole: state.activeRole);
    try {
      final canonicalRoles = roles.map((r) => r == 'Provider' ? 'Host' : (r == 'Seeker' ? 'Guest' : r)).toList();
      final result = await _repository.register(
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        roles: canonicalRoles,
      );
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConstants.tokenKey, result.token);
      await prefs.setString(AppConstants.userKey, jsonEncode(result.user.toJson()));
      await prefs.remove('cue.signedOut');

      state = AuthState(
        token: result.token,
        user: result.user,
        activeRole: canonicalRoles.contains('Host') ? 'Host' : 'Guest',
      );
      return true;
    } catch (e) {
      state = AuthState(
        error: 'Registration failed. Please try again.',
        activeRole: state.activeRole,
      );
      return false;
    }
  }

  void toggleRole() {
    final newRole = state.isHostMode ? 'Guest' : 'Host';
    state = AuthState(
      token: state.token,
      user: state.user,
      activeRole: newRole,
    );
    SharedPreferences.getInstance().then((p) => p.setString(AppConstants.userRoleKey, newRole));
  }

  void resetOtp() {
    state = state.copyWith(isOtpSent: false, pendingEmail: null, error: null);
  }

  Future<void> signOut() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.tokenKey);
    await prefs.remove(AppConstants.userKey);
    await prefs.setBool('cue.signedOut', true);
    _api.setAccessToken(null);
    state = const AuthState();
  }
}

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/api_client.dart';

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

final authControllerProvider = StateNotifierProvider<AuthController, AuthState>(
    (ref) => AuthController(ref.read(apiClientProvider)));

class AuthState {
  const AuthState({this.token, this.isLoading = false, this.error});
  final String? token;
  final bool isLoading;
  final String? error;
  bool get isAuthenticated => token != null;
}

class AuthController extends StateNotifier<AuthState> {
  AuthController(this._api) : super(const AuthState());

  final ApiClient _api;

  Future<void> restore() async {
    final preferences = await SharedPreferences.getInstance();
    final token = preferences.getString('cue.accessToken');
    if (token != null) {
      _api.setAccessToken(token);
      state = AuthState(token: token);
    }
  }

  Future<bool> login(String email, String password) async {
    state = const AuthState(isLoading: true);
    try {
      final response = await _api.login(email: email, password: password);
      final token = response['accessToken'] as String?;
      if (token == null || token.isEmpty)
        throw const FormatException(
            'Authentication response did not contain an access token.');
      final preferences = await SharedPreferences.getInstance();
      await preferences.setString('cue.accessToken', token);
      _api.setAccessToken(token);
      state = AuthState(token: token);
      return true;
    } catch (_) {
      state = const AuthState(
          error: 'Unable to sign in. Check your details and try again.');
      return false;
    }
  }

  Future<void> signOut() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.remove('cue.accessToken');
    state = const AuthState();
  }
}

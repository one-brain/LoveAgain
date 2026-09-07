import 'package:dio/dio.dart';

class ApiClient {
  ApiClient({Dio? dio})
      : _dio = dio ??
            Dio(BaseOptions(
                baseUrl: const String.fromEnvironment('CUE_AUTH_API_URL',
                    defaultValue: 'http://localhost:5001/api/v1/auth')));

  final Dio _dio;

  Future<Map<String, dynamic>> login(
      {required String email, required String password}) async {
    final response = await _dio.post<Map<String, dynamic>>('/login',
        data: {'email': email, 'password': password});
    return response.data ?? <String, dynamic>{};
  }

  void setAccessToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }
}

import 'package:dio/dio.dart';
import 'constants.dart';

class ApiException implements Exception {
  const ApiException({
    required this.message,
    this.statusCode,
    this.data,
  });

  final String message;
  final int? statusCode;
  final dynamic data;

  factory ApiException.fromDioException(DioException e) {
    String msg = 'An unexpected error occurred. Please try again.';
    final res = e.response;

    if (res?.data != null) {
      final resData = res!.data;
      if (resData is Map) {
        if (resData['error'] != null) {
          msg = resData['error'].toString();
        } else if (resData['message'] != null) {
          msg = resData['message'].toString();
        } else if (resData['errors'] != null) {
          final errs = resData['errors'];
          if (errs is Map) {
            msg = errs.values.map((v) => v is List ? v.join(', ') : v.toString()).join('\n');
          } else {
            msg = errs.toString();
          }
        }
      } else if (resData is String && resData.isNotEmpty) {
        msg = resData;
      }
    } else if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout ||
        e.type == DioExceptionType.sendTimeout) {
      msg = 'Connection timed out. Please check your network connection.';
    } else if (e.type == DioExceptionType.connectionError) {
      msg = 'Cannot connect to Cue service. Please check your network connection.';
    }

    return ApiException(
      message: msg,
      statusCode: res?.statusCode,
      data: res?.data,
    );
  }

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({Dio? dio})
      : _dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: AppConstants.defaultApiUrl,
                connectTimeout: const Duration(seconds: 8),
                receiveTimeout: const Duration(seconds: 8),
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
              ),
            );

  final Dio _dio;

  Dio get dio => _dio;

  void setAccessToken(String? token) {
    if (token != null && token.isNotEmpty) {
      _dio.options.headers['Authorization'] = 'Bearer $token';
    } else {
      _dio.options.headers.remove('Authorization');
    }
  }

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) {
    return _dio.get<T>(path, queryParameters: queryParameters);
  }

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
  }) {
    return _dio.post<T>(path, data: data);
  }

  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
  }) {
    return _dio.patch<T>(path, data: data);
  }

  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
  }) {
    return _dio.delete<T>(path, data: data);
  }
}

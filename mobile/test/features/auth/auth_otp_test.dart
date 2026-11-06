import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cue_mobile/core/api_client.dart';
import 'package:cue_mobile/core/constants.dart';
import 'package:cue_mobile/data/repositories/auth_repository.dart';
import 'package:cue_mobile/features/auth/auth_controller.dart';
import 'package:cue_mobile/features/auth/otp_verification_screen.dart';

class FakeAuthApiClient extends ApiClient {
  FakeAuthApiClient() : super(dio: Dio());

  @override
  Future<Response<T>> post<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters}) async {
    if (path.contains('/auth/login')) {
      return Response<T>(
        data: {
          'token': 'jwt_mock_token_123',
          'user': {
            'id': 'user-live-001',
            'email': 'alex.seeker@cue.local',
            'firstName': 'Alex',
            'lastName': 'Seeker',
            'roles': ['Guest'],
            'trustScore': 95,
            'isVerified': true,
          },
        } as T,
        statusCode: 200,
        requestOptions: RequestOptions(path: path),
      );
    }
    if (path.contains('/auth/login-otp') || path.contains('/auth/mobile/send-otp')) {
      return Response<T>(
        data: {'message': 'OTP sent successfully', 'expiresInSeconds': 300} as T,
        statusCode: 200,
        requestOptions: RequestOptions(path: path),
      );
    }
    if (path.contains('/auth/verify-otp') || path.contains('/auth/mobile/verify-otp')) {
      return Response<T>(
        data: {
          'tokens': {
            'accessToken': 'jwt_mock_token_123',
            'user': {
              'id': 'user-live-001',
              'email': (data?['email'] ?? 'alex.rivera@example.com'),
              'firstName': 'Alex',
              'lastName': 'Rivera',
              'roles': ['Guest'],
              'trustScore': 95,
              'isVerified': true,
            },
          },
        } as T,
        statusCode: 200,
        requestOptions: RequestOptions(path: path),
      );
    }
    return Response<T>(
      data: {} as T,
      statusCode: 200,
      requestOptions: RequestOptions(path: path),
    );
  }
}

void main() {
  group('AuthRepository OTP Flow', () {
    late AuthRepository repository;

    setUp(() {
      repository = AuthRepository(FakeAuthApiClient());
    });

    test('requestOtp sends OTP request successfully', () async {
      final success = await repository.requestOtp(email: 'alex.rivera@example.com');
      expect(success, true);
    });

    test('verifyOtp returns valid AuthResult and sets token', () async {
      final result = await repository.verifyOtp(
        email: 'alex.rivera@example.com',
        code: '123456',
      );
      expect(result.token.isNotEmpty, true);
      expect(result.user.email, 'alex.rivera@example.com');
      expect(result.user.isGuest, true);
    });
  });

  group('OtpVerificationScreen Widget Tests', () {
    testWidgets('renders 6 segmented digit fields and email address',
        (WidgetTester tester) async {
      SharedPreferences.setMockInitialValues({
        AppConstants.tokenKey: 'mock-jwt-token',
      });
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            apiClientProvider.overrideWithValue(FakeAuthApiClient()),
          ],
          child: const MaterialApp(
            home: OtpVerificationScreen(email: 'test.member@example.com'),
          ),
        ),
      );
      await tester.pump();
      await tester.pump();

      // Verify email is displayed
      expect(find.textContaining('test.member@example.com'), findsOneWidget);

      // Verify 6 digit TextFields
      expect(find.byType(TextField), findsNWidgets(6));

      // Verify CTA button
      expect(find.text('Verify & Continue'), findsOneWidget);

      // Verify countdown timer text
      expect(find.textContaining('Resend in'), findsOneWidget);
    });
  });
}

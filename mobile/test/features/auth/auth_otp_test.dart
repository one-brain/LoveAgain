import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cue_mobile/core/api_client.dart';
import 'package:cue_mobile/core/constants.dart';
import 'package:cue_mobile/data/repositories/auth_repository.dart';
import 'package:cue_mobile/features/auth/auth_controller.dart';
import 'package:cue_mobile/features/auth/login_screen.dart';
import 'package:cue_mobile/features/auth/otp_verification_screen.dart';
import 'package:cue_mobile/features/auth/profile_setup_screen.dart';

class FakeAuthApiClient extends ApiClient {
  FakeAuthApiClient({this.simulateNewUser = false}) : super(dio: Dio());

  final bool simulateNewUser;

  @override
  Future<Response<T>> post<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters}) async {
    if (path.contains('/auth/login')) {
      return Response<T>(
        data: {
          'accessToken': 'jwt_mock_token_123',
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
      if (simulateNewUser && (data?['firstName'] == null || (data?['firstName'] as String).isEmpty)) {
        return Response<T>(
          data: {
            'isNewUser': true,
            'message': 'Mobile verified. Please provide your name to finish registration.',
          } as T,
          statusCode: 200,
          requestOptions: RequestOptions(path: path),
        );
      }
      return Response<T>(
        data: {
          'isNewUser': false,
          'tokens': {
            'accessToken': 'jwt_mock_token_123',
            'user': {
              'id': 'user-live-001',
              'email': (data?['phone'] != null
                  ? 'user_${(data?['phone'] as String).replaceAll(RegExp(r'\D'), '')}@cue.local'
                  : 'alex.rivera@example.com'),
              'firstName': data?['firstName'] ?? 'Alex',
              'lastName': data?['lastName'] ?? 'Rivera',
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
  group('AuthRepository Unified Auth Parity', () {
    late AuthRepository repository;

    setUp(() {
      repository = AuthRepository(FakeAuthApiClient());
    });

    test('sendMobileOtp dispatches OTP request for phone number', () async {
      final res = await repository.sendMobileOtp(phone: '+919900000003');
      expect(res.message, 'OTP sent successfully');
      expect(res.expiresInSeconds, 300);
    });

    test('verifyMobileOtp returns AuthResult for existing user', () async {
      final result = await repository.verifyMobileOtp(
        phone: '+919900000003',
        otp: '123456',
      );
      expect(result.isNewUser, false);
      expect(result.authResult, isNotNull);
      expect(result.authResult!.token, 'jwt_mock_token_123');
      expect(result.authResult!.user.isGuest, true);
    });

    test('verifyMobileOtp recognizes new user and completes setup with name', () async {
      final newUserRepo = AuthRepository(FakeAuthApiClient(simulateNewUser: true));
      final initialResult = await newUserRepo.verifyMobileOtp(
        phone: '+919900000099',
        otp: '123456',
      );
      expect(initialResult.isNewUser, true);
      expect(initialResult.authResult, isNull);

      final completedResult = await newUserRepo.verifyMobileOtp(
        phone: '+919900000099',
        otp: '', // Phone already validated
        firstName: 'Maya',
        lastName: 'Chen',
      );
      expect(completedResult.isNewUser, false);
      expect(completedResult.authResult, isNotNull);
      expect(completedResult.authResult!.user.firstName, 'Maya');
    });

    test('login with email and password returns valid AuthResult', () async {
      final result = await repository.login(
        email: 'alex.seeker@cue.local',
        password: 'CueDemo123!',
      );
      expect(result.token, 'jwt_mock_token_123');
      expect(result.user.email, 'alex.seeker@cue.local');
    });
  });

  group('LoginScreen Unified Dual-Tab Widget Tests', () {
    testWidgets('renders dual tabs (Mobile & OTP, Email & Password) and defaults to Mobile OTP',
        (WidgetTester tester) async {
      SharedPreferences.setMockInitialValues({});
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            apiClientProvider.overrideWithValue(FakeAuthApiClient()),
          ],
          child: const MaterialApp(
            home: LoginScreen(),
          ),
        ),
      );
      await tester.pump();

      // Check segmented tabs
      expect(find.text('Mobile & OTP'), findsOneWidget);
      expect(find.text('Email & Password'), findsOneWidget);

      // Check default Mobile tab fields
      expect(find.text('🇮🇳 +91'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget); // 1 field for phone
      expect(find.text('Get Verification Code'), findsOneWidget);

      // Check demo buttons are removed
      expect(find.textContaining('Instant Demo Sign In'), findsNothing);

      // Switch to Email & Password tab
      await tester.tap(find.text('Email & Password'));
      await tester.pumpAndSettle();

      // Check Email tab fields
      expect(find.text('Email Address'), findsOneWidget);
      expect(find.text('Password'), findsOneWidget);
      expect(find.text('Sign In'), findsOneWidget);
      expect(find.byIcon(Icons.visibility_outlined), findsOneWidget);
    });
  });

  group('OtpVerificationScreen Widget Tests', () {
    testWidgets('renders 6 segmented digit fields and phone number with 30s countdown',
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
            home: OtpVerificationScreen(email: '+91 99000 00003'),
          ),
        ),
      );
      await tester.pump();
      await tester.pump();

      // Verify phone number is displayed
      expect(find.textContaining('+91 99000 00003'), findsOneWidget);

      // Verify 6 digit TextFields
      expect(find.byType(TextField), findsNWidgets(6));

      // Verify CTA button
      expect(find.text('Verify & Continue'), findsOneWidget);

      // Verify countdown timer text starts with 30s
      expect(find.textContaining('Resend in 30s'), findsOneWidget);
    });
  });

  group('ProfileSetupScreen Widget Tests', () {
    testWidgets('renders profile fields with verified phone and completes onboarding',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 2.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      SharedPreferences.setMockInitialValues({});
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            apiClientProvider.overrideWithValue(FakeAuthApiClient()),
          ],
          child: const MaterialApp(
            home: ProfileSetupScreen(phone: '+91 99000 00099'),
          ),
        ),
      );
      await tester.pump();
      await tester.pump();

      // Check verified badge and phone
      expect(find.text('+91 99000 00099'), findsOneWidget);
      expect(find.text('VERIFIED'), findsOneWidget);

      // Check form fields
      expect(find.text('First Name'), findsOneWidget);
      expect(find.text('Last Name'), findsOneWidget);
      expect(find.text('Complete Account Setup'), findsOneWidget);

      // Enter First Name and Last Name
      await tester.enterText(find.widgetWithText(TextField, 'First Name'), 'Maya');
      await tester.enterText(find.widgetWithText(TextField, 'Last Name'), 'Chen');
      await tester.pumpAndSettle();

      // Tap Complete Account Setup
      await tester.tap(find.text('Complete Account Setup'));
      await tester.pumpAndSettle();
    });
  });
}

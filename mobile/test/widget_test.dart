import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cue_mobile/app.dart';
import 'package:cue_mobile/core/constants.dart';
import 'package:cue_mobile/features/auth/auth_controller.dart';
import 'fixtures/seed_data.dart';

void main() {
  testWidgets('CueApp boots up with bottom navigation and discovery content',
      (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({
      AppConstants.tokenKey: 'fake-jwt-token',
    });
    // Set a phone screen size
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          apiClientProvider.overrideWithValue(FakeSeedApiClient()),
        ],
        child: const CueApp(),
      ),
    );
    await tester.pumpAndSettle();

    // Verify Cue brand in top bar
    expect(find.text('Cue'), findsAtLeastNWidgets(1));
    expect(find.text('Companion'), findsOneWidget);

    // Verify hero tagline
    expect(find.text('A better hour\nstarts here.'), findsOneWidget);

    // Verify navigation bar destinations
    expect(find.text('Explore'), findsOneWidget);
    expect(find.text('Bookings'), findsOneWidget);
    expect(find.text('Messages'), findsOneWidget);
    expect(find.text('Profile'), findsOneWidget);

    // Verify curated host cards present
    expect(find.text('Ananya Sen'), findsOneWidget);
    expect(find.text('Kabir Varma'), findsOneWidget);

    // Tap Bookings tab
    await tester.tap(find.text('Bookings'));
    await tester.pumpAndSettle();

    expect(find.text('My Outings'), findsOneWidget);
    expect(find.textContaining('Active'), findsOneWidget);

    // Tap Messages tab
    await tester.tap(find.text('Messages'));
    await tester.pumpAndSettle();

    expect(find.widgetWithText(AppBar, 'Messages'), findsOneWidget);

    // Tap Profile tab
    await tester.tap(find.text('Profile'));
    await tester.pumpAndSettle();

    expect(find.text('My Profile'), findsOneWidget);
    expect(find.text('Trust & Reputation'), findsOneWidget);

    // Scroll to and tap Sign Out and verify redirect to login
    await tester.scrollUntilVisible(find.text('Sign Out'), 300);
    await tester.tap(find.text('Sign Out'));
    await tester.pumpAndSettle();

    expect(find.text('Sign In to Cue'), findsOneWidget);
    expect(find.textContaining('Instant Demo Sign In (Alex Seeker'), findsOneWidget);
  });
}

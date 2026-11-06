import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class AppConstants {
  static const String appName = 'Cue';
  static const String appTagline = 'Experience Companion Marketplace';

  static String get defaultApiUrl {
    const fromEnv = String.fromEnvironment('CUE_API_URL');
    if (fromEnv.isNotEmpty) return fromEnv;

    if (!kIsWeb && Platform.isAndroid) {
      return 'http://10.0.2.2:5000/api/v1';
    }
    return 'http://localhost:5000/api/v1';
  }

  static String get chatHubUrl {
    const fromEnv = String.fromEnvironment('CUE_CHAT_HUB_URL');
    if (fromEnv.isNotEmpty) return fromEnv;

    if (!kIsWeb && Platform.isAndroid) {
      return 'http://10.0.2.2:5000/hubs/chat';
    }
    return 'http://localhost:5000/hubs/chat';
  }

  // Platform fee percentage (10%)
  static const double platformFeeRate = 0.10;

  // Shared preferences keys
  static const String tokenKey = 'cue.accessToken';
  static const String userKey = 'cue.userJson';
  static const String userRoleKey = 'cue.activeRole';
}

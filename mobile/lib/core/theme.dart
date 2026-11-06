import 'package:flutter/material.dart';

class AppColors {
  // Brand colors (Codified in DESIGN.md & AGENTS.md)
  static const Color background = Color(0xFFFAF7F2); // Warm Cashmere Ivory
  static const Color surface = Color(0xFFFFFFFF); // Pure White
  static const Color surfaceMuted = Color(0xFFF4EFEA); // Soft Linen Tint

  static const Color primary = Color(0xFF881337); // Rich Bordeaux Velvet
  static const Color primaryHover = Color(0xFF9F1239); // Deep Wine Accent
  static const Color primaryLight = Color(0xFFFCE7F3); // Rose Wash Tint
  static const Color primaryDark = Color(0xFF4C0519); // Deep Velvet Dark

  static const Color gold = Color(0xFFC5A059); // Burnished Champagne Gold
  static const Color goldLight = Color(0xFFFBF4E6); // Champagne Glow Tint
  static const Color goldDark = Color(0xFF997A3A); // Antique Bronze Gold

  // Legacy alias for sage to prevent breaks while migrating
  static const Color sage = Color(0xFF587363);
  static const Color sageDark = Color(0xFF3B5244);
  static const Color sageLight = Color(0xFFE4EDE7);

  // Text hierarchy
  static const Color textPrimary = Color(0xFF1C1917); // Charcoal Espresso
  static const Color textSecondary = Color(0xFF78716C); // Warm Stone
  static const Color textMuted = Color(0xFFA8A29E); // Neutral Muted

  static const Color border = Color(0xFFE7E2D9); // Warm Border
  static const Color borderSubtle = Color(0xFFF0EBE1);

  // Outing status colors
  static const Color statusPending = Color(0xFFD97706); // Amber
  static const Color statusConfirmed = Color(0xFF881337); // Bordeaux Velvet
  static const Color statusInProgress = Color(0xFFC5A059); // Champagne Gold
  static const Color statusCompleted = Color(0xFF047857); // Forest Emerald
  static const Color statusCancelled = Color(0xFFDC2626); // Crimson
  static const Color statusDisputed = Color(0xFFB91C1C);

  // Trust score badge colors
  static const Color trustHigh = Color(0xFFC5A059); // Champagne Gold Tier
  static const Color trustMedium = Color(0xFFD97706);
  static const Color trustLow = Color(0xFFDC2626);
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      fontFamily: 'Plus Jakarta Sans',
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        secondary: AppColors.gold,
        surface: AppColors.surface,
        brightness: Brightness.light,
      ),
      scaffoldBackgroundColor: AppColors.background,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.background,
        elevation: 0,
        scrolledUnderElevation: 0,
        iconTheme: IconThemeData(color: AppColors.textPrimary),
        titleTextStyle: TextStyle(
          color: AppColors.textPrimary,
          fontSize: 20,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.3,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.border, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          minimumSize: const Size(44, 48), // Strict 44x44px minimum touch target
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.1,
          ),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          minimumSize: const Size(44, 48),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.1,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.textPrimary,
          minimumSize: const Size(44, 48),
          side: const BorderSide(color: AppColors.border),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surface,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.statusCancelled),
        ),
        hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 14),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.surface,
        indicatorColor: AppColors.primaryLight,
        elevation: 2,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            );
          }
          return const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: AppColors.textSecondary,
          );
        }),
      ),
    );
  }
}

import 'package:flutter/material.dart';

/// Cue × Fluent 2 mobile tokens (https://fluent2.microsoft.design/).
///
/// Brand ramp is anchored at brand80 = Bordeaux #881337; neutrals, status
/// colors, type ramp, corner radii, spacing and elevation follow Fluent 2.
/// DESIGN.md is the source of truth — keep values in sync with
/// frontend/src/theme/fluentTheme.ts and frontend/src/index.css.
class FluentBrand {
  static const Color b10 = Color(0xFF1A030A);
  static const Color b20 = Color(0xFF290610);
  static const Color b30 = Color(0xFF390817);
  static const Color b40 = Color(0xFF490A1D);
  static const Color b50 = Color(0xFF590C24);
  static const Color b60 = Color(0xFF680F2A);
  static const Color b70 = Color(0xFF781131);
  static const Color b80 = Color(0xFF881337);
  static const Color b90 = Color(0xFF9D3D5B);
  static const Color b100 = Color(0xFFAD5D76);
  static const Color b110 = Color(0xFFBC798E);
  static const Color b120 = Color(0xFFC994A4);
  static const Color b130 = Color(0xFFD6ADB9);
  static const Color b140 = Color(0xFFE2C5CE);
  static const Color b150 = Color(0xFFEEDCE2);
  static const Color b160 = Color(0xFFF9F3F5);
}

/// Fluent 2 corner radius tokens.
class FluentRadius {
  static const double none = 0;
  static const double small = 2;
  static const double medium = 4;
  static const double large = 8; // buttons, inputs, chips on mobile
  static const double xLarge = 12; // cards, sheets, dialogs on mobile
  static const double circular = 9999;
}

/// Fluent 2 spacing ramp (4px base).
class FluentSpacing {
  static const double xxs = 2;
  static const double xs = 4;
  static const double sNudge = 6;
  static const double s = 8;
  static const double mNudge = 10;
  static const double m = 12;
  static const double l = 16;
  static const double xl = 20;
  static const double xxl = 24;
  static const double xxxl = 32;
}

/// Fluent 2 elevation (ambient + key shadow pairs).
class FluentShadows {
  static List<BoxShadow> _pair(double ambientBlur, double keyY, double keyBlur) => [
        BoxShadow(color: const Color(0x1F000000), blurRadius: ambientBlur),
        BoxShadow(color: const Color(0x24000000), offset: Offset(0, keyY), blurRadius: keyBlur),
      ];

  static final List<BoxShadow> shadow2 = _pair(2, 1, 2);
  static final List<BoxShadow> shadow4 = _pair(2, 2, 4);
  static final List<BoxShadow> shadow8 = _pair(2, 4, 8);
  static final List<BoxShadow> shadow16 = _pair(2, 8, 16);
  static final List<BoxShadow> shadow28 = _pair(8, 14, 28);
  static final List<BoxShadow> shadow64 = _pair(8, 32, 64);
}

/// Fluent 2 motion.
class FluentMotion {
  static const Duration fast = Duration(milliseconds: 150);
  static const Duration normal = Duration(milliseconds: 200);
  static const Duration slow = Duration(milliseconds: 300);
  static const Curve easyEase = Cubic(0.33, 0, 0.67, 1);
  static const Curve decelerate = Cubic(0, 0, 0, 1);
  static const Curve accelerate = Cubic(1, 0, 1, 1);
}

/// Fluent 2 mobile type ramp. Uses the platform font (SF Pro on iOS,
/// Roboto on Android, Segoe UI on Windows) — no bundled typefaces.
class FluentType {
  static const TextStyle display = TextStyle(fontSize: 60, height: 72 / 60, fontWeight: FontWeight.w700);
  static const TextStyle largeTitle = TextStyle(fontSize: 34, height: 40 / 34, fontWeight: FontWeight.w600);
  static const TextStyle title1 = TextStyle(fontSize: 28, height: 34 / 28, fontWeight: FontWeight.w600);
  static const TextStyle title2 = TextStyle(fontSize: 22, height: 28 / 22, fontWeight: FontWeight.w600);
  static const TextStyle title3 = TextStyle(fontSize: 20, height: 25 / 20, fontWeight: FontWeight.w600);
  static const TextStyle body1Strong = TextStyle(fontSize: 17, height: 22 / 17, fontWeight: FontWeight.w600);
  static const TextStyle body1 = TextStyle(fontSize: 17, height: 22 / 17, fontWeight: FontWeight.w400);
  static const TextStyle body2Strong = TextStyle(fontSize: 15, height: 20 / 15, fontWeight: FontWeight.w600);
  static const TextStyle body2 = TextStyle(fontSize: 15, height: 20 / 15, fontWeight: FontWeight.w400);
  static const TextStyle caption1Strong = TextStyle(fontSize: 13, height: 18 / 13, fontWeight: FontWeight.w600);
  static const TextStyle caption1 = TextStyle(fontSize: 13, height: 18 / 13, fontWeight: FontWeight.w400);
  static const TextStyle caption2 = TextStyle(fontSize: 12, height: 16 / 12, fontWeight: FontWeight.w400);

  /// Tabular figures for ₹ amounts, PINs, time slots and references.
  static const List<FontFeature> tabular = [FontFeature.tabularFigures()];
  static TextStyle numeric(TextStyle base) => base.copyWith(fontFeatures: tabular);
}

/// Semantic colors used across the app. Names are kept stable so existing
/// screens continue to compile; values now come from Fluent 2.
class AppColors {
  // Neutral surfaces (Fluent light neutrals)
  static const Color background = Color(0xFFFAFAFA); // colorNeutralBackground2
  static const Color surface = Color(0xFFFFFFFF); // colorNeutralBackground1
  static const Color surfaceMuted = Color(0xFFF5F5F5); // colorNeutralBackground3
  static const Color surfacePressed = Color(0xFFE0E0E0); // colorNeutralBackground1Pressed

  // Brand (Cue Bordeaux ramp)
  static const Color primary = FluentBrand.b80; // colorBrandBackground
  static const Color primaryHover = FluentBrand.b70; // colorBrandBackgroundHover
  static const Color primaryPressed = FluentBrand.b40; // colorBrandBackgroundPressed
  static const Color primaryLight = FluentBrand.b160; // colorBrandBackground2
  static const Color primaryDark = FluentBrand.b40;
  static const Color brandForeground = FluentBrand.b80; // colorBrandForeground1
  static const Color brandStroke = FluentBrand.b80;

  // Trust / verified / escrow (Fluent shared "gold" palette)
  static const Color gold = Color(0xFF6C5700); // text-safe gold
  static const Color goldLight = Color(0xFFFBF6D9);
  static const Color goldDark = Color(0xFF3A2F00);
  static const Color goldBorder = Color(0xFFE8D88A);

  // Legacy sage aliases → Fluent success
  static const Color sage = Color(0xFF107C10);
  static const Color sageDark = Color(0xFF0E700E);
  static const Color sageLight = Color(0xFFF1FAF1);

  // Text hierarchy (Fluent neutral foregrounds)
  static const Color textPrimary = Color(0xFF242424); // colorNeutralForeground1
  static const Color textSecondary = Color(0xFF424242); // colorNeutralForeground2
  static const Color textMuted = Color(0xFF616161); // colorNeutralForeground3
  static const Color textDisabled = Color(0xFFBDBDBD); // colorNeutralForegroundDisabled

  static const Color border = Color(0xFFE0E0E0); // colorNeutralStroke2
  static const Color borderStrong = Color(0xFFD1D1D1); // colorNeutralStroke1
  static const Color borderSubtle = Color(0xFFF0F0F0); // colorNeutralStroke3
  static const Color strokeAccessible = Color(0xFF616161); // colorNeutralStrokeAccessible

  // Fluent status colors
  static const Color success = Color(0xFF107C10);
  static const Color successForeground = Color(0xFF0E700E);
  static const Color successBackground = Color(0xFFF1FAF1);
  static const Color warning = Color(0xFFF7630C);
  static const Color warningForeground = Color(0xFFBC4B09);
  static const Color warningBackground = Color(0xFFFFF9F5);
  static const Color danger = Color(0xFFC50F1F);
  static const Color dangerForeground = Color(0xFFB10E1C);
  static const Color dangerBackground = Color(0xFFFDF3F4);
  static const Color info = Color(0xFF616161);

  // Outing status colors
  static const Color statusPending = warningForeground;
  static const Color statusConfirmed = FluentBrand.b80;
  static const Color statusInProgress = Color(0xFF0F6CBD); // Fluent informative blue
  static const Color statusCompleted = successForeground;
  static const Color statusCancelled = dangerForeground;
  static const Color statusDisputed = Color(0xFF8E0D18);

  // Safety & emergency
  static const Color emergencyRed = danger;
  static const Color emergencyRedHover = Color(0xFFA80D1A);
  static const Color emergencyRedLight = dangerBackground;

  // Trust score badge
  static const Color trustHigh = successForeground;
  static const Color trustMedium = warningForeground;
  static const Color trustLow = dangerForeground;
}

class AppTheme {
  static const double _minTouch = 44;

  static ThemeData get lightTheme {
    const scheme = ColorScheme(
      brightness: Brightness.light,
      primary: FluentBrand.b80,
      onPrimary: Colors.white,
      primaryContainer: FluentBrand.b160,
      onPrimaryContainer: FluentBrand.b40,
      secondary: Color(0xFF424242),
      onSecondary: Colors.white,
      secondaryContainer: Color(0xFFF0F0F0),
      onSecondaryContainer: Color(0xFF242424),
      tertiary: AppColors.gold,
      onTertiary: Colors.white,
      error: AppColors.danger,
      onError: Colors.white,
      errorContainer: AppColors.dangerBackground,
      onErrorContainer: AppColors.dangerForeground,
      surface: AppColors.surface,
      onSurface: AppColors.textPrimary,
      onSurfaceVariant: AppColors.textMuted,
      surfaceContainerLowest: Colors.white,
      surfaceContainerLow: Color(0xFFFAFAFA),
      surfaceContainer: Color(0xFFF5F5F5),
      surfaceContainerHigh: Color(0xFFF0F0F0),
      surfaceContainerHighest: Color(0xFFEBEBEB),
      outline: AppColors.borderStrong,
      outlineVariant: AppColors.border,
      shadow: Colors.black,
      inverseSurface: Color(0xFF292929),
      onInverseSurface: Colors.white,
      inversePrimary: FluentBrand.b110,
      surfaceTint: Colors.transparent,
    );

    final textTheme = TextTheme(
      displayLarge: FluentType.display.copyWith(color: AppColors.textPrimary),
      displayMedium: FluentType.largeTitle.copyWith(color: AppColors.textPrimary),
      displaySmall: FluentType.title1.copyWith(color: AppColors.textPrimary),
      headlineLarge: FluentType.title1.copyWith(color: AppColors.textPrimary),
      headlineMedium: FluentType.title2.copyWith(color: AppColors.textPrimary),
      headlineSmall: FluentType.title3.copyWith(color: AppColors.textPrimary),
      titleLarge: FluentType.title3.copyWith(color: AppColors.textPrimary),
      titleMedium: FluentType.body1Strong.copyWith(color: AppColors.textPrimary),
      titleSmall: FluentType.body2Strong.copyWith(color: AppColors.textPrimary),
      bodyLarge: FluentType.body1.copyWith(color: AppColors.textPrimary),
      bodyMedium: FluentType.body2.copyWith(color: AppColors.textPrimary),
      bodySmall: FluentType.caption1.copyWith(color: AppColors.textMuted),
      labelLarge: FluentType.body2Strong.copyWith(color: AppColors.textPrimary),
      labelMedium: FluentType.caption1Strong.copyWith(color: AppColors.textPrimary),
      labelSmall: FluentType.caption2.copyWith(color: AppColors.textMuted),
    );

    final buttonShape = RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(FluentRadius.large),
    );
    const buttonPadding = EdgeInsets.symmetric(horizontal: 20, vertical: 12);
    const buttonSize = Size(_minTouch, 48);

    OutlineInputBorder inputBorder(Color color, [double width = 1]) => OutlineInputBorder(
          borderRadius: BorderRadius.circular(FluentRadius.large),
          borderSide: BorderSide(color: color, width: width),
        );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      textTheme: textTheme,
      scaffoldBackgroundColor: AppColors.background,
      splashFactory: NoSplash.splashFactory, // Fluent uses state fills, not ripples
      highlightColor: Colors.black.withValues(alpha: 0.04),
      dividerTheme: const DividerThemeData(color: AppColors.border, thickness: 1, space: 1),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        shape: const Border(bottom: BorderSide(color: AppColors.border)),
        iconTheme: const IconThemeData(color: AppColors.textPrimary, size: 24),
        titleTextStyle: FluentType.title3.copyWith(color: AppColors.textPrimary),
      ),
      cardTheme: CardThemeData(
        color: AppColors.surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(FluentRadius.xLarge),
          side: const BorderSide(color: AppColors.border),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          disabledBackgroundColor: AppColors.surfaceMuted,
          disabledForegroundColor: AppColors.textDisabled,
          minimumSize: buttonSize,
          padding: buttonPadding,
          shape: buttonShape,
          textStyle: FluentType.body1Strong,
          splashFactory: NoSplash.splashFactory,
        ).copyWith(
          backgroundColor: WidgetStateProperty.resolveWith((s) {
            if (s.contains(WidgetState.disabled)) return AppColors.surfaceMuted;
            if (s.contains(WidgetState.pressed)) return AppColors.primaryPressed;
            if (s.contains(WidgetState.hovered)) return AppColors.primaryHover;
            return AppColors.primary;
          }),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          minimumSize: buttonSize,
          padding: buttonPadding,
          shape: buttonShape,
          textStyle: FluentType.body1Strong,
          splashFactory: NoSplash.splashFactory,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.textPrimary,
          backgroundColor: AppColors.surface,
          minimumSize: buttonSize,
          side: const BorderSide(color: AppColors.borderStrong),
          padding: buttonPadding,
          shape: buttonShape,
          textStyle: FluentType.body1Strong,
          splashFactory: NoSplash.splashFactory,
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.brandForeground,
          minimumSize: const Size(_minTouch, _minTouch),
          shape: buttonShape,
          textStyle: FluentType.body2Strong,
          splashFactory: NoSplash.splashFactory,
        ),
      ),
      iconButtonTheme: IconButtonThemeData(
        style: IconButton.styleFrom(
          minimumSize: const Size(_minTouch, _minTouch),
          foregroundColor: AppColors.textPrimary,
          shape: buttonShape,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surface,
        isDense: false,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        border: inputBorder(AppColors.borderStrong),
        enabledBorder: inputBorder(AppColors.borderStrong),
        focusedBorder: inputBorder(AppColors.brandStroke, 2),
        errorBorder: inputBorder(AppColors.danger),
        focusedErrorBorder: inputBorder(AppColors.danger, 2),
        disabledBorder: inputBorder(AppColors.border),
        labelStyle: FluentType.body2.copyWith(color: AppColors.textMuted),
        floatingLabelStyle: FluentType.caption1Strong.copyWith(color: AppColors.brandForeground),
        hintStyle: FluentType.body2.copyWith(color: AppColors.textMuted),
        helperStyle: FluentType.caption1.copyWith(color: AppColors.textMuted),
        errorStyle: FluentType.caption1.copyWith(color: AppColors.dangerForeground),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.surfaceMuted,
        selectedColor: AppColors.primaryLight,
        side: const BorderSide(color: AppColors.border),
        labelStyle: FluentType.caption1Strong.copyWith(color: AppColors.textPrimary),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(FluentRadius.circular)),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        showDragHandle: true,
        dragHandleColor: AppColors.borderStrong,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(FluentRadius.xLarge)),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(FluentRadius.xLarge)),
        titleTextStyle: FluentType.title3.copyWith(color: AppColors.textPrimary),
        contentTextStyle: FluentType.body2.copyWith(color: AppColors.textSecondary),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: const Color(0xFF292929),
        contentTextStyle: FluentType.body2.copyWith(color: Colors.white),
        actionTextColor: FluentBrand.b120,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(FluentRadius.large)),
      ),
      tabBarTheme: const TabBarThemeData(
        labelColor: AppColors.textPrimary,
        unselectedLabelColor: AppColors.textMuted,
        labelStyle: FluentType.body2Strong,
        unselectedLabelStyle: FluentType.body2,
        indicatorColor: AppColors.primary,
        indicatorSize: TabBarIndicatorSize.label,
        dividerColor: AppColors.border,
        splashFactory: NoSplash.splashFactory,
      ),
      listTileTheme: ListTileThemeData(
        minVerticalPadding: 12,
        iconColor: AppColors.textMuted,
        titleTextStyle: FluentType.body1.copyWith(color: AppColors.textPrimary),
        subtitleTextStyle: FluentType.caption1.copyWith(color: AppColors.textMuted),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith(
          (s) => s.contains(WidgetState.selected) ? Colors.white : AppColors.strokeAccessible,
        ),
        trackColor: WidgetStateProperty.resolveWith(
          (s) => s.contains(WidgetState.selected) ? AppColors.primary : AppColors.surface,
        ),
        trackOutlineColor: WidgetStateProperty.resolveWith(
          (s) => s.contains(WidgetState.selected) ? Colors.transparent : AppColors.strokeAccessible,
        ),
      ),
      checkboxTheme: CheckboxThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(FluentRadius.medium)),
        fillColor: WidgetStateProperty.resolveWith(
          (s) => s.contains(WidgetState.selected) ? AppColors.primary : Colors.transparent,
        ),
        side: const BorderSide(color: AppColors.strokeAccessible, width: 1),
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColors.primary,
        linearTrackColor: AppColors.border,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        indicatorColor: Colors.transparent, // Fluent tab bar: color change, no pill
        elevation: 0,
        height: 64,
        iconTheme: WidgetStateProperty.resolveWith((s) => IconThemeData(
              size: 24,
              color: s.contains(WidgetState.selected) ? AppColors.brandForeground : AppColors.textMuted,
            )),
        labelTextStyle: WidgetStateProperty.resolveWith((s) {
          final selected = s.contains(WidgetState.selected);
          return FluentType.caption2.copyWith(
            fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
            color: selected ? AppColors.brandForeground : AppColors.textMuted,
          );
        }),
      ),
    );
  }
}

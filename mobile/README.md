# Cue Mobile Client (Flutter)

A cross-platform Flutter application for **Cue** (LoveAgain) — the Experience Companion marketplace connecting Seekers with vetted Companions for museum tours, events, language exchange, dining, and shared everyday moments.

## Key Features

1. **Discovery & Exploration** (`DiscoveryScreen`):
   - Browse vetted companions with photos/initials, roles, city, hourly rate, verified identity badges, and trust score metrics.
   - Real-time text search across companion names, bios, specialties, and cities.
   - Category filtering chips (All, Art & Culture, Language Exchange, Event Plus-One, Outdoor & Fitness, Dining & Coffee).
   - Dynamic sorting (Recommended, Highest Rated, Highest Trust Score, Price Low-to-High, Price High-to-Low).

2. **Companion Profile Detail** (`ProviderDetailScreen`):
   - Comprehensive companion profile with bio, specialties, service radius, and verified identity badge.
   - Interactive upcoming availability slots pre-fill for booking.
   - Community reviews and star rating breakdown.

3. **Booking Flow & Invariant Enforcement** (`BookingScreen`):
   - Date picker and start time selector.
   - Duration slider (1.0 to 6.0 hours).
   - Meeting location input with quick suggestion chips (e.g. Central Park West, Whitney Museum, SoHo).
   - Special requests field.
   - **Domain Invariants Enforced** (from `CONTEXT.md`):
     - Seeker and provider must be different users.
     - End time strictly after start time.
     - Monetary values non-negative: `Provider Earnings + Platform Fee (10%) == Total Amount`.

4. **Booking Lifecycle Management** (`BookingsScreen`, `BookingDetailScreen`):
   - Tabbed view: **Active** / **Completed** / **Cancelled**.
   - Lifecycle progression: `Pending Payment` -> `Confirmed` -> `In Progress` -> `Completed` / `Cancelled`.
   - Direct actions: Pay Now, Start Live Session, Complete Session, Cancel, and Leave Review.
   - Detailed order lifecycle stepper timeline and invoice breakdown.

5. **Real-time Messaging** (`MessagesScreen`, `ChatScreen`):
   - Conversation list grouped by active/past companion bookings with unread badges.
   - Real-time chat bubbles with sender/recipient distinction, timestamps, and read receipts.
   - Companion auto-reply simulation for instant interactive testing and demonstrations.

6. **User Profile & Trust Reputation** (`ProfileScreen`):
   - Trust score badge with tier breakdown and immutable trust events history.
   - Dual-mode toggle: **Seeker Mode** vs **Provider Mode** (with earnings dashboard, rating summary, and discoverability toggle).
   - Community safety guidelines modal.

7. **Authentication** (`LoginScreen`):
   - Sign In and Account Registration with role selection (`Seeker` or `Companion`).
   - One-click instant demo sign-in button for hassle-free evaluation.

## Architecture

- **State Management**: [flutter_riverpod](https://pub.dev/packages/flutter_riverpod)
- **Routing**: [go_router](https://pub.dev/packages/go_router)
- **Networking**: [dio](https://pub.dev/packages/dio) with backend gateway integration (`http://localhost:5000/api/v1`) and resilient offline/mock fallback.
- **Local Persistence**: [shared_preferences](https://pub.dev/packages/shared_preferences) for auth tokens and user preferences.
- **Design System**: Custom Material 3 theme (`AppTheme`) using Cue's brand palette (Terracotta `#D86E51`, Sage Green `#587363`, Warm Linen background `#FAF7F2`).

## Project Structure

```
mobile/
├── lib/
│   ├── app.dart                                # GoRouter routes & MaterialApp setup
│   ├── main.dart                               # Entry point with ProviderScope
│   ├── core/
│   │   ├── api_client.dart                     # Dio HTTP client with JWT interceptor
│   │   ├── constants.dart                      # Platform constants & fee rates
│   │   └── theme.dart                          # Brand colors & M3 theme definitions
│   ├── data/
│   │   ├── mock_data.dart                      # Realistic companion and booking seeds
│   │   └── repositories/
│   │       ├── auth_repository.dart            # Authentication API & persistence
│   │       ├── booking_repository.dart         # Service order state & caching
│   │       ├── chat_repository.dart            # Messaging storage & exchange
│   │       └── discovery_repository.dart       # Companion search, filter & sort
│   ├── features/
│   │   ├── auth/                               # Login, register & auth state notifier
│   │   ├── booking/                            # Bookings list, detail, and booking flow
│   │   ├── chat/                               # Threads list & interactive chat room
│   │   ├── discovery/                          # Discovery feed & companion detail
│   │   ├── navigation/                         # 4-tab bottom navigation shell
│   │   ├── profile/                            # User profile, trust score & provider toggle
│   │   └── widgets/                            # Reusable badges (Trust score, Verified, etc.)
│   └── models/
│       ├── booking.dart                        # Service order aggregate & invariant validator
│       ├── chat_message.dart                   # Chat message data model
│       ├── provider.dart                       # Provider profile & availability slots
│       └── user.dart                           # User account model
└── test/
    ├── features/discovery/discovery_test.dart  # Search & sort tests
    ├── models/booking_test.dart                # Invariant enforcement unit tests
    ├── models/provider_test.dart               # Serialization unit tests
    └── widget_test.dart                        # Full app navigation & widget tests
```

## Running the App

### 1. Install Dependencies
```bash
flutter pub get
```

### 2. Run Lint & Static Analysis
```bash
flutter analyze
```

### 3. Run Automated Tests
```bash
flutter test
```

### 4. Run on Device / Simulator
```bash
flutter run
```

---
spec_issue_number: 16
spec_issue_url: https://github.com/one-brain/LoveAgain/issues/16
spec_filed_at: 2026-11-06T18:14:00+05:30
spec_branch: experiment/host-guest-terminology
status: Approved
---

# Unified My Outings Schedule: Role-Differentiated Guest & Host Cards

## Problem Statement
In the Cue mobile app, outings booked by a user as a Guest and outings hosted by a user as a Companion were previously conflated under a generic card layout that only showed the companion's name. To switch between host and guest views, users had to navigate away to the Profile screen and toggle a global "Host Mode vs Guest Mode" switch. Furthermore, users who both host and attend outings need to see their complete daily schedule in a single, chronological timeline rather than having to flip between separate screens.

## Proposed Solution
Unify the **My Outings** screen into a single daily schedule feed with clearly differentiated **Guest** and **Host** cards:
1. **Unified Chronological Feed**:
   - Display both Guest outings (where the user is attending) and Host outings (where the user is hosting) in one place sorted chronologically by outing `startTime`.
   - The user sees their complete schedule for the day effortlessly.
2. **Retained Status Filter Pills**:
   - Retain the top filter pills: `Active (N)`, `Completed (N)`, and `Cancelled (N)`.
   - Optional quick role filter pill: `All`, `Attending`, `Hosting` (defaulting to `All`).
3. **Role-Differentiated Outing Cards**:
   - **Host Card (`HOSTING`)**:
     - Role Badge: `HOSTING` styled with Burnished Champagne Gold (`#C5A059` border/accent).
     - Counterpart details: Shows the **Guest's** name (`booking.guestName` / `booking.seekerName`) and initials avatar.
     - Payout details: Displays `₹${booking.hostEarnings}` with `Your Payout` label in `JetBrains Mono` tabular numerals (`tnum`).
     - Actions: `Message Guest` and `Verify Check-in PIN` / `View Details`.
   - **Guest Card (`ATTENDING`)**:
     - Role Badge: `ATTENDING` styled with Bordeaux Velvet (`#881337`).
     - Counterpart details: Shows the **Host / Companion's** name (`booking.hostName` / `booking.providerName`) and initials avatar.
     - Cost details: Displays `₹${booking.totalAmount}` with `Total Paid` in `JetBrains Mono`.
     - Actions: `Message Host` and `View Voucher` / `Pay Now` / `Check In`.
4. **Profile Screen Simplification**:
   - Remove the manual "Host Mode vs Guest Mode" toggle switch card in `ProfileScreen` since the unified Outings screen renders both roles concurrently.

## Scope and Boundaries
### In Scope
- [`mobile/lib/features/booking/bookings_screen.dart`](file:///e:/Projects/Github/one-brain/LoveAgain/mobile/lib/features/booking/bookings_screen.dart): Update `_BookingCard` to inspect whether `currentUserId == booking.providerId` vs `booking.seekerId` and render differentiated styling, badges, counterpart names, and action buttons.
- [`mobile/lib/features/booking/booking_controller.dart`](file:///e:/Projects/Github/one-brain/LoveAgain/mobile/lib/features/booking/booking_controller.dart): Ensure chronological sorting by `startTime` and provide optional role filtering helper if desired.
- [`mobile/lib/features/profile/profile_screen.dart`](file:///e:/Projects/Github/one-brain/LoveAgain/mobile/lib/features/profile/profile_screen.dart): Remove the redundant role switch card.
- [`mobile/test/features/layout_overflow_regression_test.dart`](file:///e:/Projects/Github/one-brain/LoveAgain/mobile/test/features/layout_overflow_regression_test.dart) and [`mobile/test/widget_test.dart`](file:///e:/Projects/Github/one-brain/LoveAgain/mobile/test/widget_test.dart): Update and verify tests.

### Out of Scope
- Backend modifications (`GET /api/v1/bookings` already returns both provider and seeker outings for the authenticated user).
- Web application modifications.

## Acceptance Criteria
- [ ] Both Guest and Host outings appear together in the My Outings list sorted chronologically.
- [ ] Guest cards clearly display `ATTENDING`, show the Host's name, total amount, and `Message Host` action.
- [ ] Host cards clearly display `HOSTING`, show the Guest's name, host earnings, and `Message Guest` action.
- [ ] Top status pills (`Active`, `Completed`, `Cancelled`) remain functional and accurately filter outings.
- [ ] Redundant role switch card in Profile screen is removed.
- [ ] Zero layout overflows (`RenderFlex`) across all orientations.
- [ ] All Flutter widget and regression tests pass (`flutter test`).


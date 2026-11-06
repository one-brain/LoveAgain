---
spec_issue_number: 17
spec_issue_url: https://github.com/one-brain/LoveAgain/issues/17
spec_filed_at: 2026-11-06T19:50:00+05:30
spec_branch: experiment/host-guest-terminology
status: Approved
---

# Unified Mobile Authentication Parity with Web

## Problem Statement
In the Cue mobile client ([`mobile/lib/features/auth/login_screen.dart`](file:///e:/Projects/Github/one-brain/LoveAgain/mobile/lib/features/auth/login_screen.dart)), the authentication experience was fragmented, requiring users to toggle between email-based OTP and password login, while lacking support for real 10-digit mobile phone number OTPs. In contrast, the Web client ([`frontend/src/pages/Login.tsx`](file:///e:/Projects/Github/one-brain/LoveAgain/frontend/src/pages/Login.tsx)) uses a unified dual-method architecture defaulting to Mobile Phone OTP (`+91` numbers with country code, 30s resend timer, and inline onboarding for new users) alongside Email & Password login. This inconsistency produces friction for mobile users and diverges from the platform standard.

## Proposed Solution
Re-architect mobile authentication to achieve feature parity with the Web client:
1. **Dual-Tab Authentication Selector**:
   - Provide a clean 2-tab segmented control at the top of the sign-in screen:
     - **Mobile Phone OTP** (Selected by default)
     - **Email & Password**
2. **Mobile Phone OTP Flow**:
   - Country code selector/badge (`+91` default for India).
   - 10-digit mobile phone number text field.
   - "Get Verification Code" button calling backend endpoint `POST /api/v1/auth/mobile/send-otp`.
   - Transitions to 6-digit OTP verification screen with formatted phone display and 30-second resend countdown timer.
   - If the backend returns `isNewUser: true`: prompt inline for First Name and Last Name to complete account setup without leaving the flow.
3. **Email & Password Flow**:
   - Clean email input and password input with show/hide eye toggle.
   - Direct authentication against `POST /api/v1/auth/login`.
4. **Standard Clean Styling**:
   - Adhere strictly to Cue design tokens (Bordeaux Velvet, Cashmere Ivory, 44x44px minimum touch targets) without extraneous demo buttons.

## Scope and Boundaries
### In Scope
- [`mobile/lib/data/repositories/auth_repository.dart`](file:///e:/Projects/Github/one-brain/LoveAgain/mobile/lib/data/repositories/auth_repository.dart): Implement `sendMobileOtp` and `verifyMobileOtp` matching Web API contracts.
- [`mobile/lib/features/auth/auth_controller.dart`](file:///e:/Projects/Github/one-brain/LoveAgain/mobile/lib/features/auth/auth_controller.dart): Add mobile OTP methods and user session management.
- [`mobile/lib/features/auth/login_screen.dart`](file:///e:/Projects/Github/one-brain/LoveAgain/mobile/lib/features/auth/login_screen.dart): Implement dual-tab segmented control, phone input with `+91` badge, and password toggle.
- [`mobile/lib/features/auth/otp_verification_screen.dart`](file:///e:/Projects/Github/one-brain/LoveAgain/mobile/lib/features/auth/otp_verification_screen.dart): Support phone OTP verification, 30s resend countdown timer, and inline new-user onboarding (name capture).
- [`mobile/test/features/auth/auth_otp_test.dart`](file:///e:/Projects/Github/one-brain/LoveAgain/mobile/test/features/auth/auth_otp_test.dart): Update and expand tests for mobile phone OTP verification and session storage.

### Out of Scope
- Backend authentication service changes (existing microservice endpoints `/api/v1/auth/mobile/send-otp`, `/api/v1/auth/mobile/verify-otp`, and `/api/v1/auth/login` are already operational).
- Web frontend changes.
- OAuth third-party providers (Google/Apple Sign-In).

## Acceptance Criteria
- [ ] Mobile login screen features a 2-tab segmented control matching Web: `Mobile Phone OTP` (default) and `Email & Password`.
- [ ] Mobile Phone OTP requests dispatch to `POST /api/v1/auth/mobile/send-otp` with valid formatted phone numbers (`+91...`).
- [ ] OTP verification screen supports 6-digit input, 30s resend timer, and `POST /api/v1/auth/mobile/verify-otp`.
- [ ] When a new mobile user verifies OTP, they are prompted inline for First Name and Last Name.
- [ ] Email & password authentication functions with password visibility toggle.
- [ ] Zero mock data used; real tokens saved to secure storage and validated against backend.
- [ ] All Flutter widget and regression tests pass (`flutter test`).

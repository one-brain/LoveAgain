# Cue — Agile Project Plan

**Last updated:** 2026-08-26  
**Status:** Active development  
**Methodology:** Agile / Scrum — 2-week sprints  
**Stack:** .NET 10 microservices · PostgreSQL · RabbitMQ · React + Redux · SignalR · Ocelot API Gateway

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Team & Roles](#2-team--roles)
3. [Architecture Summary](#3-architecture-summary)
4. [Epics](#4-epics)
5. [Backlog — Full Feature List](#5-backlog--full-feature-list)
   - [EPIC-01 · Authentication & Identity](#epic-01--authentication--identity)
   - [EPIC-02 · User Profile Management](#epic-02--user-profile-management)
   - [EPIC-03 · Provider Profile & Availability](#epic-03--provider-profile--availability)
   - [EPIC-04 · Discovery & Search](#epic-04--discovery--search)
   - [EPIC-05 · Booking & Order Lifecycle](#epic-05--booking--order-lifecycle)
   - [EPIC-06 · Payments](#epic-06--payments)
   - [EPIC-07 · Real-time Chat](#epic-07--real-time-chat)
   - [EPIC-08 · Reviews & Ratings](#epic-08--reviews--ratings)
   - [EPIC-09 · Trust & Safety](#epic-09--trust--safety)
   - [EPIC-10 · Notifications](#epic-10--notifications)
   - [EPIC-11 · Support & Disputes](#epic-11--support--disputes)
   - [EPIC-12 · Analytics & Reporting](#epic-12--analytics--reporting)
   - [EPIC-13 · Admin Panel](#epic-13--admin-panel)
   - [EPIC-14 · Infrastructure & DevOps](#epic-14--infrastructure--devops)
   - [EPIC-15 · Testing & Quality](#epic-15--testing--quality)
   - [EPIC-16 · Dual Roles & Multi-Service Listings](#epic-16--dual-roles--multi-service-listings)
6. [Sprint Plan](#6-sprint-plan)
7. [Definition of Done](#7-definition-of-done)
8. [Risk Register](#8-risk-register)
9. [Progress Tracker](#9-progress-tracker)

---

## 1. Project Overview

Cue is a marketplace platform connecting **Seekers** (people looking for social companionship) with **Providers** (vetted companions). The platform handles discovery, booking, payment, real-time messaging, reviews, and trust management through a microservices backend and a React web frontend.

**Business goals**
- Launch a production-ready MVP enabling end-to-end bookings
- Ensure safety and trust through verified profiles and a dispute system
- Enable providers to manage availability and track earnings

**User types**
| Role | Description |
|------|-------------|
| Seeker | Browses providers, books sessions, pays, and reviews |
| Provider | Manages profile, availability, accepts bookings, earns revenue |
| Admin | Manages platform health, resolves disputes, monitors analytics |

---

## 2. Team & Roles

| Role | Responsibilities |
|------|-----------------|
| Product Owner | Prioritise backlog, accept stories, manage stakeholders |
| Scrum Master | Facilitate ceremonies, remove blockers |
| Backend Engineers | .NET services, domain logic, APIs |
| Frontend Engineer | React/TypeScript UI, RTK Query integration |
| DevOps Engineer | Docker, CI/CD, infrastructure, monitoring |
| QA Engineer | Test planning, automation, exploratory testing |

---

## 3. Architecture Summary

```
Browser (React + Redux)
        │
        ▼
  API Gateway (Ocelot)  ← routes by path prefix
        │
  ┌─────┼──────────────────────────────────────────────┐
  │     │                                              │
AuthService   ProfileService   BookingService   PaymentService
UserService   DiscoveryService  ChatService     NotificationService
ReviewService  SupportService   AnalyticsService
        │
  CueDbContext (PostgreSQL)  ←  shared EF Core schema
        │
  RabbitMQ  ←  async domain events between services
```

**Shared libraries**
- `Cue.Domain` — all aggregate roots and value objects
- `Cue.Application` — MediatR commands/queries/handlers, FluentValidation
- `Cue.Infrastructure.Data` — EF Core DbContext, repositories, DB initializer
- `Cue.Infrastructure.Messaging` — RabbitMQ publisher, domain event records
- `Cue.Common` — cross-cutting utilities

**API Gateway routes (ocelot.json)**

| Upstream prefix | Downstream service |
|----------------|--------------------|
| `/api/v1/auth` | AuthService:80 |
| `/api/v1/users` | UserService:80 |
| `/api/v1/profiles` | ProfileService:80 |
| `/api/v1/discovery` | DiscoveryService:80 |
| `/api/v1/bookings` | BookingService:80 |
| `/api/v1/payments` | PaymentService:80 |
| `/api/v1/chats` | ChatService:80 |
| `/api/v1/notifications` | NotificationService:80 |
| `/api/v1/reviews` | ReviewService:80 |
| `/api/v1/support` | SupportService:80 |
| `/api/v1/analytics` | AnalyticsService:80 |

---

## 4. Epics

| ID | Epic | Priority | Status |
|----|------|----------|--------|
| EPIC-01 | Authentication & Identity | Critical | In Progress |
| EPIC-02 | User Profile Management | High | In Progress |
| EPIC-03 | Provider Profile & Availability | High | Partial |
| EPIC-04 | Discovery & Search | High | Partial |
| EPIC-05 | Booking & Order Lifecycle | Critical | Partial |
| EPIC-06 | Payments | Critical | Partial |
| EPIC-07 | Real-time Chat | High | Partial |
| EPIC-08 | Reviews & Ratings | Medium | Not Started |
| EPIC-09 | Trust & Safety | High | Not Started |
| EPIC-10 | Notifications | Medium | Not Started |
| EPIC-11 | Support & Disputes | Medium | Not Started |
| EPIC-12 | Analytics & Reporting | Low | Partial |
| EPIC-13 | Admin Panel | Medium | Not Started |
| EPIC-14 | Infrastructure & DevOps | Critical | Partial |
| EPIC-15 | Testing & Quality | High | Partial |
| EPIC-16 | Dual Roles & Multi-Service Listings | High | Not Started |

> **Note (2026-08-26):** EPIC-16 supersedes the single-provider-profile assumption in EPIC-03. F-03-01/02 remain Done as implemented; their semantics are generalised by F-16-02/F-16-05, and the legacy single profile is migrated to one seeded ServiceProfile.

---

## 5. Backlog — Full Feature List

Each item uses this format:

```
[ID] Title
  As a <role>, I want <goal> so that <benefit>.
  Acceptance criteria:
    - AC1
    - AC2
  Status: [ ] Todo  [~] In Progress  [x] Done
  Services: <affected services>
  Files: <key files>
  Notes: <implementation notes>
```

Story sizes: **XS** = <2h · **S** = half-day · **M** = 1 day · **L** = 2–3 days · **XL** = 1 week

---

### EPIC-01 · Authentication & Identity

> Secure user registration, login, JWT issuance, and token refresh.

---

**F-01-01** · User Registration `[x] Done` · Size: M  
As a visitor, I want to create an account so that I can use the platform.  
- AC: POST `/api/v1/auth/register` accepts `{email, password, firstName, lastName, role}`  
- AC: Password hashed with PBKDF2-SHA256, 120k iterations  
- AC: Returns `{accessToken, refreshToken, expiresIn}`  
- AC: Duplicate email returns 409  
- AC: Role must be `Seeker` or `Provider`  
- Services: AuthService  
- Files: `backend/Services/AuthService/Controllers/AuthController.cs`, `AuthModels.cs`

---

**F-01-02** · User Login `[x] Done` · Size: S  
As a registered user, I want to sign in so that I can access my account.  
- AC: POST `/api/v1/auth/login` returns JWT on valid credentials  
- AC: Invalid credentials return 401 with no detail leak  
- Services: AuthService  
- Files: `backend/Services/AuthService/Controllers/AuthController.cs`

---

**F-01-03** · Refresh Token `[x] Done` · Size: M  
As a signed-in user, I want my session to stay alive so that I am not logged out mid-use.  
- AC: POST `/api/v1/auth/refresh` exchanges a valid refresh token for new access + refresh tokens  
- AC: Used refresh tokens are invalidated (rotation)  
- AC: Expired or unknown tokens return 401  
- Services: AuthService  
- Files: `AuthModels.cs`, `AuthController.cs`  
- Notes: Needs `RefreshToken` table or storage in User entity; consider storing hashed token

---

**F-01-04** · Logout / Token Revocation `[x] Done` · Size: S  
As a user, I want to sign out so that my session is invalidated server-side.  
- AC: POST `/api/v1/auth/logout` invalidates the refresh token  
- AC: Frontend clears `cue.accessToken` from localStorage  
- Services: AuthService, Frontend  
- Files: `AuthController.cs`, `frontend/src/store.ts`

---

**F-01-05** · Email Verification `[x] Done` · Size: L  
As the platform, I want to verify user email addresses so that fake accounts are reduced.  
- AC: Registration sends a verification email with a signed link  
- AC: Clicking the link sets `User.IsVerified = true`  
- AC: Unverified users see a banner prompt but can still browse  
- Services: AuthService, NotificationService  
- Notes: Requires email sending integration (SendGrid or SMTP)

---

**F-01-06** · Password Reset `[x] Done` · Size: M  
As a user, I want to reset my password so that I can regain access if I forget it.  
- AC: POST `/api/v1/auth/forgot-password` sends a reset link  
- AC: POST `/api/v1/auth/reset-password` accepts token + new password  
- AC: Reset tokens expire after 1 hour  
- Services: AuthService, NotificationService

---

**F-01-07** · Frontend Auth State `[x] Done` · Size: S  
As a developer, the frontend must persist the JWT and protect routes.  
- AC: Token stored in `localStorage` under `cue.accessToken`  
- AC: Unauthenticated access to protected routes redirects to `/login`  
- AC: `signOut` action clears token and Redux state  
- Files: `frontend/src/store.ts`, `frontend/src/App.tsx` (`ProtectedRoute`)

---

### EPIC-02 · User Profile Management

> Allow users to view and update their personal contact details.

---

**F-02-01** · Get My Profile `[x] Done` · Size: S  
As a signed-in user, I want to view my profile so that I can confirm my details.  
- AC: GET `/api/v1/profiles/me` returns `{id, email, firstName, lastName, phone, dateOfBirth, isVerified, trustScore, createdAt, updatedAt}`  
- AC: Requires valid JWT; returns 401 otherwise  
- AC: PasswordHash is never returned  
- Services: ProfileService  
- Files: `backend/Services/ProfileService/Controllers/ProfileController.cs`, `ProfileModels.cs`

---

**F-02-02** · Update My Profile `[x] Done` · Size: S  
As a user, I want to edit my name, phone, and date of birth.  
- AC: PUT `/api/v1/profiles/me` accepts `{firstName, lastName, phone?, dateOfBirth?}`  
- AC: Returns updated profile  
- AC: Empty firstName/lastName returns 400  
- Services: ProfileService  
- Files: `ProfileController.cs`, `Cue.Domain/User.cs` (`UpdateProfile` method)

---

**F-02-03** · Profile Page UI `[x] Done` · Size: M  
As a user, I want a profile settings page in the app.  
- AC: Route `/profile` renders an edit form  
- AC: Form pre-fills with current data on load  
- AC: Success message shown after save  
- AC: Navigation menu contains "My profile" link  
- AC: Profile button shows user initials dynamically  
- Services: Frontend  
- Files: `frontend/src/App.tsx` (`Profile` component, `Shell` component), `frontend/src/profileApi.ts`

---

**F-02-04** · Profile Photo Upload `[x] Done` · Size: L  
As a user, I want to upload a profile photo so that I appear more personal.  
- AC: PUT `/api/v1/profiles/me/photo` accepts a multipart image upload  
- AC: Image stored in blob storage (S3-compatible)  
- AC: URL returned and stored on User entity  
- AC: Photo rendered in the nav avatar  
- Services: ProfileService  
- Notes: Needs blob storage integration; validate MIME type and max size (5MB)

---

**F-02-05** · Account Deletion `[x] Done` · Size: L  
As a user, I want to permanently delete my account and data.  
- AC: DELETE `/api/v1/profiles/me` soft-deletes the User (sets `DeletedAt`)  
- AC: Active bookings block deletion with a clear error  
- AC: Confirmation step required in UI  
- Services: ProfileService, AuthService

---

### EPIC-03 · Provider Profile & Availability

> Providers can create and manage their service profile and schedule.

---

**F-03-01** · Create Provider Profile `[x] Done` · Size: M  
As a Provider, I want to set up my service profile so that seekers can find me.  
- AC: POST `/api/v1/profiles/provider` accepts `{hourlyRate, bio, specialties[], maxRadiusKm}`  
- AC: One profile per user; duplicate returns 409  
- AC: Publishes `ProfileCreatedEvent` via RabbitMQ  
- Services: ProfileService  
- Files: `Cue.Domain/ProviderProfile.cs`, `Cue.Application/Profiles/UpdateProfileCommand.cs`

---

**F-03-02** · Update Provider Profile `[x] Done` · Size: S  
As a Provider, I want to edit my bio, rate, and specialties.  
- AC: PUT `/api/v1/profiles/provider` uses `UpdateProfileCommand` handler  
- AC: Validates rate > 0, at least one specialty  
- Services: ProfileService  
- Files: `Cue.Application/Profiles/UpdateProfileCommand.cs`

---

**F-03-03** · Activate / Deactivate Profile `[x] Done` · Size: S  
As a Provider, I want to pause my profile so I don't receive new bookings.  
- AC: PATCH `/api/v1/profiles/provider/status` with `{active: bool}`  
- AC: Inactive profiles hidden from discovery results  
- Services: ProfileService, DiscoveryService  
- Files: `Cue.Domain/ProviderProfile.cs` (`Activate`, `Deactivate`)

---

**F-03-04** · Manage Availability Slots `[x] Done` · Size: L  
As a Provider, I want to define when I'm available so seekers can book valid times.  
- AC: POST `/api/v1/profiles/provider/availability` creates an `AvailabilitySlot`  
- AC: DELETE `/api/v1/profiles/provider/availability/{id}` removes a slot (if not booked)  
- AC: GET `/api/v1/profiles/provider/availability` returns my slots  
- AC: Overlapping slots rejected with 409  
- Services: ProfileService  
- Files: `Cue.Domain/AvailabilitySlot.cs`

---

**F-03-05** · Provider Profile UI `[x] Done` · Size: L  
As a Provider, I want a dashboard to manage my profile, rate, bio, and availability.  
- AC: Route `/provider/profile` with all provider fields editable  
- AC: Availability calendar showing added/booked/free slots  
- Services: Frontend

---

**F-03-06** · Intro Video Upload `[ ] Todo` · Size: M  
As a Provider, I want to upload a short intro video to my profile.  
- AC: PUT `/api/v1/profiles/provider/video` accepts MP4 ≤ 60s / 50MB  
- AC: URL stored in `ProviderProfile.IntroVideoUrl`  
- AC: Shown on the provider card in discovery  
- Services: ProfileService  
- Notes: Needs transcoding / CDN integration

---

### EPIC-04 · Discovery & Search

> Seekers can browse, search, and filter available providers.

---

**F-04-01** · List Available Providers `[x] Done` · Size: M  
As a Seeker, I want to browse available providers so that I can find a companion.  
- AC: GET `/api/v1/discovery/providers?specialty=&maxRate=&city=&page=&pageSize=` returns paginated list  
- AC: Only active providers included  
- AC: Sorted by rating descending by default  
- Services: DiscoveryService  
- Files: `Cue.Application/Bookings/BookingQueries.cs` (`GetAvailableProvidersQuery`)  
- Notes: DiscoveryService Program.cs is currently empty — needs DB context + controller added

---

**F-04-02** · Search Providers `[x] Done` · Size: M  
As a Seeker, I want to search by name or specialty keyword.  
- AC: Query parameter `q` performs case-insensitive full-text match on name, bio, specialties  
- AC: Returns ranked results  
- Services: DiscoveryService  
- Notes: Consider Postgres `tsvector` or `ILIKE` for MVP; Elasticsearch later

---

**F-04-03** · Filter & Sort `[~] In Progress` · Size: S  
As a Seeker, I want to filter providers by specialty, rate range, and distance.  
- AC: Filters: `specialty`, `minRate`, `maxRate`, `maxDistanceKm`  
- AC: Sort options: `rating`, `price`, `distance`, `newest`  
- Services: DiscoveryService  
- Notes (2026-08-26): `minRate`/`maxRate` filters and `sortBy=rating|price|newest` shipped server + UI. Distance filter/sort deferred until provider geo data exists.

---

**F-04-04** · Provider Detail Page `[x] Done` · Size: M  
As a Seeker, I want to view a full provider profile before booking.  
- AC: Route `/providers/{id}` shows bio, specialties, photos, rating, reviews summary  
- AC: Shows availability calendar  
- AC: "Book" CTA navigates to `/book`  
- Services: Frontend, DiscoveryService  
- Notes (2026-08-26): `ProviderDetailPage` at `/providers/:id` (bio, specialties, photo/initials, rating, upcoming free slots) + card portrait/name link to it; Book CTA seeds the booking draft and navigates to `/book`.

---

**F-04-05** · Save / Favourite Providers `[ ] Todo` · Size: S  
As a Seeker, I want to save providers to a favourites list.  
- AC: Heart button on card toggles saved state  
- AC: Saved list persisted server-side (not just local state)  
- AC: Route `/saved` shows saved providers  
- Services: UserService, Frontend  
- Notes: Currently client-side only in `Discovery` component — needs API

---

**F-04-06** · Discovery UI Wired to Real API `[x] Done` · Size: M  
As a developer, the discovery page should use real data from DiscoveryService.  
- AC: `useGetProvidersQuery` calls real `/api/v1/discovery/providers`  
- AC: Mock data fallback only when API is unreachable  
- Services: Frontend, DiscoveryService  
- Files: `frontend/src/api.ts` (currently uses `fakeBaseQuery`)

---

### EPIC-05 · Booking & Order Lifecycle

> Full lifecycle from booking request through confirmation, in-progress, and completion.

---

**F-05-01** · Create Booking `[x] Done` · Size: M  
As a Seeker, I want to request a booking with a provider.  
- AC: POST `/api/v1/bookings` creates a `ServiceOrder` in `PendingPayment` status  
- AC: Locks the matching `AvailabilitySlot`  
- AC: Publishes `BookingCreatedEvent`  
- AC: Returns `{orderId, status, totalAmount}`  
- Services: BookingService  
- Files: `Cue.Application/Bookings/CreateBookingCommand.cs`, `BookingsController.cs`

---

**F-05-02** · Confirm Booking (Provider) `[x] Done` · Size: M  
As a Provider, I want to confirm or decline incoming booking requests.  
- AC: PATCH `/api/v1/bookings/{id}/confirm` transitions `PendingPayment → Confirmed` ✓ (verified live on kind)  
- AC: Only the assigned provider can confirm ✓ (403 for other users)  
- AC: Publishes `BookingConfirmedEvent` ✓ (via RabbitMQ, now deployed locally)  
- AC: Notifies seeker — notification consumer is a no-op stub; event is published  
- Note: with payments not yet integrated there is no charge step, so orders sit in `PendingPayment` until the provider confirms  
- Invalid transition returns 409 with error body ✓  
- Services: BookingService

---

**F-05-03** · Cancel Booking `[x] Done` · Size: M  
As a participant, I want to cancel a booking with a reason.  
- AC: POST `/api/v1/bookings/{id}/cancel` with `{reason}` uses `CancelBookingCommand` ✓ (verified live)  
- AC: Either party can cancel; only provider/seeker of the order allowed ✓  
- AC: Releases the `AvailabilitySlot` ✓ (booking_id cleared via `Release`)  
- AC: Publishes `BookingCancelledEvent` ✓  
- AC: Partial refund logic — deferred until EPIC-06 payments exist (`[~]`)  
- Services: BookingService  
- Files: `Cue.Application/Bookings/BookingCommands.cs` (`CancelBookingCommand` ✓)

---

**F-05-04** · Mark Order In-Progress `[x] Done` · Size: S  
As a Provider, I want to mark an order as started when the session begins.  
- AC: PATCH `/api/v1/bookings/{id}/start` transitions `Confirmed → InProgress` ✓ (verified live)  
- AC: Only the provider can start ✓ (seeker gets 403)  
- Services: BookingService  
- Files: `Cue.Domain/ServiceOrder.cs` (`Start` method ✓)

---

**F-05-05** · Complete Order `[x] Done` · Size: S  
As a Provider, I want to mark an order as complete when the session ends.  
- AC: PATCH `/api/v1/bookings/{id}/complete` transitions `InProgress → Completed` ✓ (verified live)  
- AC: Publishes `BookingCompletedEvent` ✓  
- AC: Triggers review prompt notification to seeker — deferred to notifications epic (`[~]`)  
- Services: BookingService  
- Files: `Cue.Application/Bookings/BookingCommands.cs` (`CompleteOrderCommand` ✓)

---

**F-05-06** · Get My Bookings `[x] Done` · Size: S  
As a user, I want to see all my past and upcoming bookings.  
- AC: GET `/api/v1/bookings` returns the caller's orders (both roles in one list; client filters by `providerId`/`seekerId`) — no pagination yet (`[~]`, fine at current volumes)  
- AC: Status serialized as string names ("Confirmed") for direct UI rendering  
- AC: Uses `GetUserBookingsQuery` handler ✓  
- AC: 401 without token ✓  
- Services: BookingService  
- Files: `Cue.Application/Bookings/BookingQueries.cs`

---

**F-05-07** · Bookings UI Wired to Real API `[x] Done` · Size: M  
As a user, I want the My Bookings page to show real data.  
- AC: `useGetMyBookingsQuery` RTK Query hook calls `/api/v1/bookings` ✓  
- AC: Status badges via `.status-badge status-*` CSS classes (PendingPayment/Confirmed/InProgress/Completed/Cancelled/Disputed) ✓  
- AC: Cancel button available for cancellable orders ✓ (with inline reason prompt)  
- Services: Frontend  
- Files: `frontend/src/bookingApi.ts`, `frontend/src/App.tsx` (`Bookings` component)

---

**F-05-08** · Provider Bookings Dashboard `[x] Done` · Size: L  
As a Provider, I want to see and manage incoming booking requests.  
- AC: Route `/provider/bookings` shows incoming rows with Confirm (PendingPayment) / Decline-with-reason actions ✓  
- AC: Start button for upcoming confirmed bookings; Complete for in-progress ✓  
- AC: Completed/cancelled history shown with status badges ✓  
- Note: single flat list per role filter rather than tabbed sections — acceptable for now  
- Services: Frontend, BookingService

---

### EPIC-06 · Payments

> Stripe-based payment capture tied to the booking lifecycle.

---

**F-06-01** · Create Payment Intent `[ ] Todo` · Size: M  
As a Seeker, I want the platform to prepare a payment when I confirm a booking.  
- AC: POST `/api/v1/payments/intent` with `{orderId, amount, currency}` creates Stripe PaymentIntent  
- AC: Returns `{clientSecret}` for frontend to complete payment  
- AC: Creates `PaymentTransaction` record in `Authorized` status  
- Services: PaymentService  
- Files: `PaymentsController.cs` (stub exists ✓), `PaymentModels.cs`  
- Notes: Stripe SDK integration needed; `IPaymentGateway` abstraction already defined

---

**F-06-02** · Stripe Webhook Handler `[ ] Todo` · Size: M  
As the platform, payment status must update when Stripe notifies us.  
- AC: POST `/api/v1/payments/webhook` verifies Stripe signature  
- AC: `payment_intent.succeeded` → captures transaction, confirms order  
- AC: `payment_intent.payment_failed` → transitions transaction to `Failed`  
- AC: Publishes `PaymentProcessedEvent`  
- Services: PaymentService  
- Files: `PaymentsController.cs` (partial ✓)  
- Notes: Add `Stripe-Signature` header verification

---

**F-06-03** · Refund Processing `[ ] Todo` · Size: M  
As a Seeker, I want to receive a refund when a booking is cancelled within policy.  
- AC: POST `/api/v1/payments/{id}/refund` issues Stripe refund  
- AC: Transitions `PaymentTransaction` to `Refunded`  
- AC: Publishes `PaymentProcessedEvent` with refund status  
- Services: PaymentService  
- Files: `Cue.Domain/PaymentTransaction.cs` (`Refund` method ✓)

---

**F-06-04** · Payment UI — Checkout Flow `[ ] Todo` · Size: L  
As a Seeker, I want to pay securely from the booking page.  
- AC: Stripe Elements embedded in `/book` page after booking is created  
- AC: Payment status reflected in booking status  
- AC: Error states handled gracefully  
- Services: Frontend, PaymentService  
- Files: `frontend/src/App.tsx` (`Booking` component)

---

**F-06-05** · Platform Fee Calculation `[ ] Todo` · Size: S  
As the platform, I want to automatically deduct a service fee from each booking.  
- AC: Fee calculated as configurable % (default 15%) in `CreateBookingCommand`  
- AC: `ServiceOrder.PlatformFee` and `ProviderEarnings` set correctly  
- Services: BookingService

---

**F-06-06** · Provider Payout `[ ] Todo` · Size: XL  
As a Provider, I want to receive my earnings after a completed booking.  
- AC: Stripe Connect account linked to provider  
- AC: Payout triggered after order reaches `Completed`  
- AC: Payout record stored; provider can view earnings history  
- Services: PaymentService, ProfileService  
- Notes: Requires Stripe Connect onboarding flow — significant scope

---

### EPIC-07 · Real-time Chat

> Participants in a booking can exchange messages in real-time via SignalR.

---

**F-07-01** · SignalR Hub — Join & Send `[x] Done` · Size: M  
As a booking participant, I want to send and receive messages in real-time.  
- AC: `ChatHub.JoinOrder` validates participant and adds to SignalR group  
- AC: `ChatHub.SendMessage` persists `ChatMessage`, broadcasts to group  
- AC: Non-participants rejected with `HubException`  
- Services: ChatService  
- Files: `backend/Services/ChatService/ChatHub.cs` ✓

---

**F-07-02** · Chat Frontend Connection `[x] Done` · Size: M  
As a user, the messages page must connect to the SignalR hub.  
- AC: `createChatConnection` factory builds SignalR connection with JWT  
- AC: Incoming messages appended to UI in real-time  
- AC: Graceful degradation if connection fails  
- Services: Frontend  
- Files: `frontend/src/chatTransport.ts`, `frontend/src/App.tsx` (`Messages` component)

---

**F-07-03** · Message History `[ ] Todo` · Size: M  
As a user, I want to see past messages when I open a conversation.  
- AC: GET `/api/v1/chats/{orderId}/messages?page=&pageSize=` returns paginated history  
- AC: Messages loaded before establishing real-time connection  
- AC: Sorted oldest-first  
- Services: ChatService  
- Files: `Cue.Domain/ChatMessage.cs`

---

**F-07-04** · Conversation List `[ ] Todo` · Size: M  
As a user, I want to see all my active conversations listed.  
- AC: GET `/api/v1/chats/conversations` returns all orders the user is a participant in, with last message preview  
- AC: Unread count badge shown  
- Services: ChatService, Frontend  
- Notes: Frontend currently has hardcoded Maya/Jonah mock conversations

---

**F-07-05** · Message Types — Images & Files `[ ] Todo` · Size: L  
As a user, I want to share images in chat.  
- AC: Image upload to blob storage, URL sent as `MessageType.Image`  
- AC: File messages support PDF/doc attachments (`MessageType.File`)  
- AC: Displayed inline or as download link in chat UI  
- Services: ChatService  
- Files: `Cue.Domain/Enums.cs` (MessageType enum ✓)

---

**F-07-06** · Read Receipts & Typing Indicators `[ ] Todo` · Size: M  
As a user, I want to see when my message is read.  
- AC: `MarkRead` SignalR event updates message read state  
- AC: Typing indicator broadcasts while user is typing  
- AC: UI shows "Seen" under last read message  
- Services: ChatService, Frontend

---

### EPIC-08 · Reviews & Ratings

> Post-booking mutual review system with sub-scores.

---

**F-08-01** · Submit Review `[ ] Todo` · Size: M  
As a Seeker, I want to rate and review my experience after a completed booking.  
- AC: POST `/api/v1/reviews` with `{orderId, rating, comment, timelinessScore?, communicationScore?}`  
- AC: Only one review per order per reviewer  
- AC: Only allowed after order status is `Completed`  
- AC: Publishes `ReviewSubmittedEvent`  
- Services: ReviewService  
- Files: `Cue.Domain/Review.cs` ✓

---

**F-08-02** · Provider Can Review Seeker `[ ] Todo` · Size: S  
As a Provider, I want to review seekers after a session.  
- AC: Same endpoint as F-08-01; reviewerId = Provider, revieweeId = Seeker  
- AC: Mutual review system — both parties can review  
- Services: ReviewService

---

**F-08-03** · Get Reviews for a User `[ ] Todo` · Size: S  
As a Seeker, I want to read reviews about a provider before booking.  
- AC: GET `/api/v1/reviews?revieweeId={userId}&page=&pageSize=` returns list  
- AC: Average rating and sub-scores shown  
- Services: ReviewService, Frontend

---

**F-08-04** · Update Provider Average Rating `[ ] Todo` · Size: M  
As the platform, the provider's average rating must stay current.  
- AC: On `ReviewSubmittedEvent`, recalculate `ProviderProfile.AverageRating`  
- AC: Weighted average using all completed-order reviews  
- Services: ReviewService subscribing to event, ProfileService  
- Files: `Cue.Domain/ProviderProfile.cs`

---

**F-08-05** · Reviews UI `[ ] Todo` · Size: M  
As a Seeker, I want to leave a review from the bookings page.  
- AC: Completed bookings show "Leave a review" CTA  
- AC: Star rating widget with optional sub-score sliders  
- AC: Submitted reviews shown read-only on provider detail page  
- Services: Frontend

---

### EPIC-09 · Trust & Safety

> Trust score system, identity verification, and content moderation.

---

**F-09-01** · Trust Score Engine `[ ] Todo` · Size: L  
As the platform, I want to maintain a trust score per user to indicate reliability.  
- AC: `TrustEvent` created on: booking completed, review submitted, dispute resolved, account verified  
- AC: Score clamped 0–100; starts at 50  
- AC: `User.ApplyTrustDelta` called and persisted  
- AC: Publishes `TrustScoreUpdatedEvent`  
- Services: ReviewService, SupportService  
- Files: `Cue.Domain/TrustEvent.cs` ✓, `Cue.Domain/User.cs` (`ApplyTrustDelta` ✓)

---

**F-09-02** · ID Verification `[ ] Todo` · Size: XL  
As the platform, I want providers to verify their identity before going live.  
- AC: Integration with identity verification provider (Stripe Identity or Jumio)  
- AC: `User.Verify()` called on successful verification  
- AC: Verified badge shown on provider cards  
- Services: ProfileService, AuthService  
- Files: `Cue.Domain/User.cs` (`Verify` method ✓)

---

**F-09-03** · Report a User `[ ] Todo` · Size: M  
As a user, I want to report inappropriate behaviour.  
- AC: POST `/api/v1/support/reports` with `{reportedUserId, reason}`  
- AC: Report escalated if same user reported 3+ times  
- Services: SupportService

---

**F-09-04** · Content Moderation `[ ] Todo` · Size: L  
As the platform, I want chat messages and reviews screened for harmful content.  
- AC: Async check via moderation API (e.g. OpenAI Moderation) on message send  
- AC: Flagged content quarantined, user notified  
- Services: ChatService, ReviewService

---

**F-09-05** · Trust Score Displayed in UI `[ ] Todo` · Size: S  
As a Seeker, I want to see a trust indicator on provider profiles.  
- AC: Trust score or verified badge shown on provider card and detail page  
- AC: Tooltip explains what the score means  
- Services: Frontend

---

### EPIC-10 · Notifications

> In-app and push notifications for key lifecycle events.

---

**F-10-01** · Notification Persistence `[ ] Todo` · Size: M  
As the platform, notifications must be stored per user.  
- AC: NotificationService subscribes to domain events via RabbitMQ  
- AC: Creates `Notification` records for: BookingCreated, BookingConfirmed, BookingCancelled, PaymentProcessed, NewMessage, ReviewSubmitted, TrustScoreUpdated  
- Services: NotificationService  
- Files: `Cue.Domain/Notification.cs` ✓, `Cue.Domain/Enums.cs` (NotificationType ✓)

---

**F-10-02** · Get Notifications API `[ ] Todo` · Size: S  
As a user, I want to fetch my unread notifications.  
- AC: GET `/api/v1/notifications?unreadOnly=true&page=&pageSize=` returns list  
- AC: PATCH `/api/v1/notifications/{id}/read` marks one as read  
- AC: PATCH `/api/v1/notifications/read-all` marks all as read  
- Services: NotificationService

---

**F-10-03** · Notifications UI — Bell Icon `[ ] Todo` · Size: M  
As a user, I want to see a notification badge in the header.  
- AC: Bell icon in nav with unread count badge  
- AC: Dropdown shows recent notifications  
- AC: Clicking a notification navigates to relevant page  
- Services: Frontend

---

**F-10-04** · Real-time Notification Push `[ ] Todo` · Size: M  
As a user, I want notifications to appear instantly without refreshing.  
- AC: NotificationService pushes via SignalR or SSE to connected clients  
- AC: Browser tab shows count in title when backgrounded  
- Services: NotificationService, Frontend

---

**F-10-05** · Email Notifications `[ ] Todo` · Size: L  
As a user, I want email summaries for important events when I am offline.  
- AC: Booking confirmation and cancellation always trigger email  
- AC: User can opt out of non-critical email notifications  
- Services: NotificationService  
- Notes: Requires email provider integration (SendGrid)

---

### EPIC-11 · Support & Disputes

> Users can raise disputes over bookings; admins can resolve them.

---

**F-11-01** · Open a Dispute `[ ] Todo` · Size: M  
As a user, I want to dispute a booking if something went wrong.  
- AC: POST `/api/v1/support/disputes` with `{orderId, reason}` creates `Dispute`  
- AC: Order status transitions to `Disputed`  
- AC: Both parties notified  
- Services: SupportService  
- Files: `Cue.Domain/Dispute.cs` ✓

---

**F-11-02** · Dispute Review Workflow `[ ] Todo` · Size: L  
As an Admin, I want to review and resolve disputes.  
- AC: PATCH `/api/v1/support/disputes/{id}/review` → `InReview`  
- AC: PATCH `/api/v1/support/disputes/{id}/resolve` with `{resolution}` → `Resolved`  
- AC: PATCH `/api/v1/support/disputes/{id}/escalate` → `Escalated`  
- AC: Resolution triggers trust score adjustment via `TrustEvent`  
- Services: SupportService  
- Files: `Cue.Domain/Dispute.cs` (`BeginReview`, `Resolve`, `Escalate` ✓)

---

**F-11-03** · Help Centre Content `[x] Done` · Size: XS  
As a visitor, I want access to static help pages.  
- AC: `/help`, `/safety`, `/privacy`, `/terms` pages exist  
- Services: Frontend  
- Files: `frontend/src/App.tsx` (`LegalPage` component ✓)

---

**F-11-04** · Contact Support Form `[ ] Todo` · Size: M  
As a user, I want to submit a support request via a form.  
- AC: Route `/help/contact` with subject and message fields  
- AC: POST `/api/v1/support/tickets` creates a support ticket  
- AC: Confirmation email sent to user  
- Services: SupportService, Frontend

---

### EPIC-12 · Analytics & Reporting

> Providers and admins get insight into platform activity.

---

**F-12-01** · Provider Analytics API `[ ] Todo` · Size: S  
As a Provider, I want to see my performance metrics.  
- AC: GET `/api/v1/analytics/provider/me` returns `{totalBookings, completedBookings, grossRevenue, completionRate}`  
- AC: Uses `GetProviderAnalyticsQuery` MediatR handler  
- Services: AnalyticsService  
- Files: `Cue.Application/Analytics/GetProviderAnalyticsQuery.cs` ✓

---

**F-12-02** · Provider Dashboard UI `[ ] Todo` · Size: M  
As a Provider, I want a dashboard showing my stats.  
- AC: Route `/provider/dashboard` with metrics cards  
- AC: Earnings chart (last 30 days, weekly buckets)  
- AC: Booking completion rate gauge  
- Services: Frontend, AnalyticsService

---

**F-12-03** · Admin Platform Analytics `[ ] Todo` · Size: L  
As an Admin, I want to monitor platform health.  
- AC: GET `/api/v1/analytics/platform` returns total users, bookings, revenue, disputes  
- AC: Time-series data for charts  
- Services: AnalyticsService  
- Notes: Aggregates across all schemas; query performance matters at scale

---

**F-12-04** · Revenue Reporting Export `[ ] Todo` · Size: M  
As an Admin, I want to export financial data as CSV.  
- AC: GET `/api/v1/analytics/exports/revenue?from=&to=` returns CSV  
- AC: Includes: orderId, amount, platformFee, providerEarnings, date  
- Services: AnalyticsService

---

### EPIC-13 · Admin Panel

> Web-based admin dashboard for platform management.

---

**F-13-01** · Admin Authentication `[ ] Todo` · Size: S  
As an Admin, I want secure login separate from user login.  
- AC: Existing `/api/v1/auth/login` used; role claim `Admin` checked  
- AC: Frontend route `/admin` protected by role guard  
- Services: AuthService, Frontend

---

**F-13-02** · User Management `[ ] Todo` · Size: L  
As an Admin, I want to view and manage user accounts.  
- AC: GET `/api/v1/users` paginated list with search  
- AC: GET `/api/v1/users/{id}` user detail  
- AC: PATCH `/api/v1/users/{id}/suspend` soft-bans user  
- Services: UserService  
- Files: `backend/Services/UserService/Program.cs` (currently empty)

---

**F-13-03** · Provider Verification Review `[ ] Todo` · Size: M  
As an Admin, I want to review pending provider verifications.  
- AC: Queue of unverified providers with submitted documents  
- AC: Approve/reject action calls `User.Verify()`  
- Services: ProfileService, Frontend (admin)

---

**F-13-04** · Dispute Management UI `[ ] Todo` · Size: M  
As an Admin, I want a UI to work through open disputes.  
- AC: `/admin/disputes` list with status filters  
- AC: Detail view with full order and chat history  
- AC: Action buttons: Begin Review, Resolve, Escalate  
- Services: Frontend (admin), SupportService

---

**F-13-05** · Audit Log `[ ] Todo` · Size: L  
As an Admin, I want to see a log of all admin actions.  
- AC: Every admin action (suspend, verify, resolve) written to audit log  
- AC: Logs include: actor, action, target, timestamp  
- Services: UserService / SupportService

---

### EPIC-14 · Infrastructure & DevOps

> Containerisation, CI/CD, secrets management, and observability.

---

**F-14-01** · Kind Kubernetes — Local Dev `[x] Done` · Size: M  
As a developer, I want one command to start the full stack locally.  
- AC: `kind-create.ps1` creates local Kind cluster + registry  
- AC: `build-and-load.ps1` builds and loads all Docker images into Kind  
- AC: `kubectl apply -k infra/k8s/overlays/dev` deploys all services  
- AC: `port-forward-ingress.ps1` exposes the app at `http://localhost:8080`  
- Files: `scripts/kind-create.ps1`, `scripts/build-and-load.ps1`, `infra/k8s/overlays/dev/`  
- Notes: Kind Kubernetes replaces Docker Compose as the local dev approach. All services containerised, Postgres + RabbitMQ on cluster, MinIO for storage.

---

**F-14-02** · Dockerfiles for All Services `[ ] Todo` · Size: M  
As a developer, each service must be containerised.  
- AC: Multi-stage Dockerfile for each .NET service (build + runtime layers)  
- AC: Frontend Dockerfile with Vite build + nginx serve  
- AC: Images under 200MB  
- Files: `backend/Services/*/Dockerfile`, `frontend/Dockerfile`

---

**F-14-03** · CI Pipeline `[ ] Todo` · Size: L  
As the team, every PR must be validated automatically.  
- AC: GitHub Actions (or equivalent) runs on every PR  
- AC: Steps: restore → build → test → lint  
- AC: Failing checks block merge  
- Files: `.github/workflows/ci.yml`

---

**F-14-04** · CD Pipeline — Staging `[ ] Todo` · Size: L  
As the team, merges to main deploy automatically to staging.  
- AC: CD pipeline builds images, pushes to registry, deploys to staging Kubernetes/ECS  
- AC: Smoke tests run post-deploy  
- Files: `.github/workflows/cd.yml`

---

**F-14-05** · Secrets Management `[ ] Todo` · Size: M  
As the team, secrets must not be committed to source control.  
- AC: All secrets via environment variables or secret manager  
- AC: `.env.example` documents required variables  
- AC: JWT signing key, DB connection strings, Stripe keys, RabbitMQ credentials all externalised  

---

**F-14-06** · Structured Logging & Tracing `[ ] Todo` · Size: M  
As the team, I want distributed tracing across services.  
- AC: OpenTelemetry SDK added to all services  
- AC: Traces exported to Jaeger/Grafana Tempo  
- AC: Structured JSON logs with correlation IDs  
- Notes: Use `Serilog` or `Microsoft.Extensions.Logging` with OTLP exporter

---

**F-14-07** · Database Migrations `[ ] Todo` · Size: M  
As the team, schema changes must be managed through versioned migrations.  
- AC: EF Core migrations generated and applied on service startup (or via separate migration job)  
- AC: `DatabaseInitializer.InitializeAsync` currently runs raw SQL — replace with EF migrations  
- Files: `Cue.Infrastructure.Data/DatabaseInitializer.cs`

---

**F-14-08** · Rate Limiting (API Gateway) `[ ] Todo` · Size: S  
As the platform, I want to protect services from abuse.  
- AC: Ocelot rate limiting configured (120 req/min default; already scaffolded in `ocelot.json`)  
- AC: Per-client limits for auth endpoints (stricter)  
- Files: `backend/Services/APIGateway/ocelot.json`

---

### EPIC-15 · Testing & Quality

> Unit, integration, and end-to-end test coverage.

---

**F-15-01** · Domain Unit Tests `[ ] Todo` · Size: M  
As a developer, I want unit tests for all domain aggregates.  
- AC: Tests for `User`, `ServiceOrder`, `ProviderProfile`, `Dispute`, `PaymentTransaction`, `Review`, `AvailabilitySlot`  
- AC: All state machine transitions covered (happy path + invalid transitions)  
- AC: ≥ 80% branch coverage on `Cue.Domain`  
- Files: `tests/Cue.Domain.Tests/` (xUnit test project exists ✓)

---

**F-15-02** · Application Layer Tests `[ ] Todo` · Size: L  
As a developer, I want tests for all MediatR command and query handlers.  
- AC: In-memory EF Core DB used for handler tests  
- AC: BookingCommands, BookingQueries, UpdateProfileCommand, GetProviderAnalyticsQuery all covered  
- AC: FluentValidation validators tested for valid + invalid inputs

---

**F-15-03** · API Integration Tests `[ ] Todo` · Size: L  
As a developer, I want integration tests that test HTTP endpoints end-to-end.  
- AC: `WebApplicationFactory<T>` used for each service  
- AC: Auth, Profile, Booking, Payment endpoints tested  
- AC: Real PostgreSQL via test container (Testcontainers)

---

**F-15-04** · Frontend Unit Tests `[ ] Todo` · Size: M  
As a developer, I want unit tests for frontend components and RTK Query hooks.  
- AC: Vitest + React Testing Library  
- AC: Auth flow, booking form, profile edit form covered  
- AC: MSW (Mock Service Worker) used to mock APIs

---

**F-15-05** · End-to-End Tests `[ ] Todo` · Size: XL  
As QA, I want automated E2E tests covering critical user journeys.  
- AC: Playwright tests for: register → discover → book → pay → chat → review  
- AC: Provider journey: set up profile → confirm booking → complete  
- AC: Tests run in CI against staging  
- Files: `tests/e2e/` (to be created)

---

**F-15-06** · Accessibility Audit `[ ] Todo` · Size: M  
As the team, the frontend must meet WCAG 2.1 AA standards.  
- AC: All interactive elements keyboard-navigable  
- AC: Colour contrast ratios pass  
- AC: Screen reader labels on icon buttons, form fields, navigation  
- AC: axe-core scan in CI with zero critical violations

---

**F-15-07** · Performance Baseline `[ ] Todo` · Size: M  
As the team, key pages must meet performance targets.  
- AC: Lighthouse score ≥ 90 on discovery and home pages  
- AC: Time to Interactive < 3s on 4G throttle  
- AC: API p99 latency < 500ms under 100 concurrent users  

---

### EPIC-16 · Dual Roles & Multi-Service Listings

> A user can act as both a Provider and a Seeker. Providers can publish multiple service listings (service profiles), each linked to a specialty and priced with a flexible rate unit — hourly, per task, per day(s), per week(s), or per month(s), or a custom duration.

**Context & rationale:** The current model assumes one provider profile per user (`ProviderProfile` keyed by `UserId`, one rate, flat specialty tags). This epic generalises it: the *user* becomes dual-role-capable, and the provider side splits into multiple **ServiceProfiles** so a user can offer e.g. "Tennis coaching" at $40/hour and "Hiking buddy" at $120/day simultaneously. Rate units become first-class so pricing matches how the work is actually sold. Existing single-profile behaviour is treated as the special case of exactly one service profile; discovery indexes service profiles rather than the single profile row.

---

**F-16-01** · Dual-Role User Model `[ ] Todo` · Size: M  
As a User, I want to be both a Provider and a Seeker without creating separate accounts.  
- AC: `User` gains role flags / claims (`seeker`, `provider`); both can be held simultaneously  
- AC: Registering as seeker does not block becoming a provider later (and vice versa)  
- AC: JWT carries active roles; auth checks accept either role where relevant  
- AC: Nav shows both entry points ("Book a companion" + "Provider hub") for dual-role users  
- Services: AuthService, UserService, ProfileService, Frontend  
- Files: `Cue.Domain/User.cs`, Auth token generation, `frontend/src/App.tsx` nav/ProtectedRoute  
- Notes: Migration path — any existing provider profile implies `provider` role on first load

---

**F-16-02** · ServiceProfile Entity `[ ] Todo` · Size: L  
As a Provider, I want to create multiple service profiles under my account so each service I offer is listed separately.  
- AC: New aggregate `ServiceProfile { Id, UserId, SpecialtyId, Title, Description, RateAmount, RateUnit, Status }`  
- AC: One user may own N service profiles; per-user cap enforced (e.g. 20) to prevent abuse  
- AC: Each ServiceProfile links to exactly one `Specialty` (from the platform taxonomy)  
- AC: Status lifecycle mirrors today's profile: Draft → Active → Paused; only Active appears in discovery  
- AC: Legacy single `ProviderProfile` mapped to one seeded ServiceProfile during migration  
- Services: ProfileService  
- Files: new `Cue.Domain/ServiceProfile.cs`, `Cue.Domain/Specialty.cs`, repository + MediatR handlers  
- Notes: Supersedes F-03-01/02 single-profile semantics; keep old endpoints working via adapter until S4

---

**F-16-03** · Specialty Taxonomy `[ ] Todo` · Size: M  
As an Admin, I want a managed list of specialties so service profiles link to canonical categories instead of free-text tags.  
- AC: `Specialty { Id, Name, Slug, IsActive, SortOrder }`; seed table from current hardcoded tag list  
- AC: CRUD endpoints admin-only (`/api/v1/profiles/specialties` GET public read)  
- AC: Free-text specialties in existing profiles matched → linked by slug; unmatched ones kept as legacy text  
- AC: Discovery filters switch from string-contains to `SpecialtyId` equality  
- Services: ProfileService, DiscoveryService  
- Files: new `Cue.Domain/Specialty.cs`, seeding in `DatabaseInitializer`

---

**F-16-04** · Flexible Rate Units `[ ] Todo` · Size: L  
As a Provider, I want to price my service by hour, task, day, days, week, weeks, month, months, or a custom duration so pricing matches how I actually sell it.  
- AC: `RateUnit` enum: `Hour`, `Task`, `Day`, `Days`, `Week`, `Weeks`, `Month`, `Months`, `CustomDuration`  
- AC: `CustomDuration` requires a `RateDurationMinutes` value > 0 on the service profile  
- AC: Plural units (`Days`/`Weeks`/`Months`) require a `RateUnitsCount` ≥ 2 (e.g. "per 3 days") — singular forms imply 1  
- AC: Validation rejects negative/zero amounts and inconsistent unit/count/duration combos  
- AC: Rate displayed with correct unit label everywhere (card, detail page, booking flow): "$120 / day", "$45 / task", "$300 / week"  
- AC: Booking price estimate computed from `RateAmount × units booked` for time-based units; fixed amount for `Task`  
- Services: ProfileService, DiscoveryService, BookingService  
- Files: new `Cue.Domain/ValueObjects/RateUnit.cs`, booking estimate logic  
- Notes: Currency stays global/platform-level for now (multi-currency out of scope)

---

**F-16-05** · Service Profile CRUD API `[ ] Todo` · Size: L  
As a Provider, I want full API control over my service profiles so I can manage them programmatically.  
- AC: POST/GET/PUT/DELETE `/api/v1/profiles/service-profiles` scoped to authenticated user  
- AC: DELETE soft-deletes (`DeletedAt`); a service profile with future bookings cannot be deleted  
- AC: Per-service-profile activate/pause endpoint (replaces profile-wide status for listings)  
- AC: Publishes `ServiceProfileCreatedEvent` / `ServiceProfileUpdatedEvent` for discovery indexing  
- Services: ProfileService  
- Files: `ProviderProfileController.cs` split into `ServiceProfilesController.cs`

---

**F-16-06** · Discovery Over Service Profiles `[ ] Todo` · Size: L  
As a Seeker, I want search results to show individual services with their own price/unit so I can compare offerings, not just people.  
- AC: Discovery list returns one card per active ServiceProfile (title, specialty, rate + unit label, provider name/photo/rating)  
- AC: Filter by specialty (via `SpecialtyId`), max rate normalised to hourly equivalent for comparison sorting, rate unit  
- AC: Detail page shows all of a provider's services plus per-service availability  
- AC: Availability slots attach to a ServiceProfile (optional fallback to user-level slots)  
- Services: DiscoveryService  
- Files: `DiscoveryController.cs`, `frontend/src/api.ts` types + `toCard()` mapping

---

**F-16-07** · Multi-Service Provider UI `[ ] Todo` · Size: XL  
As a Provider, I want a dashboard listing all my services where I can add, edit, pause, or remove each one and set its rate unit.  
- AC: `/provider/profile` becomes a service list view with per-service cards + "Add service" flow  
- AC: Add/edit form includes specialty picker (from taxonomy), title, description, rate amount + unit dropdown (hour/task/day/days/week/weeks/month/months/custom duration), custom-duration input when selected  
- AC: Per-service activate/pause toggle; delete with confirmation  
- AC: Dual-role users see a mode switch (Seeking / Providing) that surfaces the right hub without logging out  
- AC: Seeker flows unaffected for users who never create a service profile  
- Services: Frontend  
- Files: `frontend/src/App.tsx` (ProviderDashboard), new `frontend/src/serviceApi.ts`

---

Sprints are 2 weeks. Sprint 0 is setup. Each sprint has a theme and target velocity.

| Sprint | Dates | Theme | Key Deliverables |
|--------|-------|-------|-----------------|
| S0 | 2026-08-25 → 2026-09-07 | Foundation & Setup | Kind Kubernetes local dev, CI pipeline, dev environment docs, DB migrations |
| S1 | 2026-09-08 → 2026-09-21 | Auth & Profile complete | Refresh token, logout, password reset, account deletion, photo upload |
| S2 | 2026-09-22 → 2026-10-05 | Provider & Discovery | Provider profile CRUD, availability slots, Discovery API wired to real data |
| S3 | 2026-10-06 → 2026-10-19 | Booking lifecycle | Confirm/cancel/start/complete booking, bookings list API, provider dashboard |
| S4 | 2026-10-20 → 2026-11-02 | Payments | Stripe integration, checkout UI, platform fees, webhook handler |
| S5 | 2026-11-03 → 2026-11-16 | Chat & Notifications | Message history, conversation list, notification persistence + API + UI |
| S6 | 2026-11-17 → 2026-11-30 | Reviews & Trust | Submit review, update ratings, trust score engine, trust UI |
| S7 | 2026-12-01 → 2026-12-14 | Support & Admin | Disputes, user management, admin panel foundation |
| S8 | 2026-12-15 → 2026-12-28 | Analytics & Provider tools | Analytics API, provider dashboard UI, revenue export |
| S9 | 2026-12-29 → 2027-01-11 | Hardening & Testing | Integration tests, E2E tests, accessibility audit, performance baseline |
| S10 | 2027-01-12 → 2027-01-25 | Launch prep | CD pipeline, secrets management, staging smoke tests, public beta |

---

## 7. Definition of Done

A story is **Done** when all of the following are true:

- [ ] Code reviewed and approved by at least one other engineer
- [ ] All acceptance criteria verified manually or via automated test
- [ ] Unit or integration tests written and passing
- [ ] No new TypeScript / C# compiler errors or warnings
- [ ] No secrets committed; configuration uses environment variables
- [ ] API endpoints return correct HTTP status codes
- [ ] Frontend changes are keyboard-navigable and labelled for screen readers
- [ ] Build passes in CI
- [ ] No regression in existing passing tests
- [ ] Relevant documentation updated (this file, README, or API docs)

---

## 8. Risk Register

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|-----------|--------|-----------|
| R-01 | Stripe Connect payout onboarding is complex and slow to certify | High | High | Start Stripe Connect integration early (S4); use Stripe test mode throughout |
| R-02 | Real-time features (SignalR, notifications) add infrastructure complexity | Medium | Medium | Prototype in S0; use managed SignalR service in production |
| R-03 | PostgreSQL schema changes break running services | Medium | High | Migrate to EF Core migrations (F-14-07) before S3; add automated migration step |
| R-04 | Identity verification (F-09-02) has long third-party review cycles | High | Medium | Design as optional for MVP; require verification for going-live only |
| R-05 | Discovery service performance degrades with many providers | Low | Medium | Add indexes on specialty and location; consider caching after S2 |
| R-06 | RabbitMQ message processing failures cause silent data loss | Medium | High | Implement dead-letter queues and alerting before S5 |
| R-07 | Legal / regulatory compliance for companion services varies by region | High | High | Consult legal before public launch; add jurisdiction flag to user registration |
| R-08 | Frontend bundle grows too large with new pages | Low | Low | Implement React.lazy code-splitting at route level |
| R-09 | ServiceProfile refactor (EPIC-16) breaks existing single-profile flows and bookings mid-project | Medium | High | Ship behind adapter endpoints (F-16-02 Notes); migrate legacy ProviderProfile to seeded ServiceProfile; land before S4 payment logic depends on rate units |

---

## 9. Progress Tracker

Update this table at the end of each sprint.

### Status Key
`✅ Done` · `🔄 In Progress` · `📋 Planned` · `⛔ Blocked` · `❌ Dropped`

| Feature ID | Title | Status | Sprint | Notes |
|------------|-------|--------|--------|-------|
| F-01-01 | User Registration | ✅ Done | — | |
| F-01-02 | User Login | ✅ Done | — | |
| F-01-03 | Refresh Token | ✅ Done | — | |
| F-01-04 | Logout / Token Revocation | ✅ Done | — | |
| F-01-05 | Email Verification | ✅ Done | S1 | `auth.email_verification_tokens`, verification email on register via Mailjet, POST /verify-email + /resend-verification (24h tokens), /verify-email page + unverified banner with resend |
| F-01-06 | Password Reset | ✅ Done | — | |
| F-01-07 | Frontend Auth State | ✅ Done | — | |
| F-02-01 | Get My Profile API | ✅ Done | — | |
| F-02-02 | Update My Profile API | ✅ Done | — | |
| F-02-03 | Profile Page UI | ✅ Done | — | |
| F-02-04 | Profile Photo Upload | ✅ Done | — | MinIO on kind (`/minio` ingress, public-read `photos` bucket), `Cue.Infrastructure.Storage` lib, PUT `/api/v1/profiles/me/photo` (5MB, JPEG/PNG/WebP), avatar in nav + profile |
| F-02-05 | Account Deletion | ✅ Done | — | |
| F-03-01 | Create Provider Profile | ✅ Done | S2 | POST/GET/PUT `/api/v1/profiles/provider`, publishes `ProfileCreatedEvent` |
| F-03-02 | Update Provider Profile | ✅ Done | S2 | Reuses `UpdateProfileCommand` MediatR handler |
| F-03-03 | Activate / Deactivate Profile | ✅ Done | S2 | PATCH `/api/v1/profiles/provider/status`; inactive profiles hidden from discovery |
| F-03-04 | Manage Availability Slots | ✅ Done | S2 | GET/POST/DELETE `/api/v1/profiles/provider/availability`; overlap → 409, booked slots not deletable |
| F-03-05 | Provider Profile UI | ✅ Done | S2 | `/provider/profile` dashboard: profile form, activate toggle, slot list + add/remove |
| F-03-06 | Intro Video Upload | 📋 Planned | S8 | |
| F-04-01 | List Available Providers | ✅ Done | S2 | GET `/api/v1/discovery/providers`, paginated, active-only, sorted by rating |
| F-04-02 | Search Providers | ✅ Done | S2 | `q` param — case-insensitive match on name/bio/specialties (ILIKE-style) |
| F-04-03 | Filter & Sort | 🔄 In Progress | S2 | `specialty`, `minRate`, `maxRate` + sort `rating/price/newest` shipped; distance pending geo data |
| F-04-04 | Provider Detail Page | ✅ Done | S2 | `/providers/:id` UI with bio, specialties, rating, upcoming slots, Book CTA → `/book`; cards link to it |
| F-04-05 | Save / Favourite Providers | 📋 Planned | S3 | |
| F-04-06 | Discovery UI → Real API | ✅ Done | S2 | `useGetProvidersQuery` hits real API with debounced search; mock fallback only on FETCH_ERROR |
| F-05-01 | Create Booking | ✅ Done | — | |
| F-05-02 | Confirm Booking (Provider) | ✅ Done | S3 | PATCH confirm; 409 on invalid transition, 403 wrong actor |
| F-05-03 | Cancel Booking | ✅ Done | S3 | cancel + slot release verified live; refunds deferred to EPIC-06 |
| F-05-04 | Mark Order In-Progress | ✅ Done | S3 | PATCH start, provider-only |
| F-05-05 | Complete Order | ✅ Done | S3 | PATCH complete, provider-only; review-prompt notification deferred |
| F-05-06 | Get My Bookings API | ✅ Done | S3 | status serialized as strings; no pagination yet |
| F-05-07 | Bookings UI → Real API | ✅ Done | S3 | RTK Query hooks, status badges, cancel w/ reason |
| F-05-08 | Provider Bookings Dashboard | ✅ Done | S3 | `/provider/bookings`: confirm/decline/start/complete actions |
| F-06-01 | Create Payment Intent | 📋 Planned | S4 | |
| F-06-02 | Stripe Webhook Handler | 📋 Planned | S4 | |
| F-06-03 | Refund Processing | 📋 Planned | S4 | |
| F-06-04 | Payment UI — Checkout | 📋 Planned | S4 | |
| F-06-05 | Platform Fee Calculation | 📋 Planned | S4 | |
| F-06-06 | Provider Payout | 📋 Planned | S8 | |
| F-07-01 | SignalR Hub | ✅ Done | — | |
| F-07-02 | Chat Frontend Connection | ✅ Done | — | |
| F-07-03 | Message History | 📋 Planned | S5 | |
| F-07-04 | Conversation List | 📋 Planned | S5 | |
| F-07-05 | Image & File Messages | 📋 Planned | S7 | |
| F-07-06 | Read Receipts & Typing | 📋 Planned | S7 | |
| F-08-01 | Submit Review | 📋 Planned | S6 | |
| F-08-02 | Provider Reviews Seeker | 📋 Planned | S6 | |
| F-08-03 | Get Reviews for User | 📋 Planned | S6 | |
| F-08-04 | Update Provider Avg Rating | 📋 Planned | S6 | |
| F-08-05 | Reviews UI | 📋 Planned | S6 | |
| F-09-01 | Trust Score Engine | 📋 Planned | S6 | |
| F-09-02 | ID Verification | 📋 Planned | S8 | |
| F-09-03 | Report a User | 📋 Planned | S7 | |
| F-09-04 | Content Moderation | 📋 Planned | S9 | |
| F-09-05 | Trust Score UI | 📋 Planned | S6 | |
| F-10-01 | Notification Persistence | 📋 Planned | S5 | |
| F-10-02 | Get Notifications API | 📋 Planned | S5 | |
| F-10-03 | Notifications UI — Bell | 📋 Planned | S5 | |
| F-10-04 | Real-time Notification Push | 📋 Planned | S5 | |
| F-10-05 | Email Notifications | 📋 Planned | S7 | |
| F-11-01 | Open a Dispute | 📋 Planned | S7 | |
| F-11-02 | Dispute Review Workflow | 📋 Planned | S7 | |
| F-11-03 | Help Centre Content | ✅ Done | — | |
| F-11-04 | Contact Support Form | 📋 Planned | S7 | |
| F-12-01 | Provider Analytics API | 📋 Planned | S8 | |
| F-12-02 | Provider Dashboard UI | 📋 Planned | S8 | |
| F-12-03 | Admin Platform Analytics | 📋 Planned | S8 | |
| F-12-04 | Revenue Export CSV | 📋 Planned | S8 | |
| F-13-01 | Admin Authentication | 📋 Planned | S7 | |
| F-13-02 | User Management | 📋 Planned | S7 | |
| F-13-03 | Provider Verification Review | 📋 Planned | S8 | |
| F-13-04 | Dispute Management UI | 📋 Planned | S7 | |
| F-13-05 | Audit Log | 📋 Planned | S8 | |
| F-14-01 | Kind Kubernetes Local Dev | ✅ Done | S0 | Kind cluster + registry; build-and-load loads images; kubectl apply -k deploys; port-forward at :8080 |
| F-14-02 | Dockerfiles All Services | 📋 Planned | S0 | |
| F-14-03 | CI Pipeline | 📋 Planned | S0 | |
| F-14-04 | CD Pipeline — Staging | 📋 Planned | S10 | |
| F-14-05 | Secrets Management | 📋 Planned | S0 | |
| F-14-06 | Structured Logging & Tracing | 📋 Planned | S9 | |
| F-14-07 | Database Migrations | 📋 Planned | S0 | |
| F-14-08 | Rate Limiting | 📋 Planned | S0 | |
| F-15-01 | Domain Unit Tests | 📋 Planned | S1 | xUnit project exists |
| F-15-02 | Application Layer Tests | 📋 Planned | S2 | |
| F-15-03 | API Integration Tests | 📋 Planned | S3 | |
| F-15-04 | Frontend Unit Tests | 📋 Planned | S4 | |
| F-15-05 | End-to-End Tests | 📋 Planned | S9 | |
| F-15-06 | Accessibility Audit | 📋 Planned | S9 | |
| F-15-07 | Performance Baseline | 📋 Planned | S9 | |
| F-16-01 | Dual-Role User Model | 📋 Planned | Backlog | User holds seeker+provider roles simultaneously; JWT role claims |
| F-16-02 | ServiceProfile Entity | 📋 Planned | Backlog | Multi service profiles per user, each linked to one Specialty; migrates legacy ProviderProfile |
| F-16-03 | Specialty Taxonomy | 📋 Planned | Backlog | Managed Specialty table replaces free-text tags; discovery filters by SpecialtyId |
| F-16-04 | Flexible Rate Units | 📋 Planned | Backlog | RateUnit enum (hour/task/day(s)/week(s)/month(s)/custom duration) + booking price estimate |
| F-16-05 | Service Profile CRUD API | 📋 Planned | Backlog | `/api/v1/profiles/service-profiles` CRUD + per-listing activate/pause |
| F-16-06 | Discovery Over Service Profiles | 📋 Planned | Backlog | One card per service listing; hourly-equivalent rate sorting |
| F-16-07 | Multi-Service Provider UI | 📋 Planned | Backlog | Service list dashboard, rate-unit picker, dual-role mode switch | |

---

*To update this document: change the status in the Progress Tracker and update the `[x]`/`[ ]`/`[~]` marker on the corresponding feature entry. Keep the Last updated date current.*

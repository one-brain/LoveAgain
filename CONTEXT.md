# Cue Domain Context

## Core Terms

- **User**: An authenticated person who may act as a client, companion, or administrator.
- **Client**: A member who discovers and schedules meetups or social activities with companions.
- **Companion**: A verified person offering time, social company, activity companionship, or guidance.
- **Booking**: The confirmed engagement between one client and one companion for a bounded time window (formerly termed *service order*).
- **Meetup**: The in-person or activity session during which the booking takes place.
- **Meeting PIN**: A secure 4-digit code shared between client and companion in person to start the session safely (formerly termed *check-in PIN*).
- **Protected Payment (Safe Escrow)**: Payment held safely by the platform and released only after the meetup is satisfactorily completed.
- **Meetup Slot**: A companion-owned time window that can be reserved by at most one booking.
- **Trust Record**: An immutable change record explaining a user's trust-score adjustment.

## Invariants

- A booking must involve different client and companion users.
- A meetup end time must be after its start time.
- Monetary values are non-negative, in Indian Rupees (₹), where companion earnings (85%) plus platform service fee (15%) equal the total booking amount.
- A meetup slot can only be held once and only by the booking that holds it.
- Reviews can only be submitted for a completed booking and cannot be self-authored.
- Domain entities enforce lifecycle transitions; application handlers coordinate persistence, wallet escrow holds, and integration events.

## Domain State Machines

### 1. Booking & Meetup Lifecycle
```text
[Initiated / Pending] -> [Accepted by Companion] -> [Paid / Escrow Locked] -> [In Progress / PIN Verified] -> [Completed / Settled]
                      \-> [Declined / Expired]   \-> [Cancelled & Refunded]
```
- **Initiated**: Client requests a meetup slot; awaiting companion approval.
- **Accepted**: Companion approves date/time/location; booking transitions to payment window.
- **Paid / Escrow Locked**: Client payment captured; funds locked into platform escrow hold.
- **In Progress**: 4-digit Meeting PIN confirmed on-site by companion or client.
- **Completed**: Meetup terminates; escrow releases 85% companion payout and 15% platform fee.
- **Cancelled / Refunded**: Order aborted; escrow hold unlocked and credited back to client wallet.

### 2. Companion Verification Lifecycle
```text
[Draft / Unverified] -> [Submitted for Review] -> [Admin Approved] -> [Active in Discovery]
                                              \-> [Admin Rejected] -> [Requires Revision]
```
- **Unverified**: Companion application in draft stage.
- **Submitted**: Profile and verification documents locked for administrative compliance review.
- **Approved**: Verification approved; status set to `Approved`, companion appears in public marketplace.
- **Rejected**: Compliance team provides rejection reasoning; companion excluded from public search.

---

## Storage & History Architecture

### 1. State Persistence Hierarchy
- **Ephemeral Cache**: In-memory Redux and RTK Query caches with tag-based invalidation (`Bookings`, `Wallet`, `Profiles`, `Reviews`).
- **Client Session Storage**: Non-sensitive UI flags and session markers (`cue_cookie_consent`, search filter state).
- **Secure Identity & Tokens**: HTTP-only `Secure` cookies with `SameSite=Lax` backed by synchronized `localStorage` fallback for legacy REST clients.
- **Transactional State**: PostgreSQL primary database for bookings, transactions, wallets, profiles, and immutable trust records.
- **Audit & History**: Append-only log tables (`audit_logs`, `escrow_holds`, `payment_transactions`, `chat_messages`) preserving historical operational trace and compliance records across sessions.

---

## Architecture Decision Records (ADRs)

### ADR-001: Dual-Mode Authentication & Client Cache Purging
- **Context**: Users switching accounts or logging out previously left stale Redux caches or retained old credentials.
- **Decision**: Centralize logout in `sessionManager.ts`. Dispatch `api.util.resetApiState()` across all RTK Query slices, clear `localStorage`, `sessionStorage`, and `indexedDB`. Backend `AuthController.cs` revokes refresh tokens from the database and flushes auth cookies.
- **Status**: Implemented & Verified.

### ADR-002: Multi-Service JWT Synchronization
- **Context**: Microservices (`AuthService`, `BookingService`, `PaymentService`, `APIGateway`) required identical signing keys and validation parameters.
- **Decision**: Synchronize JWT signing keys across all Kubernetes deployments via shared environment variables with 30-second clock skew tolerance and role claims propagation.
- **Status**: Implemented & Verified.

### ADR-003: Protected Escrow Model & Wallet Ledger Immutability
- **Context**: Marketplace regulations require safe escrow of client funds until meetup completion to prevent fraud.
- **Decision**: Payments are held in `escrow_holds` upon booking confirmation. Funds are immutable until a state transition occurs: `Completed` triggers companion payout (85%) and platform commission (15%); `Cancelled` triggers client wallet credit.
- **Status**: Implemented & Verified.

### ADR-004: Centralized Error Boundaries, Circuit Breaking, and Structured Telemetry
- **Context**: Unhandled React exceptions crashed the SPA to a white screen; downstream API failures leaked raw server errors without correlation IDs.
- **Decision**: Implement a top-level React `ErrorBoundary` with reload/fallback actions, alongside backend RFC 7807 ProblemDetails middleware emitting unique `traceId` correlation keys.
- **Status**: Active.


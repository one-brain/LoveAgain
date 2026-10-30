# Feature Spec: Dual-PIN Mutual Verification for Outing Initiation and Escrow Completion

Related GitHub Issue: [#11](https://github.com/one-brain/LoveAgain/issues/11)

## Context & Problem Statement

Currently, an outing can be prematurely marked as `Completed` directly from the `Confirmed` state without mandatory in-person session verification. This introduces escrow release vulnerability, where funds could be settled before parties physically meet.

To eliminate this vulnerability, the platform requires strict mutual cryptographic verification:

1. **Arrival Initiation**: The session cannot enter `InProgress` without the companion verifying the seeker's **Arrival PIN**.
2. **Escrow Completion**: The session cannot be marked `Completed` without the seeker verifying the companion's **Completion PIN**.
3. **Strict Sequencing**: Direct transition from `Confirmed` to `Completed` is strictly forbidden at both domain and API levels.

---

## Architecture & Lifecycle State Machine

```
[PendingPayment] 
       │  (Seeker Pays Escrow)
       ▼
  [Confirmed]  ───(Arrival PIN: Seeker shows, Companion enters)───► [InProgress]
       │                                                                  │
       │ (Direct completion blocked)                                      │ (Completion PIN: Companion shows, Seeker enters)
       ▼                                                                  ▼
    [ERROR]                                                          [Completed]
                                                                          │ (Escrow Released)
                                                                          ▼
                                                                     [Settled]
```

---

## Detailed Specifications

### 1. Domain Model (`Cue.Domain.ServiceOrder`)

- **Properties**:
  - `ArrivalPin` (`CheckInPin`): 6-digit numeric string generated upon booking confirmation. Owned by Seeker.
  - `CompletionPin`: 6-digit numeric string generated upon booking creation/confirmation. Owned by Companion.
  - `CheckedInAt`: Timestamp set when Arrival PIN is verified.
  - `CompletedAt`: Timestamp set when Completion PIN is verified.
- **Domain Methods**:
  - `CheckIn(string pin)`:
    - Precondition: `Status == OrderStatus.Confirmed`.
    - Check: `pin == ArrivalPin`. Throws `ArgumentException("Invalid arrival PIN.")` on mismatch.
    - Postcondition: `Status = OrderStatus.InProgress`, `CheckedInAt = DateTime.UtcNow`.
  - `Complete(string completionPin)`:
    - Precondition: `Status == OrderStatus.InProgress`. Throws `InvalidOperationException("Outing cannot be completed before session is initiated with the arrival verification PIN.")` if not InProgress.
    - Check: `completionPin == CompletionPin`. Throws `ArgumentException("Invalid completion PIN.")` on mismatch.
    - Postcondition: `Status = OrderStatus.Completed`, `UpdatedAt = DateTime.UtcNow`.

### 2. Backend Commands & Endpoints (`BookingService`)

- **Arrival Verification**:
  - `PATCH /api/v1/bookings/{orderId}/checkin`
  - Body: `{ "pin": "string" }`
  - Authorization: Authenticated user must be the Companion (`order.ProviderId == userId`).
  - Executes: `CheckInBookingCommand(orderId, userId, pin)`.
- **Completion Verification**:
  - `PATCH /api/v1/bookings/{orderId}/complete`
  - Body: `{ "completionPin": "string" }`
  - Authorization: Authenticated user must be the Seeker (`order.SeekerId == userId`).
  - Executes: `CompleteOrderCommand(orderId, userId, completionPin)`.
  - Triggers: `BookingCompletedEvent` and subsequent Escrow Release mutation to `PaymentService`.
- **PIN Exposure Security in `BookingQueries`**:
  - `ArrivalPin` is visible **only** to the Seeker until InProgress.
  - `CompletionPin` is visible **only** to the Companion.
  - Never expose both PINs to the same party prior to physical meeting.

### 3. Frontend UX & Voucher Interaction (`BookingCard.tsx` & Modals)

- **Status: Confirmed**:
  - **Seeker Card**:
    - Displays **Arrival PIN Voucher**: "Present this 6-digit PIN to your companion upon arrival to begin the session."
    - "Complete Outing" button is **hidden/disabled**.
  - **Companion Card**:
    - Displays primary action button: `[Verify Arrival PIN]`.
    - Clicking opens modal to enter the Seeker's 6-digit Arrival PIN.
    - "End Meetup" button is **hidden/disabled**.
- **Status: InProgress**:
  - **Companion Card**:
    - Displays **Completion PIN Voucher**: "Present this 6-digit PIN to your client when the outing concludes safely."
    - No direct complete button without seeker verification.
  - **Seeker Card**:
    - Displays primary action button: `[Complete Outing & Release Escrow]`.
    - Clicking opens modal to enter the Companion's 6-digit Completion PIN.
    - Upon valid PIN entry, API marks order `Completed` and releases escrow funds.
- **Support / Dispute Fallback**:
  - If a party cannot produce their PIN (e.g. phone died), neither party can force completion. The Safety SOS / Dispute mechanism must be used.

---

## Acceptance Criteria

- [ ] **AC 1 (Domain Guard)**: `ServiceOrder.Complete()` throws if `Status != OrderStatus.InProgress` or if `completionPin != CompletionPin`.
- [ ] **AC 2 (Arrival PIN Check-In)**: `PATCH /bookings/{id}/checkin` requires valid Seeker Arrival PIN, transitions order to `InProgress`, and records `CheckedInAt`.
- [ ] **AC 3 (Completion PIN Verification)**: `PATCH /bookings/{id}/complete` requires valid Companion Completion PIN, transitions order from `InProgress` to `Completed`, and releases escrow.
- [ ] **AC 4 (PIN Security Isolation)**: Seeker only sees Arrival PIN; Companion only sees Completion PIN. Neither party can view both PINs from API responses.
- [ ] **AC 5 (Frontend Confirmed State)**: On `Confirmed` outings, Seeker sees Arrival PIN; Companion sees "Verify Arrival PIN". No party can click "Complete Outing".
- [ ] **AC 6 (Frontend InProgress State)**: On `InProgress` outings, Companion sees Completion PIN; Seeker sees "Complete Outing & Release Escrow" with modal prompt for Companion's PIN.
- [ ] **AC 7 (Zero-Error Verification)**: Unit tests in `Cue.Domain.Tests` pass, frontend build passes with 0 errors, Impeccable detector reports 0 violations.

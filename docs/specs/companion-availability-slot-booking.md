# Feature Spec: Companion Availability Slot Discovery & Strict Slot Booking

## 1. Context & Problem Statement
Currently, seekers booking an outing in `BookingRequestModal` can input arbitrary dates, free-form start times (`<input type="time">`), and arbitrary duration sliders. In the backend, `CreateBookingCommandHandler` auto-creates an `AvailabilitySlot` on the fly for the companion if no slot exists. 

This leads to significant real-world friction:
- Seekers book outings when companions are unavailable, asleep, or occupied.
- Companions are forced to cancel, triggering escrow refunds and frustrating seekers.
- The platform promise of curated companionship on scheduled terms is compromised.

---

## 2. Requirements & Lifecycle Architecture

```
[Seeker opens Booking Modal]
         │
         ▼
[Query GET /api/v1/providers/{id}/availability]
         │
    ┌────┴───────────────────────────────┐
    ▼                                    ▼
[Open Slots Found]              [Zero Slots Found]
    │                                    │
    ▼                                    ▼
Interactive Day & Slot Picker   Empty State Informational Notice
• Select date                   • "No open availability slots scheduled"
• Select available slot chip    • No action button
• Locks start/end/duration      • Proceed to payment disabled
    │
    ▼
[Proceed to Escrow Payment]
    │
    ▼
[CreateBookingCommand]
• Validates slot exists & unreserved
• Rejects arbitrary timestamps
• Holds slot atomically
```

---

## 3. Detailed Specifications

### A. Backend & Domain Changes
1. **Public Availability Query (`ProfileService`)**:
   - Endpoint: `GET /api/v1/providers/{providerId}/availability`
   - Returns unreserved (`IsBooked == false`), future availability slots for the specified companion, sorted chronologically.
   - Response: `IReadOnlyList<AvailabilitySlotSummary>` with `SlotId`, `StartTime`, `EndTime`, `DurationHours`.

2. **Strict Slot Validation (`BookingService` & `CreateBookingCommand`)**:
   - Update `CreateBookingCommand` to require a valid `SlotId` or match an open slot for the provider.
   - Remove automatic slot generation on the fly in `CreateBookingCommandHandler.cs`.
   - If the requested slot is not found, already booked, or outside the companion's published schedule, reject with HTTP 409 Conflict: `"The selected time does not match an open availability slot for this companion."`
   - Atomically call `slot.Hold(order.Id)`.

### B. Frontend Experience (`BookingRequestModal.tsx`)
1. **Interactive Day & Slot Picker**:
   - Mini-calendar date selector highlighting dates with active companion availability.
   - For the selected date, renders available slot chips (e.g. `10:00 AM – 1:00 PM (3 hrs)`).
   - Selecting a slot automatically calculates:
     - `StartTime` and `EndTime`
     - `DurationHours`
     - Escrow total (`hourlyRate × durationHours`)
   - Replaces freeform `<input type="time">` and manual duration slider.
2. **Zero-Slot Empty State**:
   - If the companion has no published slots in the future, display a warm, clear informational notice:
     *"This companion currently has no open availability slots scheduled. Please check back later."*
   - Does **not** include a primary action button.
   - Disables the "Proceed to Escrow Deposit" button.

---

## 4. Acceptance Criteria
- [ ] **AC 1 (Public Slots Endpoint)**: `GET /api/v1/providers/{providerId}/availability` returns only future unbooked slots for that companion.
- [ ] **AC 2 (Strict Booking Enforcement)**: `POST /api/v1/bookings` rejects requests with times that do not match an open companion slot.
- [ ] **AC 3 (Slot Holding)**: When a booking is created, the matching `AvailabilitySlot` is marked `IsBooked = true` and linked to `order.Id`.
- [ ] **AC 4 (Interactive Day & Slot UI)**: `BookingRequestModal` displays interactive date chips and time slot chips, auto-filling duration and pricing.
- [ ] **AC 5 (Zero Slots Fallback)**: Shows informational empty state without a primary action button when no slots are published; booking action remains disabled.
- [ ] **AC 6 (Impeccable & Test Validation)**: Unit tests pass in `Cue.Domain.Tests`, Impeccable reports 0 violations, frontend builds with 0 errors.

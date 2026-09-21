# Booking Feature Implementation

## Overview

The booking feature enables seekers to book time slots with providers, creating service orders that go through a complete lifecycle from creation to completion or cancellation.

## Architecture

### Backend Components

#### Domain Layer (`shared/Libraries/Cue.Domain/`)

**ServiceOrder.cs**
- Core booking aggregate with lifecycle state machine
- Status transitions: PendingPayment → Confirmed → InProgress → Completed
- Cancellation allowed from any state except Completed/Cancelled
- Enforces invariants: seeker ≠ provider, end time > start time, non-negative amounts

**AvailabilitySlot.cs**
- Time windows owned by providers
- Can be held by at most one booking at a time
- Hold/Release operations ensure slot exclusivity

#### Application Layer (`shared/Libraries/Cue.Application/Bookings/`)

**Commands:**
- `CreateBookingCommand` - Creates new booking with payment authorization
- `ConfirmBookingCommand` - Provider confirms booking (transitions to Confirmed)
- `StartOrderCommand` - Provider starts the service (transitions to InProgress)
- `CompleteOrderCommand` - Provider marks service complete (transitions to Completed)
- `CancelBookingCommand` - Either party cancels with reason (transitions to Cancelled, releases slot)

**Queries:**
- `GetUserBookingsQuery` - Returns all bookings for a user (as seeker or provider)
- Status serialized as string enums for frontend consumption

**Handlers:**
- CQRS pattern with MediatR
- FluentValidation for input validation
- Event publishing for async notification/payment workflows
- Repository pattern for data access

#### Infrastructure Layer (`shared/Libraries/Cue.Infrastructure.Data/`)

**BookingRepository.cs**
- Slot availability checking (finds slots covering requested start time)
- Booking CRUD operations
- User bookings retrieval (provider or seeker)

**Events** (`Cue.Infrastructure.Messaging/Events.cs`)
- `BookingCreatedEvent` - Triggers payment authorization
- `BookingConfirmedEvent` - Notifies seeker
- `BookingCancelledEvent` - Triggers refund, notifies parties
- `BookingCompletedEvent` - Triggers payout to provider

#### API Layer (`backend/Services/BookingService/`)

**BookingsController.cs**
- `POST /api/v1/bookings` - Create booking (seeker from JWT)
- `GET /api/v1/bookings` - Get my bookings
- `PATCH /api/v1/bookings/{id}/confirm` - Provider confirms
- `PATCH /api/v1/bookings/{id}/start` - Provider starts
- `PATCH /api/v1/bookings/{id}/complete` - Provider completes
- `POST /api/v1/bookings/{id}/cancel` - Cancel with reason

**Authorization:**
- JWT Bearer authentication required
- Seeker ID extracted from JWT claims (ClaimTypes.NameIdentifier)
- Provider/seeker role enforcement in command handlers

### Frontend Components

#### API Layer (`frontend/src/store/bookingApi.ts`)

RTK Query API slice with endpoints:
- `createBooking` - POST booking with provider, time, rate
- `getMyBookings` - GET user's bookings
- `confirmBooking` - PATCH confirm
- `startBooking` - PATCH start
- `completeBooking` - PATCH complete  
- `cancelBooking` - POST cancel with reason

Auto-invalidation with `['Bookings']` tag on mutations.

#### Pages

**ProviderDetail.tsx** (updated)
- Slot selection UI from provider's availability
- Booking form with meeting address input
- Duration and cost calculation
- Booking creation with navigation to /bookings

**Bookings.tsx** (new)
- List view of all user bookings (as seeker or provider)
- Status badges with color coding
- Time/duration/amount display
- Cancel button for PendingPayment/Confirmed orders
- Payment reminder for PendingPayment orders
- Empty state with CTA to discovery

**Header.tsx** (updated)
- Added "Bookings" navigation link for authenticated users

#### State Management

- Redux store integrated with bookingApi middleware
- JWT token from localStorage attached to all requests
- Optimistic UI updates with cache invalidation

## Booking Flow

### 1. Discovery → Booking Creation

```
Seeker browses /discovery
  → Clicks provider card
  → Views provider detail at /provider/{userId}
  → Sees available slots
  → Selects slot
  → Fills meeting address (optional)
  → Confirms booking
  → Backend creates ServiceOrder with PendingPayment status
  → Backend holds AvailabilitySlot
  → Backend publishes BookingCreatedEvent
  → Frontend redirects to /bookings
```

### 2. Payment (handled by PaymentService)

```
PaymentService receives BookingCreatedEvent
  → Authorizes payment with Stripe
  → Creates PaymentTransaction
  → On success: sends ConfirmBookingCommand to BookingService
  → BookingService transitions order to Confirmed
  → Publishes BookingConfirmedEvent
  → NotificationService sends confirmations
```

### 3. Service Execution

```
Provider starts service
  → PATCH /api/v1/bookings/{id}/start
  → Status: InProgress

Provider completes service
  → PATCH /api/v1/bookings/{id}/complete
  → Status: Completed
  → Publishes BookingCompletedEvent
  → PaymentService captures funds and initiates payout
```

### 4. Cancellation

```
Either party cancels
  → POST /api/v1/bookings/{id}/cancel with reason
  → Status: Cancelled
  → AvailabilitySlot released (available for rebooking)
  → Publishes BookingCancelledEvent
  → PaymentService refunds seeker
  → NotificationService notifies parties
```

## Domain Invariants

As per `CONTEXT.md`:

1. **Seeker ≠ Provider**: Enforced in ServiceOrder constructor
2. **End time > Start time**: Validated in constructor and FluentValidation
3. **Non-negative amounts**: Checked in constructor; platform fee + provider earnings = total
4. **Slot exclusivity**: AvailabilitySlot.Hold() rejects if already booked
5. **Status transitions**: State machine enforces valid transitions
6. **Cancel restrictions**: Cannot cancel Completed or already-Cancelled orders

## Pricing Model

- **Hourly rate**: Set by provider in ProviderProfile
- **Total amount**: hourlyRate × durationHours (rounded to 2 decimals)
- **Platform fee**: 15% of total amount
- **Provider earnings**: total - platform fee

Example:
```
Hourly rate: $50
Duration: 2.5 hours
Total: $125.00
Platform fee: $18.75 (15%)
Provider earnings: $106.25
```

## Testing

### Domain Tests (`tests/Cue.Domain.Tests/`)

- `BookingLifecycleTests.cs`:
  - Availability slot holds only once
  - Order completes only after starting
  - Payment capture and refund flow

- `AvailabilitySlotTests.cs`:
  - Slot holds and releases correctly
  - Release rejected for wrong booking

All tests passing ✅

### Manual Testing Checklist

Backend:
- [ ] Start BookingService on port 5002
- [ ] Create booking via POST /api/v1/bookings
- [ ] Verify slot is held in database
- [ ] Confirm booking as provider
- [ ] Cancel booking and verify slot released

Frontend:
- [ ] Select provider slot
- [ ] Fill booking form
- [ ] Create booking
- [ ] View booking in /bookings
- [ ] Cancel booking
- [ ] Verify UI updates

## API Examples

### Create Booking

```bash
POST http://localhost:5002/api/v1/bookings
Authorization: Bearer {JWT}
Content-Type: application/json

{
  "providerId": "a1b2c3d4-...",
  "startTime": "2026-09-22T14:00:00Z",
  "endTime": "2026-09-22T16:00:00Z",
  "hourlyRate": 50,
  "durationHours": 2.0,
  "meetingAddress": "Central Park, NYC"
}
```

Response:
```json
{
  "orderId": "e5f6g7h8-...",
  "totalAmount": 100.00,
  "status": "PendingPayment"
}
```

### Get My Bookings

```bash
GET http://localhost:5002/api/v1/bookings
Authorization: Bearer {JWT}
```

Response:
```json
[
  {
    "orderId": "e5f6g7h8-...",
    "providerId": "a1b2c3d4-...",
    "seekerId": "i9j0k1l2-...",
    "startTime": "2026-09-22T14:00:00Z",
    "endTime": "2026-09-22T16:00:00Z",
    "status": "Confirmed",
    "totalAmount": 100.00
  }
]
```

### Cancel Booking

```bash
POST http://localhost:5002/api/v1/bookings/{orderId}/cancel
Authorization: Bearer {JWT}
Content-Type: application/json

{
  "reason": "Schedule conflict"
}
```

Response: `204 No Content`

## Security Considerations

1. **JWT Authentication**: All endpoints require valid JWT
2. **Authorization**: 
   - Seeker ID always from JWT (never from request body)
   - Provider-only operations check ProviderId matches JWT
   - Cancel allowed only by booking participants
3. **Input Validation**: FluentValidation on all commands
4. **SQL Injection**: EF Core parameterized queries
5. **Rate Limiting**: Applied at API Gateway level

## Database Schema

**service_orders table:**
```sql
id UUID PRIMARY KEY
provider_id UUID NOT NULL
seeker_id UUID NOT NULL
start_time TIMESTAMP NOT NULL
end_time TIMESTAMP NOT NULL
status INT NOT NULL (enum)
total_amount DECIMAL(10,2) NOT NULL
platform_fee DECIMAL(10,2) NOT NULL
provider_earnings DECIMAL(10,2) NOT NULL
meeting_address TEXT
cancellation_reason TEXT
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL
```

**availability_slots table:**
```sql
id UUID PRIMARY KEY
provider_id UUID NOT NULL
start_time TIMESTAMP NOT NULL
end_time TIMESTAMP NOT NULL
is_booked BOOLEAN NOT NULL DEFAULT FALSE
booking_id UUID (FK to service_orders.id)
```

## Future Enhancements

1. **Recurring bookings**: Weekly/monthly recurring slots
2. **Booking modifications**: Reschedule without canceling
3. **Multi-slot bookings**: Book multiple consecutive slots
4. **Booking notes**: Add notes/requirements during booking
5. **GPS verification**: Confirm both parties present at start/complete
6. **Dispute resolution**: Integrated dispute workflow for problematic bookings
7. **Instant booking**: Skip confirmation for trusted providers
8. **Booking reminders**: Automated notifications 24h/1h before start

## Related Documentation

- [CONTEXT.md](../CONTEXT.md) - Domain terms and invariants
- [CLAUDE.md](../CLAUDE.md) - Project structure and patterns
- [ARCHITECTURE.md](ARCHITECTURE.md) - Overall system architecture

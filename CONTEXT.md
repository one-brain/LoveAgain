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

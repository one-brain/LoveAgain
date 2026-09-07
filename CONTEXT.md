# Cue Domain Context

## Core Terms

- **User**: An authenticated person who may act as a seeker, provider, or administrator.
- **Provider profile**: The offer-side profile owned by one User. It contains pricing, specialties, service radius, and discoverability state.
- **Service order**: The booking aggregate between one seeker and one provider for a bounded time window. Its status controls the booking lifecycle.
- **Availability slot**: A provider-owned time window that can be held by at most one service order.
- **Trust event**: An immutable change record explaining a user's trust-score adjustment.

## Invariants

- A service order must involve different seeker and provider users.
- Its end time must be after its start time.
- Monetary values are non-negative, and provider earnings plus platform fee equal the total amount.
- A slot can only be held once and only by the order that holds it.
- Reviews can only be submitted for a completed order and cannot be self-authored.
- Domain entities enforce lifecycle transitions; application handlers coordinate persistence and integration events.

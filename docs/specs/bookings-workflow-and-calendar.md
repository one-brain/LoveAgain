# Feature Spec: 4-Tab Bookings Workflow & Interactive Month Calendar View

Related GitHub Issue: [#8](https://github.com/one-brain/LoveAgain/issues/8)

## Context & Problem Statement
On the **My Experience Bookings** page, users previously navigated between an `Upcoming & Active` tab and a single `History & Completed` tab. This lumped completed meetups with cancellations and disputes. Users could not cleanly audit completed session receipts, view cancelled/refunded sessions separately, or get a full monthly calendar bird's-eye view of upcoming companion outings.

---

## Goals & Non-Goals

### Goals
- **4 Distinct Segmented Tabs**:
  1. **Upcoming**: Active sessions (`Confirmed`, `InProgress`, and `PendingPayment`). Shows total upcoming counter pill badge.
  2. **Completed**: Successfully concluded sessions (`Completed`). Houses review CTAs, completion badges, and verified receipts.
  3. **Cancelled**: Sessions terminated prior to completion or disputed (`Cancelled`, `Disputed`). Displays cancellation reasons and escrow refund notices.
  4. **Calendar Mode**: Full monthly interactive calendar grid (`7x5` or `7x6` days) with visual markers (dots/pills) for scheduled days, today indicator, date selection, and day schedule inspection list.
- **Dedicated Empty States**: Tailored empty state guidance for each tab (e.g. encouraging companion discovery when upcoming is empty, explaining escrow refunds when cancelled is empty).
- **Responsive Calendar Ergonomics**:
  - Month navigation header (`< Month Year >` + `Today` button).
  - Day cells with >= 44px touch target, showing day number in `JetBrains Mono` and color-coded status dots (`Confirmed` = emerald, `PendingPayment` = amber, `Completed` = blue).
  - Selected day schedule card grid showing all sessions booked on that day.
- **Strict Cue Design System Compliance**: `Instrument Serif` headings, `Plus Jakarta Sans` copy, `JetBrains Mono` tabular figures, zero Impeccable mechanical violations.

### Non-Goals
- Altering the backend API contracts (frontend filtering against existing `useGetSeekerOutgoingBookingsQuery` and `useGetProviderIncomingBookingsQuery` data).
- Google Calendar / iCal `.ics` export sync (separate future feature).

---

## Acceptance Criteria & Test Plan

- [x] **AC 1 (4 Tabs Present)**: The top navigation clearly presents `Upcoming & Active`, `Completed`, `Cancelled`, and `Calendar Schedule` with live numerical count badges.
- [x] **AC 2 (Correct Segregation)**:
  - `Upcoming` contains only `PendingPayment`, `Confirmed`, and `InProgress`.
  - `Completed` contains only `Completed`.
  - `Cancelled` contains only `Cancelled` and `Disputed`.
- [x] **AC 3 (Interactive Month Calendar)**:
  - Renders a full month grid (Mon–Sun).
  - Previous/Next month buttons navigate months correctly.
  - "Today" button snaps immediately back to current month and day.
  - Clicking any date displays the sessions scheduled on that date.
- [x] **AC 4 (Empty State Guidance)**: Each tab shows a distinct empty state when no bookings match.
- [x] **AC 5 (Zero-Error Build)**: `npm run build` passes with zero TypeScript warnings, and Impeccable detector reports 0 violations.


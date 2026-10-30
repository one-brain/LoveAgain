---
spec_issue_number: "6"
spec_issue_url: https://github.com/one-brain/LoveAgain/issues/6
spec_filed_at: 2026-10-30T12:04:21Z
spec_branch: main
spec_plan_mode: inactive
spec_executed: false
---

# feat(reviews): two-way verified reviews and trust scoring for completed bookings

## Context & Problem Statement
On the Cue platform, users currently complete in-person companion bookings via Safe Escrow, but neither client nor companion can submit authentic post-session feedback. Companion profiles display static ratings, and clients have no social proof to verify trust and punctuality. To ensure safety, accountability, and marketplace liquidity, we need an end-to-end, two-way verified review engine.

---

## Goals & Non-Goals

### Goals
- **Strict Completed Booking Gate**: Reviews can only be submitted for bookings with `Status == 'Completed'` (post-escrow check-in and completion).
- **Two-Way Reviews**:
  - **Seeker -> Provider**: Public star rating (1–5), timeliness score, communication score, and written testimonial displayed on companion profile.
  - **Provider -> Seeker**: Private trust/safety rating (1–5) contributing to the seeker's `trustScore`.
- **Automatic Aggregate Re-calculation**:
  - Updating companion `averageRating` and `reviewCount` in `ProviderProfile` upon submission.
- **Single Review per Participant per Order**: Strict idempotency — each user can review a specific booking order exactly once.
- **Frontend Integration**:
  - "Leave Review" button & dialog on completed `BookingCard`.
  - Dynamic "Verified Client Reviews" ledger on `ProviderDetail` with `Instrument Serif` headlines and `JetBrains Mono` date/metrics.

### Non-Goals
- Public editing or deletion of reviews after submission (immutable ledger).
- Disputing charges via review comments (disputes route through Support `/support/tickets`).
- Unverified public reviews without an escrow booking.

---

## API & Data Contract

### `POST /api/v1/reviews`
**Request Payload**:
```json
{
  "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "rating": 5,
  "comment": "Exceptional dining companion, punctual and wonderful conversationalist.",
  "timelinessScore": 5,
  "communicationScore": 5
}
```
**Validation Rules**:
1. Requester must be either the `SeekerId` or `ProviderId` of the order.
2. Order `Status` must be `Completed`.
3. An existing review with `(OrderId, ReviewerId)` must not already exist (HTTP 409 Conflict).
4. `ReviewerId` != `RevieweeId`.

### `GET /api/v1/reviews/provider/{providerId}?page=1&pageSize=10`
Returns paginated list of public reviews for a companion:
```json
{
  "items": [
    {
      "id": "uuid",
      "orderId": "uuid",
      "reviewerName": "Aarav S.",
      "reviewerPhotoUrl": "https://...",
      "rating": 5,
      "comment": "Punctual and very respectful.",
      "timelinessScore": 5,
      "communicationScore": 5,
      "createdAt": "2026-10-30T16:00:00Z"
    }
  ],
  "averageRating": 4.9,
  "totalReviews": 14,
  "page": 1,
  "totalPages": 2
}
```

### `GET /api/v1/reviews/booking/{orderId}/status`
Returns review status for current authenticated user on a given booking:
```json
{
  "canReview": true,
  "hasReviewed": false,
  "myReview": null
}
```

---

## UI / UX Design Specifications

1. **`BookingCard.tsx` (Completed State)**:
   - When booking status is `Completed`, show prominent CTA: `Leave a Review`.
   - If already reviewed, display `Reviewed (5/5)`.
2. **`LeaveReviewModal.tsx`**:
   - Styled per `DESIGN.md` (`Instrument Serif` modal headline, `Plus Jakarta Sans` labels).
   - Interactive 5-star rating selector with gold hover states (`#C5A059`).
   - Timeliness & Communication 5-point pill steppers.
   - Textarea with character count (min 10, max 500 characters).
   - Safe Escrow Verified badge indicator.
3. **`ProviderDetail.tsx`**:
   - "Verified Reviews" section replacing mock testimonials with real API data.
   - Breakdown of average overall rating, timeliness, and communication.

---

## Acceptance Criteria & Test Plan

- [ ] **AC 1 (Security & Eligibility)**: Non-participants cannot review an order; active or cancelled orders reject reviews with `400 Bad Request`.
- [ ] **AC 2 (Idempotency)**: Second submission by the same user for the same order returns `409 Conflict`.
- [ ] **AC 3 (Rating Update)**: Companion's `averageRating` in `ProviderProfile` automatically updates upon client review submission.
- [ ] **AC 4 (UI Verification)**: "Leave a Review" opens modal, successfully submits, refreshes `BookingCard` badge, and lists review on companion profile.
- [ ] **AC 5 (Zero-Error Build)**: Passes `npm run build` and `dotnet build` with zero compiler or type warnings.

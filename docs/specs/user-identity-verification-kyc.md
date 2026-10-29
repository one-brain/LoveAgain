---
spec_issue_number: 1
spec_issue_url: https://github.com/one-brain/LoveAgain/issues/1
spec_filed_at: 2026-10-28T19:17:02Z
spec_branch: main
---

# feat: User Identity Verification (KYC) Upload & Admin Review Pipeline

## Context
Cue (LoveAgain) operates as a high-trust companion platform where safety, identity authenticity, and scam prevention are paramount. While companions currently submit identity documents during their onboarding application, general users (Seekers and Companions managing their profile) have no way to upload identity cards from their profile settings, leaving the KYC tab static and unverified. Furthermore, unverified users are currently able to submit booking requests without identity verification.

This specification implements an end-to-end Identity Verification lifecycle: allowing all users to submit their government identity card (front, back, and selfie) from `/profile?tab=kyc`, providing platform administrators with a dedicated review studio to approve or reject submissions, boosting user trust scores upon approval, and strictly gating companion bookings behind verified identity status.

## Current State
1. **Domain Model**: `shared/Libraries/Cue.Domain/User.cs:62` has `public bool IsVerified { get; private set; }`, but lacks an identity document submission entity, submission status lifecycle, or document audit trail for regular users.
2. **Profile UI**: `frontend/src/pages/Profile.tsx:921-960` has a "Verification & KYC" tab, but it only renders static text cards with no file upload inputs or submission handlers.
3. **Admin Studio**: `backend/Services/ProfileService/Controllers/AdminController.cs:53-160` and `frontend/src/components/admin/AdminVerificationStudio.tsx` only query and approve companion service profiles (`ProviderProfile`), with no queue for general user identity documents.
4. **Booking Gate**: `backend/Services/BookingService/Controllers/BookingsController.cs:18-46` does not inspect `user.IsVerified`, allowing unverified accounts to initiate booking orders.

## Proposed Change

```
[ User Profile: /profile?tab=kyc ]
      │
      ├─> Selects Doc Type (Aadhaar / Passport / DL / Voter ID / National ID)
      ├─> Enters Document ID Number
      ├─> Uploads Front Image, Back Image, & Live Selfie (JPEG/PNG/WebP <= 5MB)
      │
      ▼
[ POST /api/v1/profile/me/kyc ] ──> Stores UserKycDocument (Status: PendingReview)
                                      │
                                      ▼
[ Admin Verification Studio: /admin/verifications ]
      │
      ├─> Tab Toggle: [Companion Applications] | [User Identity KYC (N)]
      ├─> Admin inspects Front, Back, & Selfie side-by-side with full-screen zoom
      │
      ├───> [Approve]:
      │         Sets UserKycDocument.Status = Approved
      │         Sets User.IsVerified = true
      │         Bumps User.TrustScore (+20)
      │         Unlocks Companion Booking capability
      │
      └───> [Reject]:
                Requires Admin Rejection Reason
                Sets UserKycDocument.Status = Rejected
                User notified; can re-submit corrected documents from profile
```

### Implementation Details

#### 1. Data Model & Domain Entities (`shared/Libraries/Cue.Domain` & `Cue.Infrastructure.Data`)
- Create `UserKycDocument` entity:
  - `Guid Id` (Primary Key)
  - `Guid UserId` (Foreign Key to `User`)
  - `string DocumentType` (`Aadhaar`, `Passport`, `DrivingLicense`, `VoterId`, `NationalId`)
  - `string DocumentNumber` (Masked/Stored securely)
  - `string FrontImageUrl`
  - `string BackImageUrl`
  - `string SelfieImageUrl`
  - `KycStatus Status` (`NotSubmitted` = 0, `PendingReview` = 1, `Approved` = 2, `Rejected` = 3)
  - `string? RejectionReason`
  - `DateTime SubmittedAt`
  - `DateTime? ReviewedAt`
  - `Guid? ReviewedBy`
- Add methods to `User.cs`:
  - `public void ApproveKyc(Guid reviewerId)`: sets `IsVerified = true`, `TrustScore = Math.Clamp(TrustScore + 20, 0, 100)`, `UpdatedAt = DateTime.UtcNow`.
  - `public void RejectKyc(Guid reviewerId, string reason)`: sets `IsVerified = false`, `UpdatedAt = DateTime.UtcNow`.
- Register `DbSet<UserKycDocument> UserKycDocuments` in `CueDbContext`.

#### 2. REST API Contracts (`ProfileService`)
- `POST /api/v1/profile/me/kyc`:
  - Accepts multipart form data: `documentType`, `documentNumber`, `frontImage` (`IFormFile`), `backImage` (`IFormFile`), `selfieImage` (`IFormFile`).
  - Validates image content types (`image/jpeg`, `image/png`, `image/webp`) and sizes (<= 5MB).
  - Uploads files via `IBlobStorage` (with base64 fallback) to `kyc/{userId}/{guid}.ext`.
  - Creates or updates `UserKycDocument` to `PendingReview`.
- `GET /api/v1/profile/me/kyc`:
  - Returns current user's KYC submission status, document type, submission date, and rejection reason if rejected.
- `GET /api/v1/admin/kyc-verifications`:
  - Admin-only endpoint returning paginated list of user KYC submissions filterable by `status`.
- `POST /api/v1/admin/kyc-verifications/{id:guid}/approve`:
  - Admin-only endpoint to approve user KYC.
- `POST /api/v1/admin/kyc-verifications/{id:guid}/reject`:
  - Admin-only endpoint requiring `{ reason: string }` to reject submission with feedback.

#### 3. Booking Enforcement (`BookingService` & Frontend)
- In `BookingsController.cs` (`POST /api/v1/bookings`):
  - Check if authenticated user has `IsVerified == true`.
  - If `false`, return HTTP 403 Forbidden:
    `{ error: "Identity verification is required before you can book companions. Please submit your identity card in your Profile.", code: "KYC_VERIFICATION_REQUIRED" }`.
- In `frontend/src/components/booking/BookingRequestModal.tsx` & `ProviderDetail.tsx`:
  - If `currentUser.isVerified !== true`, immediately intercept the "Request Booking" action and display an Identity Verification Required modal with a one-click button redirecting to `/profile?tab=kyc`.

#### 4. Frontend UI Components
- **`Profile.tsx` (Verification & KYC Tab)**:
  - If `NotSubmitted` or `Rejected`: interactive upload form with Document Type selector, Document Number input, Front ID dropzone, Back ID dropzone, and Live Selfie dropzone with instant client preview.
  - If `Rejected`: prominent alert displaying admin rejection reason and guidance.
  - If `PendingReview`: banner indicating submission is under review by safety team (24h SLA).
  - If `Approved`: badge with verified shield, Trust Score boost (+20), and verification timestamp.
- **`AdminVerificationStudio.tsx` & `AdminVerificationsPage.tsx`**:
  - Top tab switcher: `[Companion Profiles (N)] | [User Identity KYC (N)]`.
  - Grid & detail modal presenting user name, email, phone, Document Type, Document Number, Front Image, Back Image, and Selfie with full-screen zoom comparison.
  - Quick Approve and Reject actions with rejection reason templates.

## Acceptance Criteria
1. When an unverified user navigates to `/profile?tab=kyc`, they can select a Document Type, enter their document number, upload Front, Back, and Selfie images (<= 5MB, JPEG/PNG/WebP), and submit successfully (`POST /api/v1/profile/me/kyc` returns HTTP 200/201).
2. Attempting to submit files exceeding 5MB or non-image files (e.g., PDF/EXE) returns HTTP 400 with a clear error message.
3. Submitting KYC updates the status to `PendingReview`, rendering the "Under Review" state in the user's profile.
4. In `/admin/verifications`, the Admin can switch to the "User Identity KYC" tab, view pending user submissions with Front, Back, and Selfie images, and execute Approve or Reject.
5. Approving a user's KYC sets `user.IsVerified = true`, increments user `TrustScore` by 20 points, and updates the profile status to `Approved`.
6. Rejecting a user's KYC requires a non-empty reason, keeps `user.IsVerified = false`, and allows the user to re-upload documents from `/profile?tab=kyc`.
7. An unverified user clicking "Request Booking" is blocked from opening the booking modal and shown a direct prompt to complete KYC at `/profile?tab=kyc`.
8. Direct API requests to `POST /api/v1/bookings` by an unverified user return HTTP 403 Forbidden with `code: "KYC_VERIFICATION_REQUIRED"`.
9. Each test in the Testing Plan states its card: `protects=<observable it protects>; fails_when=<wrong result it rejects>; no_claim=<what green does not prove>`.
10. No degradation of existing companion application or discovery functionality.

## Testing Plan
| Layer | What | Count | Card |
| :--- | :--- | :--- | :--- |
| **Unit** | `User.ApproveKyc()` & `User.RejectKyc()` state transitions & trust score clamp | +3 | `protects=User.IsVerified and TrustScore invariants; fails_when=TrustScore exceeds 100 or isVerified remains false on approve; no_claim=DB persistence` |
| **Unit** | `UserKycDocument` entity constraints & status transitions | +3 | `protects=Status lifecycle integrity; fails_when=reject succeeds with empty reason; no_claim=network transport` |
| **Integration** | `POST /api/v1/profile/me/kyc` file validation and upload persistence | +3 | `protects=Payload parsing and storage linking; fails_when=invalid MIME type is accepted; no_claim=visual image fidelity` |
| **Integration** | `POST /api/v1/admin/kyc-verifications/{id}/approve` & `reject` authorization | +3 | `protects=Admin role gating and user status sync; fails_when=non-admin can approve KYC; no_claim=frontend UI state` |
| **Integration** | `POST /api/v1/bookings` unverified rejection gate (HTTP 403) | +2 | `protects=Strict KYC enforcement on order creation; fails_when=unverified user creates booking; no_claim=payment gateway flow` |
| **E2E / Probe** | End-to-end KYC submission -> Admin Approval -> Booking unlock | +1 | `protects=Full user journey from unverified to booking capable; fails_when=booking remains blocked after approval; no_claim=email delivery` |

## Rules for the implementing agent
1. Acceptance criteria are the `protects / fails_when / no_claim` profile of each test: the observable it protects, the wrong result it rejects, and what green does not prove. Never "make the tests pass".
2. Real code and real tests land in the same change; a placeholder, a stub assertion, or a test deferred to a follow-up is not done.
3. Any change to a test, validator, CI step, timeout, tolerance, threshold, snapshot, or suppression pragma is reported on its own line in your summary with its justification, before any other result.
4. A reported command names the command and its observed result (exit status, counts, the failing line); a command you did not run is not reported, and stderr is never silenced in a command you cite.
5. Your report is a claim until the parent re-executes it: say what you verified, what you reused, and what you could not check.

## Rollback Plan
- Revert the git commit; if the EF Core migration for `UserKycDocuments` has been applied, run `dotnet ef database update <previous_migration>` to drop the `user_kyc_documents` table without impacting core `users` data.
- User verification state remains backwards-compatible through the existing boolean `is_verified` column on the `users` table.

## Effort Estimate
- Schema & Domain (`UserKycDocument`, `CueDbContext`, domain methods): ~1.5h
- Backend Endpoints (`ProfileService` & `AdminController`): ~2.5h
- Booking Gate (`BookingService` & `BookingsController`): ~1.0h
- Frontend Profile KYC Submission Widget (`Profile.tsx`): ~2.5h
- Frontend Admin Studio KYC Review Tab (`AdminVerificationStudio.tsx`): ~2.0h
- Automated Unit & Integration Tests: ~2.0h
- **Total Estimated Effort**: ~11.5 hours (Human) / ~45 min (Agentic workflow)

## Files Reference
| File | Change |
| :--- | :--- |
| `shared/Libraries/Cue.Domain/UserKycDocument.cs` | New entity for identity card submissions |
| `shared/Libraries/Cue.Domain/User.cs:62` | Add `ApproveKyc()` and `RejectKyc()` domain methods |
| `shared/Libraries/Cue.Infrastructure.Data/CueDbContext.cs` | Register `UserKycDocuments` DbSet and relationships |
| `backend/Services/ProfileService/Controllers/ProfileController.cs` | Add `POST /me/kyc` and `GET /me/kyc` endpoints |
| `backend/Services/ProfileService/Controllers/AdminController.cs` | Add `GET /admin/kyc-verifications`, `POST .../approve`, and `POST .../reject` |
| `backend/Services/BookingService/Controllers/BookingsController.cs:18` | Add `user.IsVerified` validation check (HTTP 403) |
| `frontend/src/store/profileApi.ts` | Add KYC query and mutation endpoints |
| `frontend/src/store/adminApi.ts` | Add admin KYC query and approval/rejection mutations |
| `frontend/src/pages/Profile.tsx:921` | Implement interactive KYC upload & status UI |
| `frontend/src/components/admin/AdminVerificationStudio.tsx` | Add User Identity KYC review tab & viewer |
| `frontend/src/components/booking/BookingRequestModal.tsx` | Add unverified user prompt & modal interception |
| `tests/Cue.Domain.Tests/UserKycTests.cs` | Unit tests for KYC domain methods and state |

## Out of Scope
- Automated third-party KYC SDK integration (DigiLocker, Persona, Jumio) — planned for a future milestone.
- Automated facial recognition / biometric matching AI algorithms.
- PDF / document text OCR extraction.
- Phone number SMS re-verification (already handled during registration/login).

## Related
- Existing companion verification studio: `frontend/src/components/admin/AdminVerificationStudio.tsx`
- Booking authorization rules: `backend/Services/BookingService/Controllers/BookingsController.cs`


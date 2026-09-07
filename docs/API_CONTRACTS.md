# Cue Platform - API Contracts

## Overview

This document defines the OpenAPI/Swagger contracts for all Cue platform microservices. Each service exposes REST endpoints following these conventions:

- **Base URL:** `http://localhost:{PORT}/api/v1/`
- **Authentication:** JWT Bearer token in `Authorization` header
- **Response Format:** JSON with standard envelope
- **Error Handling:** Consistent error response format

---

## Standard Response Format

### Success Response (2xx)

```json
{
  "success": true,
  "data": { /* payload */ },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response (4xx/5xx)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 1. AuthService (Port 5001)

### Authentication Endpoints

#### POST /api/v1/auth/register

Register a new user account.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "requiresEmailVerification": true,
    "verificationTokenSent": true
  }
}
```

---

#### POST /api/v1/auth/login

Login with email and password.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440001",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

---

#### POST /api/v1/auth/refresh-token

Refresh expired access token.

**Request:**

```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

---

#### POST /api/v1/auth/logout

Logout current session.

**Request:** Empty body (JWT token required in header)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### POST /api/v1/auth/verify-email

Verify email with verification token.

**Request:**

```json
{
  "token": "email_verification_token_from_email"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

#### POST /api/v1/auth/2fa/send

Send 2FA code via SMS.

**Request:**

```json
{
  "phoneNumber": "+1234567890"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "2FA code sent to phone"
}
```

---

#### POST /api/v1/auth/2fa/verify

Verify 2FA code.

**Request:**

```json
{
  "code": "123456"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

---

## 2. UserService (Port 5002)

### User Profile Endpoints

#### GET /api/v1/users/me

Get current authenticated user's profile.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "profileImage": "https://...",
    "trustScore": 75,
    "isEmailVerified": true,
    "isPhoneVerified": true,
    "isKycVerified": false,
    "createdAt": "2024-01-10T10:00:00Z"
  }
}
```

---

#### PUT /api/v1/users/me

Update current user's profile.

**Request:**

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "bio": "Love outdoor activities",
  "profileImageUrl": "https://..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": { /* updated user object */ }
}
```

---

#### POST /api/v1/users/kyc/submit

Submit KYC (Know Your Customer) verification documents.

**Request (multipart/form-data):**

```
- documentType: "passport"
- documentImage: [file]
- selfieImage: [file]
```

**Response (202 Accepted):**

```json
{
  "success": true,
  "data": {
    "verificationId": "550e8400-e29b-41d4-a716-446655440002",
    "status": "pending_review",
    "message": "KYC submitted for review"
  }
}
```

---

#### GET /api/v1/users/:userId

Get user profile by ID.

**Response (200 OK):**

```json
{
  "success": true,
  "data": { /* public user information */ }
}
```

---

## 3. ProfileService (Port 5003)

### Provider Profile Endpoints

#### POST /api/v1/profiles/provider

Create provider profile.

**Request:**

```json
{
  "hourlyRate": 50.00,
  "bio": "Professional companion with 5+ years experience",
  "specialties": ["conversation", "event_companion", "travel"],
  "yearsOfExperience": 5,
  "introVideoUrl": "https://..."
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "hourlyRate": 50.00,
    "bio": "Professional companion...",
    "specialties": ["conversation", "event_companion", "travel"],
    "averageRating": 0,
    "totalBookings": 0,
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

#### GET /api/v1/profiles/provider/me

Get current user's provider profile.

**Response (200 OK):**

```json
{
  "success": true,
  "data": { /* provider profile */ }
}
```

---

#### PUT /api/v1/profiles/provider/me

Update provider profile.

**Request:**

```json
{
  "hourlyRate": 55.00,
  "bio": "Updated bio",
  "specialties": ["conversation", "event_companion"],
  "maxRadiusKm": 30
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": { /* updated profile */ }
}
```

---

#### POST /api/v1/profiles/provider/me/activate

Activate provider profile (make searchable).

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile activated successfully"
}
```

---

#### POST /api/v1/profiles/provider/me/deactivate

Deactivate provider profile.

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile deactivated successfully"
}
```

---

## 4. DiscoveryService (Port 5004)

### Search & Discovery Endpoints

#### GET /api/v1/discovery/search

Search for providers with filters.

**Query Parameters:**

```
- latitude: 40.7128
- longitude: -74.0060
- radius: 25 (km)
- minPrice: 30.00
- maxPrice: 100.00
- specialties: conversation,event_companion
- minRating: 4.0
- sortBy: distance|rating|price
- page: 1
- pageSize: 20
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Jane Smith",
        "bio": "Professional companion...",
        "hourlyRate": 50.00,
        "averageRating": 4.8,
        "totalBookings": 45,
        "specialties": ["conversation", "event_companion"],
        "distance": 2.3,
        "profileImage": "https://...",
        "responseTime": 15
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalCount": 145,
      "totalPages": 8
    }
  }
}
```

---

#### GET /api/v1/discovery/providers/:providerId

Get provider detail.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "user": { /* user info */ },
    "profile": { /* provider profile */ },
    "availability": [ /* next 30 days */ ],
    "recentReviews": [ /* last 5 reviews */ ],
    "trustScore": 85,
    "responseRate": 98.5
  }
}
```

---

## 5. BookingService (Port 5005)

### Booking Endpoints

#### POST /api/v1/bookings

Create new booking.

**Request:**

```json
{
  "providerId": "550e8400-e29b-41d4-a716-446655440003",
  "startTime": "2024-02-01T10:00:00Z",
  "endTime": "2024-02-01T12:00:00Z",
  "meetingAddress": "123 Main St, New York, NY",
  "specialRequests": "Prefer outdoor activities"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "providerId": "550e8400-e29b-41d4-a716-446655440003",
    "seekerId": "550e8400-e29b-41d4-a716-446655440000",
    "startTime": "2024-02-01T10:00:00Z",
    "endTime": "2024-02-01T12:00:00Z",
    "totalAmount": 100.00,
    "status": "pending_payment",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

#### GET /api/v1/bookings/:bookingId

Get booking details.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "provider": { /* provider details */ },
    "seeker": { /* seeker details */ },
    "startTime": "2024-02-01T10:00:00Z",
    "endTime": "2024-02-01T12:00:00Z",
    "status": "confirmed",
    "totalAmount": 100.00,
    "platformFee": 15.00,
    "providerEarnings": 85.00
  }
}
```

---

#### GET /api/v1/bookings

Get current user's bookings (pagination supported).

**Query Parameters:**

```
- status: pending_payment|confirmed|in_progress|completed|cancelled
- role: provider|seeker
- page: 1
- pageSize: 20
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "bookings": [ /* array of bookings */ ],
    "pagination": { /* pagination info */ }
  }
}
```

---

#### PUT /api/v1/bookings/:bookingId/confirm

Provider confirms booking.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "status": "confirmed",
    "confirmedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### PUT /api/v1/bookings/:bookingId/cancel

Cancel booking.

**Request:**

```json
{
  "reason": "Unexpected conflict",
  "refundPercentage": 100
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "status": "cancelled",
    "cancelledAt": "2024-01-15T10:30:00Z",
    "refundAmount": 100.00
  }
}
```

---

#### GET /api/v1/bookings/:bookingId/availability

Get provider's availability around booking time.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "availableSlots": [
      {
        "startTime": "2024-02-01T08:00:00Z",
        "endTime": "2024-02-01T09:00:00Z",
        "isAvailable": true
      }
    ]
  }
}
```

---

## 6. PaymentService (Port 5006)

### Payment Endpoints

#### POST /api/v1/payments/intent

Create payment intent (Stripe).

**Request:**

```json
{
  "bookingId": "550e8400-e29b-41d4-a716-446655440004",
  "amount": 100.00,
  "currency": "USD"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_1A2B3C4D5E6F7G8H9I0J_secret_...",
    "paymentIntentId": "pi_1A2B3C4D5E6F7G8H9I0J",
    "amount": 100.00,
    "status": "requires_payment_method"
  }
}
```

---

#### POST /api/v1/payments/confirm

Confirm payment.

**Request:**

```json
{
  "paymentIntentId": "pi_1A2B3C4D5E6F7G8H9I0J"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "transactionId": "550e8400-e29b-41d4-a716-446655440005",
    "status": "succeeded",
    "amount": 100.00
  }
}
```

---

#### GET /api/v1/payments/transaction/:transactionId

Get payment transaction details.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "bookingId": "550e8400-e29b-41d4-a716-446655440004",
    "amount": 100.00,
    "status": "captured",
    "paymentMethod": "card",
    "cardBrand": "Visa",
    "cardLastFour": "4242",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

## 7. ChatService (Port 5007)

### Chat Endpoints

#### POST /api/v1/chat/messages

Send message.

**Request:**

```json
{
  "orderId": "550e8400-e29b-41d4-a716-446655440004",
  "recipientId": "550e8400-e29b-41d4-a716-446655440003",
  "content": "Hi, looking forward to our meeting!",
  "messageType": "text"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440006",
    "senderId": "550e8400-e29b-41d4-a716-446655440000",
    "recipientId": "550e8400-e29b-41d4-a716-446655440003",
    "content": "Hi, looking forward to our meeting!",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### GET /api/v1/chat/orders/:orderId/messages

Get chat history for order.

**Query Parameters:**

```
- page: 1
- pageSize: 50
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "messages": [ /* array of messages */ ],
    "pagination": { /* pagination info */ }
  }
}
```

---

## 8. ReviewService (Port 5009)

### Review Endpoints

#### POST /api/v1/reviews

Submit review for completed booking.

**Request:**

```json
{
  "bookingId": "550e8400-e29b-41d4-a716-446655440004",
  "overallRating": 5,
  "timelinessRating": 5,
  "communicationRating": 4,
  "professionalismRating": 5,
  "comment": "Excellent experience!",
  "isAnonymous": false
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440007",
    "bookingId": "550e8400-e29b-41d4-a716-446655440004",
    "overallRating": 5,
    "comment": "Excellent experience!",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### GET /api/v1/reviews/user/:userId

Get user's reviews.

**Query Parameters:**

```
- page: 1
- pageSize: 20
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "reviews": [ /* array of reviews */ ],
    "statistics": {
      "averageRating": 4.8,
      "totalReviews": 45,
      "trustScore": 87
    },
    "pagination": { /* pagination info */ }
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
| ------ | ------------- | ------------- |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `CONFLICT` | 409 | Resource conflict (e.g., booking slot taken) |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## OpenAPI/Swagger Specification

Each microservice exposes OpenAPI 3.0 specification at:

```
GET http://localhost:{PORT}/swagger/v1/swagger.json
```

Interactive Swagger UI available at:

```
http://localhost:{PORT}/swagger/index.html
```

### Generating Swagger from Code

```csharp
services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Cue API", 
        Version = "v1",
        Description = "REST API for Cue Platform"
    });
    
    // Include XML documentation
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    c.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFile));
});
```

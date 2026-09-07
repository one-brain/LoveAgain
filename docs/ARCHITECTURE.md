# Cue Platform - Architecture Overview

## System Design

The Cue platform is built using **microservices architecture** with the following principles:

- **Domain-Driven Design (DDD)** for business logic organization
- **Clean Architecture** (Domain → Application → Infrastructure → Presentation layers)
- **CQRS** for command/query separation
- **Event-Driven Architecture** for async communication
- **Containerization** with Docker and **Container Orchestration** via Kubernetes

---

## Service Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway (Port 5000)                  │
│              (Ocelot - Routing, Rate Limiting, Auth)            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐    ┌──────▼──────┐   ┌──────▼──────┐
    │  Auth   │    │   Booking   │   │    Chat    │
    │ Service │    │   Service   │   │   Service  │
    │(5001)   │    │   (5005)    │   │   (5007)   │
    └─────────┘    └─────────────┘   └────────────┘
         │                │                │
         └────────────────┼────────────────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
         ┌────▼──┐  ┌─────▼──┐  ┌───▼───────┐
         │PostgreSQL│ Redis   │ RabbitMQ   │
         │ PostGIS  │(Cache)  │(Events)   │
         └─────────┘ └────────┘ └──────────┘
```

---

## Microservices Breakdown

### Core Services

#### 1. **AuthService** (Port 5001)

**Responsibility:** Authentication and authorization

- User login/registration with email verification
- JWT token generation and refresh
- 2FA via Twilio
- OAuth2/OIDC flows (for mobile)
- Session management

**Dependencies:** PostgreSQL, Redis, Email service
**Events Published:** `UserRegisteredEvent`, `UserLoggedInEvent`
**Events Consumed:** (None)

---

#### 2. **UserService** (Port 5002)

**Responsibility:** User profile management and verification

- User profile CRUD operations
- Identity verification (KYC, documents)
- Phone/email verification
- User preferences and settings
- Account deactivation

**Dependencies:** PostgreSQL, S3 (document storage), Email service
**Events Published:** `ProfileUpdatedEvent`, `UserVerifiedEvent`
**Events Consumed:** `UserRegisteredEvent`

---

#### 3. **ProfileService** (Port 5003)

**Responsibility:** Provider profile management

- Create/update provider profiles
- Specialties and service categories
- Intro video hosting and streaming
- Average rating calculation
- Profile visibility and activation

**Dependencies:** PostgreSQL, Redis, S3 (video storage)
**Events Published:** `ProfileCreatedEvent`, `ProfileUpdatedEvent`
**Events Consumed:** `UserRegisteredEvent`, `ReviewSubmittedEvent`

---

#### 4. **DiscoveryService** (Port 5004)

**Responsibility:** Search, filtering, and recommendations

- Provider search with full-text search
- Geo-location based filtering (PostGIS)
- Price range filtering
- Specialty-based discovery
- Recommendation engine
- Availability checking via cache

**Dependencies:** PostgreSQL (PostGIS), Redis
**Events Published:** (None - query-only)
**Events Consumed:** `ProfileUpdatedEvent`, `AvailabilityChangedEvent`

---

#### 5. **BookingService** (Port 5005)

**Responsibility:** Order and availability management

- Create/cancel bookings
- Availability slot management
- Order status transitions
- Calendar synchronization
- Booking history and analytics

**Dependencies:** PostgreSQL, Redis, RabbitMQ
**Events Published:** `BookingCreatedEvent`, `BookingConfirmedEvent`, `BookingCompletedEvent`
**Events Consumed:** `PaymentProcessedEvent`, `CancelRequestEvent`

---

#### 6. **PaymentService** (Port 5006)

**Responsibility:** Payment processing and transactions

- Stripe Connect integration for marketplace payments
- Payment intent creation (escrow-based)
- Webhook handling for payment events
- Transaction logging and reconciliation
- Refund processing
- Payout management

**Dependencies:** PostgreSQL, Stripe API
**Events Published:** `PaymentProcessedEvent`, `PaymentFailedEvent`, `RefundIssuedEvent`
**Events Consumed:** `BookingCreatedEvent`

---

#### 7. **ChatService** (Port 5007)

**Responsibility:** Real-time messaging and communication

- Message persistence
- File attachment handling
- Real-time notifications via SignalR
- Message encryption
- Read receipts
- Chat history retrieval
- Message moderation

**Dependencies:** PostgreSQL, Redis, SignalR
**Events Published:** `MessageSentEvent`, `NewMessageEvent`
**Events Consumed:** `BookingCreatedEvent`

---

#### 8. **NotificationService** (Port 5008)

**Responsibility:** Multi-channel notifications

- Email notifications
- SMS notifications via Twilio
- Push notifications via Firebase
- Notification templating
- Notification preferences management
- Delivery tracking

**Dependencies:** Email service (SendGrid), Twilio, Firebase, PostgreSQL
**Events Published:** `NotificationSentEvent`
**Events Consumed:** All service events (subscription model)

---

#### 9. **ReviewService** (Port 5009)

**Responsibility:** Ratings, reviews, and trust scoring

- Review creation and management
- Star rating system
- Trust score calculation (ML-based)
- Reputation metrics
- Review moderation
- Dispute handling

**Dependencies:** PostgreSQL, Redis
**Events Published:** `ReviewSubmittedEvent`, `TrustScoreUpdatedEvent`
**Events Consumed:** `BookingCompletedEvent`

---

#### 10. **SupportService** (Port 5010)

**Responsibility:** Dispute resolution and customer support

- Ticket creation and management
- Dispute escalation
- Evidence collection (photos, messages)
- Resolution tracking
- Support staff assignment
- Knowledge base

**Dependencies:** PostgreSQL, S3 (evidence storage)
**Events Published:** `DisputeCreatedEvent`, `DisputeResolvedEvent`
**Events Consumed:** `BookingCancelledEvent`, `ReviewSubmittedEvent`

---

#### 11. **AnalyticsService** (Port 5011)

**Responsibility:** Event tracking and analytics

- Event logging and aggregation
- User behavior tracking
- Performance metrics
- Business intelligence dashboards
- Data warehouse queries

**Dependencies:** Elasticsearch, Kibana, PostgreSQL (analytics DB)
**Events Published:** (None - aggregates only)
**Events Consumed:** All service events

---

#### 12. **APIGateway** (Port 5000)

**Responsibility:** Request routing and cross-cutting concerns

- Request routing to microservices
- JWT token validation
- Rate limiting per user/IP
- Request/response logging
- CORS handling
- API versioning

**Dependencies:** All microservices (indirectly)
**Framework:** Ocelot

---

## Data Flow Architecture

### Booking Flow (Synchronous)

```
User (Frontend)
    ↓
API Gateway → BookingService
    ↓ (checks availability in Redis)
    ↓
PaymentService (Stripe)
    ↓ (payment intent created)
    ↓
BookingService (order created, status = PendingPayment)
    ↓ (publishes BookingCreatedEvent)
    ↓
[Event Bus - RabbitMQ]
    ↓ (async processing)
ChatService, NotificationService, AnalyticsService listen
```

### Asynchronous Event Flow

```
BookingService publishes BookingCreatedEvent
    ↓
RabbitMQ distributes to:
  - ChatService (creates chat thread)
  - NotificationService (sends confirmations)
  - AnalyticsService (logs booking)
  - SupportService (prepares dispute handler)

ReviewService listens for BookingCompletedEvent
    ↓
Creates review window and calculates trust scores
```

---

## Database Architecture

### PostgreSQL Schemas

Each microservice has its own isolated schema:

```
cues_db/
  ├── auth/          (AuthService tables)
  ├── users/         (UserService tables)
  ├── profiles/      (ProfileService tables)
  ├── orders/        (BookingService tables)
  ├── payments/      (PaymentService tables)
  ├── chat/          (ChatService tables)
  ├── reviews/       (ReviewService tables)
  ├── support/       (SupportService tables)
  └── analytics/     (AnalyticsService tables)
```

**Key Indexes:**

- `(provider_id, start_time)` on availability_slots (filtering available slots)
- `(seeker_id, status)` on service_orders (user's bookings)
- `location` (PostGIS GIST index) on provider_profiles (geo-search)
- `(order_id, created_at DESC)` on chat_messages (pagination)

---

## Caching Strategy

### Redis Cache Layers

| Key Pattern | TTL | Purpose |
| ------------- | ----- | --------- |
| `user:{id}:profile` | 1 hour | User profile cache |
| `provider:{id}:availability` | 15 min | Availability slots (high update frequency) |
| `review:{order_id}` | 24 hours | Order reviews |
| `trust_score:{user_id}` | 1 hour | Trust score cache |
| `session:{token}` | 15 min | Active session tracking |

---

## Authentication & Authorization

### JWT Token Structure

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": ["Provider", "Seeker", "Admin"],
  "trust_score": 85,
  "exp": 1640995200,
  "iat": 1640908800,
  "iss": "https://cue-auth.local",
  "aud": "cue-platform"
}
```

### Authorization Model

- **Role-Based Access Control (RBAC):** Provider, Seeker, Admin
- **Resource-Based Access Control:** Can only modify own bookings/profiles
- **Trust-Based Access:** Some features require minimum trust score (70+)

---

## Observability & Monitoring

### OpenTelemetry Integration

Each service exports:

- **Traces** → Jaeger (distributed tracing)
- **Metrics** → Prometheus (scrapes /metrics endpoint)
- **Logs** → Serilog → Elasticsearch

### Key Metrics

```
- Request latency (p50, p95, p99)
- Error rates by service
- Database query performance
- Cache hit/miss ratios
- Queue depth (RabbitMQ)
- Trust score distribution
```

### Dashboards

- **Grafana:** Real-time system health
- **Kibana:** Log aggregation and search
- **Jaeger UI:** Request tracing and dependency analysis

---

## Resilience Patterns

### Circuit Breaker (Polly)

Services use Polly circuit breaker to prevent cascade failures:

- Open after 5 consecutive failures
- Half-open after 30 seconds
- Close on successful requests

### Retry Strategy

- 3 retries with exponential backoff (100ms → 500ms → 1000ms)
- Only for idempotent operations (GET, idempotent POST/PUT)

### Bulkhead Isolation

- Each service has isolated thread pools
- Prevents resource exhaustion

### Timeouts

- API calls: 30 seconds
- Database queries: 10 seconds
- Cache operations: 2 seconds

---

## Deployment Architecture

### Local Development

- **kind** runs all services in a local Kubernetes cluster
- Use `kind-create.ps1` to create the cluster and local registry
- Use `build-and-load.ps1` to build Docker images and load them into Kind
- Deploy with `kubectl apply -k infra/k8s/overlays/dev`

### Kubernetes (Staging/Production)

- **Namespaces:** cue-dev, cue-staging, cue-prod
- **Resource Limits:** CPU 500m, Memory 512Mi per pod
- **Horizontal Pod Autoscaling:** 2-5 replicas based on CPU/Memory
- **Rolling Updates:** maxSurge 1, maxUnavailable 0

---

## Technology Stack Summary

| Layer | Technology |
| ------- | ----------- |
| **API Gateway** | Ocelot |
| **Services** | ASP.NET Core 8, C# |
| **Database** | PostgreSQL 15 + PostGIS |
| **Cache** | Redis 7 |
| **Message Queue** | RabbitMQ 3 |
| **Real-time** | SignalR |
| **Tracing** | OpenTelemetry + Jaeger |
| **Metrics** | Prometheus |
| **Logs** | Serilog + Elasticsearch |
| **Containerization** | Docker |
| **Orchestration** | Kubernetes |
| **Frontend** | React 18 + TypeScript |
| **Mobile** | Flutter + Riverpod |

---

## Security Measures

1. **Data Encryption:** TLS for transit, encryption at rest
2. **SQL Injection Prevention:** EF Core parameterized queries
3. **XSS Prevention:** React's built-in protection + CSP headers
4. **CSRF Protection:** SameSite cookies + CSRF tokens
5. **Rate Limiting:** Per-user and per-IP limits
6. **Secrets Management:** Environment variables, Kubernetes secrets
7. **Audit Logging:** All sensitive operations logged

---

## Future Enhancements

1. **API Versioning:** Implement versioning strategy (v2, v3)
2. **GraphQL Gateway:** Alternative to REST for complex queries
3. **Machine Learning:** Recommendation engine and fraud detection
4. **Blockchain:** Smart contracts for escrow (future)
5. **Multi-tenancy:** Support for sub-platforms

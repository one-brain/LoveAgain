# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cue (LoveAgain) is a microservices-based "Experience Companion" platform where users rent/offers companionship services for activities, networking, and skill-sharing. The platform handles secure payments, real-time chat, GPS verification, and trust-based reputation scoring.

## Solution Structure

- **Solution file**: `backend/Cue.sln`
- **12 backend microservices** in `backend/Services/` (AuthService, UserService, ProfileService, DiscoveryService, BookingService, PaymentService, ChatService, NotificationService, ReviewService, SupportService, AnalyticsService, APIGateway)
- **Shared libraries** in `shared/Libraries/` (Cue.Domain, Cue.Application, Cue.Common, Cue.Infrastructure.*)
- **Frontend** (React + TypeScript + Tailwind) in `frontend/`
- **Mobile** (Flutter) in `mobile/`
- **Tests** in `tests/`
- **Helm charts** separated into `helm-chart-infrastructure/` (PostgreSQL, RabbitMQ, Redis) and `helm-chart-services/` (microservices + frontend)

## Build and Test Commands

### Backend (.NET 10)
```bash
dotnet build backend/Cue.sln --configuration Release
dotnet test backend/Cue.sln --configuration Release --collect:"XPlat Code Coverage"
# Single service test
dotnet test backend/Services/BookingService/BookingService.csproj --configuration Release
```

### Frontend (Node 20)
```bash
cd frontend && npm ci && npm run build
```

### Mobile (Flutter 3.29)
```bash
cd mobile && flutter pub get && flutter analyze
```

### Docker
```bash
docker build --file infra/docker/Dockerfile.template --build-arg SERVICE_PROJECT_PATH=backend/Services/BookingService/BookingService.csproj --build-arg SERVICE_DLL=BookingService --tag cue/BookingService:latest .
```

### Helm Deployments
```bash
helm install cue-infra ./helm-chart-infrastructure -f ./helm-chart-infrastructure/values-local.yaml -n cue --create-namespace
helm install cue-services ./helm-chart-services -f ./helm-chart-services/values-local.yaml -n cue --create-namespace
```

## Architecture

### Backend Pattern
Clean Architecture (Domain, Application, Infrastructure, Presentation layers) per microservice. CQRS via MediatR for command/query separation. Entity Framework Core with PostgreSQL. Redis for distributed caching. RabbitMQ for async event-driven communication. SignalR for real-time WebSocket notifications. JWT with refresh tokens for authentication.

### Frontend
React 18 + Vite + TypeScript. Redux Toolkit + RTK Query for API caching. Tailwind CSS + Material-UI. React Router v6 with protected routes. React Hook Form + Zod validation. RTK Query for API calls.

### Mobile
Flutter with Riverpod/BLoC state management. GoRouter for navigation. Firebase Cloud Messaging for push. SignalR for real-time chat. Geolocator for GPS tracking.

### Infrastructure
- **API Gateway**: Ocelot (port 5000) for routing, rate limiting, JWT validation
- **Message Queue**: RabbitMQ (port 5672)
- **Database**: PostgreSQL with PostGIS extension (port 5432)
- **Cache**: Redis (port 6379)
- **Monitoring**: OpenTelemetry + Jaeger for tracing, Prometheus + Grafana for metrics

## Domain Context (see CONTEXT.md)

Key entities and invariants:
- **User**: Authenticated person (seeker, provider, or admin)
- **Provider profile**: Offer-side profile with pricing, specialties, service radius
- **Service order**: Booking aggregate between seeker/provider (status controls lifecycle)
- **Availability slot**: Time window held by at most one service order
- **Trust event**: Immutable record of trust-score adjustments

Critical invariants: order seeker ≠ provider, end time > start time, monetary values non-negative (provider earnings + platform fee = total), slots held only once, reviews only for completed orders and never self-authored.

## Important Patterns

- **CQRS**: Commands and queries separated via MediatR
- **Event-driven**: RabbitMQ with dead-letter queues and Polly retry policies
- **Database**: PostgreSQL with UUID PKs, JSONB metadata, GIN full-text search, PostGIS geospatial queries, table partitioning for ChatMessages
- **Security**: Rate limiting middleware, encrypted string values for sensitive fields, CORS policies for mobile app

## CI/CD

GitHub Actions in `.github/workflows/`:
- **Backend**: dotnet build + test with code coverage
- **Frontend**: npm install + build
- **Mobile**: Flutter install + analyze
- **Containers**: Docker build validation for AuthService, BookingService, PaymentService, ChatService
- **Deploy**: Separate pipelines for infrastructure (manual trigger) vs services (push to main)

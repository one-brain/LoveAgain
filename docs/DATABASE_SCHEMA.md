# Cue Platform - Database Schema

## Overview

PostgreSQL database with PostGIS extension for geospatial queries. Each microservice has its own schema for data isolation.

---

## Core Tables

### 1. Users Table

```sql
CREATE SCHEMA auth;

CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255),
    date_of_birth DATE,
    profile_image_url TEXT,
    
    -- Verification
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_kyc_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    phone_verified_at TIMESTAMP,
    
    -- Trust & Status
    trust_score INTEGER DEFAULT 50,
    account_status VARCHAR(50) DEFAULT 'active', -- active, suspended, deleted
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_users_phone ON auth.users(phone_number);
CREATE INDEX idx_users_created ON auth.users(created_at DESC);
CREATE INDEX idx_users_status ON auth.users(account_status) WHERE deleted_at IS NULL;
```

### 2. Provider Profiles Table

```sql
CREATE SCHEMA profiles;

CREATE TABLE profiles.provider_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Professional Info
    hourly_rate DECIMAL(10, 2) NOT NULL,
    bio TEXT,
    specialties TEXT[] NOT NULL,
    intro_video_url TEXT,
    years_of_experience INTEGER,
    certifications JSONB,
    
    -- Availability
    max_radius_km DECIMAL(5, 2) DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE,
    average_response_time_minutes INTEGER,
    
    -- Statistics
    total_bookings INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    response_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- Location (PostGIS)
    location GEOGRAPHY(POINT, 4326),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT hourly_rate_check CHECK (hourly_rate > 0),
    CONSTRAINT radius_check CHECK (max_radius_km > 0),
    CONSTRAINT years_check CHECK (years_of_experience >= 0)
);

CREATE INDEX idx_provider_location ON profiles.provider_profiles USING GIST(location);
CREATE INDEX idx_provider_active ON profiles.provider_profiles(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_provider_rating ON profiles.provider_profiles(average_rating DESC);
CREATE INDEX idx_provider_specialties ON profiles.provider_profiles USING GIN(specialties);
```

### 3. Availability Slots Table

```sql
CREATE SCHEMA bookings;

CREATE TABLE bookings.availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    
    is_booked BOOLEAN DEFAULT FALSE,
    booked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    booking_id UUID,  -- Foreign key to service_orders
    
    slot_type VARCHAR(50) DEFAULT 'availability', -- availability, blocked, maintenance
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT time_check CHECK (end_time > start_time),
    CONSTRAINT valid_slot_type CHECK (slot_type IN ('availability', 'blocked', 'maintenance'))
);

-- Critical index for finding available slots
CREATE INDEX idx_availability_search ON bookings.availability_slots(provider_id, start_time)
    WHERE is_booked = FALSE;
CREATE INDEX idx_availability_provider ON bookings.availability_slots(provider_id, start_time DESC);
CREATE INDEX idx_availability_date ON bookings.availability_slots(DATE(start_time));
```

### 4. Service Orders (Bookings) Table

```sql
CREATE TABLE bookings.service_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Parties
    provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    seeker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    
    -- Timing
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    duration_hours DECIMAL(4, 2),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending_payment',
    -- pending_payment → confirmed → in_progress → completed/cancelled
    
    -- Pricing
    hourly_rate DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL,
    provider_earnings DECIMAL(10, 2) NOT NULL,
    
    -- Location
    meeting_address TEXT,
    meeting_coordinates GEOGRAPHY(POINT, 4326),
    
    -- Communication
    special_requests TEXT,
    
    -- Cancellation
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES auth.users(id),
    cancelled_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_status CHECK (status IN (
        'pending_payment', 'confirmed', 'in_progress', 
        'completed', 'cancelled', 'disputed'
    ))
);

CREATE INDEX idx_orders_provider_status ON bookings.service_orders(provider_id, status);
CREATE INDEX idx_orders_seeker_status ON bookings.service_orders(seeker_id, status);
CREATE INDEX idx_orders_time_range ON bookings.service_orders(start_time, end_time);
CREATE INDEX idx_orders_status ON bookings.service_orders(status) WHERE status != 'completed';
```

### 5. Reviews Table

```sql
CREATE SCHEMA reviews;

CREATE TABLE reviews.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES bookings.service_orders(id) ON DELETE CASCADE,
    
    -- Reviewer
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    
    -- Ratings
    overall_rating INTEGER NOT NULL,
    timeliness_rating INTEGER,
    communication_rating INTEGER,
    professionalism_rating INTEGER,
    
    -- Review Content
    comment TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- Moderation
    is_flagged BOOLEAN DEFAULT FALSE,
    moderation_status VARCHAR(50) DEFAULT 'approved', -- approved, pending, rejected
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT rating_range CHECK (
        overall_rating >= 1 AND overall_rating <= 5
    ),
    CONSTRAINT reviewer_check CHECK (reviewer_id != reviewee_id)
);

CREATE INDEX idx_reviews_reviewee ON reviews.reviews(reviewee_id);
CREATE INDEX idx_reviews_order ON reviews.reviews(order_id);
CREATE INDEX idx_reviews_created ON reviews.reviews(created_at DESC);
CREATE INDEX idx_reviews_approved ON reviews.reviews(is_flagged, moderation_status);
```

### 6. Chat Messages Table

```sql
CREATE SCHEMA chat;

CREATE TABLE chat.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES bookings.service_orders(id) ON DELETE CASCADE,
    
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- text, image, video, file
    
    -- Attachments
    attachment_url TEXT,
    attachment_mime_type VARCHAR(100),
    
    -- Message Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    is_edited BOOLEAN DEFAULT FALSE,
    
    -- Encryption
    is_encrypted BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partition by month for large tables
CREATE INDEX idx_messages_order_created ON chat.messages(order_id, created_at DESC);
CREATE INDEX idx_messages_recipient_read ON chat.messages(recipient_id, is_read)
    WHERE is_read = FALSE;
CREATE INDEX idx_messages_sender ON chat.messages(sender_id, created_at DESC);
```

### 7. Payment Transactions Table

```sql
CREATE SCHEMA payments;

CREATE TABLE payments.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES bookings.service_orders(id) ON DELETE RESTRICT,
    
    -- Stripe Integration
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_charge_id VARCHAR(255),
    client_secret VARCHAR(255),
    
    -- Payment Details
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'authorized',
    -- authorized, captured, failed, refunded, refund_pending
    
    -- Payment Method
    payment_method_type VARCHAR(50), -- card, bank_transfer, etc
    card_last_four VARCHAR(4),
    card_brand VARCHAR(50),
    
    -- Fee Information
    platform_fee DECIMAL(10, 2) NOT NULL,
    stripe_fee DECIMAL(10, 2) NOT NULL,
    
    -- Escrow
    held_until TIMESTAMP, -- When funds are released to provider
    
    -- Metadata
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT amount_check CHECK (amount > 0)
);

CREATE INDEX idx_payments_order ON payments.payment_transactions(order_id);
CREATE INDEX idx_payments_status ON payments.payment_transactions(status);
CREATE INDEX idx_payments_created ON payments.payment_transactions(created_at DESC);
CREATE INDEX idx_payments_stripe ON payments.payment_transactions(stripe_payment_intent_id);
```

### 8. Disputes Table

```sql
CREATE SCHEMA support;

CREATE TABLE support.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES bookings.service_orders(id) ON DELETE RESTRICT,
    
    raised_by UUID NOT NULL REFERENCES auth.users(id),
    raised_against UUID NOT NULL REFERENCES auth.users(id),
    
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    
    status VARCHAR(50) DEFAULT 'open',
    -- open, in_review, resolved, escalated
    
    evidence JSONB, -- URLs to screenshots, chat logs, etc
    resolution TEXT,
    resolved_by UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE INDEX idx_disputes_order ON support.disputes(order_id);
CREATE INDEX idx_disputes_status ON support.disputes(status) WHERE status != 'resolved';
CREATE INDEX idx_disputes_user ON support.disputes(raised_by);
```

### 9. Trust Events Table

```sql
CREATE TABLE reviews.trust_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    event_type VARCHAR(100) NOT NULL,
    -- booking_completed, review_submitted, dispute_resolved, kyc_verified, etc
    
    score_delta INTEGER NOT NULL, -- Can be positive or negative
    reason TEXT,
    
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trust_events_user ON reviews.trust_events(user_id, created_at DESC);
CREATE INDEX idx_trust_events_type ON reviews.trust_events(event_type);
```

---

## Indexing Strategy

### Performance-Critical Queries

```sql
-- Find available providers near location
CREATE INDEX idx_provider_search ON profiles.provider_profiles 
    USING GIST(location) 
    WHERE is_active = TRUE;

-- Find available slots quickly
CREATE INDEX idx_slot_availability ON bookings.availability_slots(provider_id, start_time)
    WHERE is_booked = FALSE;

-- User's active bookings
CREATE INDEX idx_user_bookings ON bookings.service_orders(seeker_id, status)
    WHERE status IN ('pending_payment', 'confirmed', 'in_progress');

-- Full-text search on provider specialties and bio
CREATE INDEX idx_provider_fulltext ON profiles.provider_profiles USING GIN(specialties);
```

---

## Data Retention & Archival

| Table | Retention | Archive Strategy |
| ------- | ----------- | ------------------ |
| messages | 2 years | Move to cold storage, compress |
| reviews | Permanent | None (business records) |
| trust_events | 5 years | Archive to separate DB |
| analytics | 1 year | Aggregate and delete raw |
| payment_transactions | 7 years | Regulatory requirement |

---

## Backup & Recovery

### Backup Strategy

- **Daily full backups** to S3 with 30-day retention
- **Hourly incremental backups**
- **Point-in-time recovery** enabled (7-day retention)

### Recovery Steps

```bash
# Restore from backup
pg_restore --host=localhost --username=admin --dbname=cues_db backup.dump

# Verify integrity
SELECT COUNT(*) FROM auth.users;
```

---

## Monitoring & Maintenance

### Query Performance

```sql
-- Find slow queries
SELECT query, calls, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Vacuum & Analyze

```bash
# Scheduled daily via cron
VACUUM ANALYZE;
REINDEX DATABASE cues_db;
```

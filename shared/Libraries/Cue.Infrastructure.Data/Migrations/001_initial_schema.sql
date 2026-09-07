CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS profiles;
CREATE SCHEMA IF NOT EXISTS bookings;
CREATE SCHEMA IF NOT EXISTS reviews;
CREATE SCHEMA IF NOT EXISTS chat;
CREATE SCHEMA IF NOT EXISTS payments;
CREATE SCHEMA IF NOT EXISTS support;
CREATE SCHEMA IF NOT EXISTS notifications;

CREATE TABLE IF NOT EXISTS auth.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(255) NOT NULL UNIQUE,
    password_hash varchar(500),
    phone varchar(20),
    first_name varchar(100) NOT NULL,
    last_name varchar(100) NOT NULL,
    date_of_birth date,
    is_verified boolean NOT NULL DEFAULT false,
    trust_score integer NOT NULL DEFAULT 50 CHECK (trust_score BETWEEN 0 AND 100),
    roles integer[] NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles.provider_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),
    hourly_rate numeric(10,2) NOT NULL CHECK (hourly_rate > 0),
    bio text NOT NULL DEFAULT '',
    specialties text[] NOT NULL,
    max_radius_km numeric(5,2) NOT NULL DEFAULT 50 CHECK (max_radius_km > 0),
    intro_video_url text,
    is_active boolean NOT NULL DEFAULT false,
    average_response_time numeric(10,2) NOT NULL DEFAULT 0,
    average_rating numeric(3,2) NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_provider_specialties_gin ON profiles.provider_profiles USING gin (specialties);
CREATE INDEX IF NOT EXISTS idx_provider_active_rating ON profiles.provider_profiles (is_active, average_rating DESC);

CREATE TABLE IF NOT EXISTS bookings.availability_slots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id uuid NOT NULL REFERENCES auth.users(id),
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    is_booked boolean NOT NULL DEFAULT false,
    booking_id uuid,
    CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_availability_slot_search
    ON bookings.availability_slots (provider_id, start_time)
    WHERE is_booked = false;
CREATE UNIQUE INDEX IF NOT EXISTS idx_availability_slot_booking
    ON bookings.availability_slots (booking_id)
    WHERE booking_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS bookings.service_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id uuid NOT NULL REFERENCES auth.users(id),
    seeker_id uuid NOT NULL REFERENCES auth.users(id),
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    status varchar(50) NOT NULL,
    total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
    platform_fee numeric(10,2) NOT NULL CHECK (platform_fee >= 0),
    provider_earnings numeric(10,2) NOT NULL CHECK (provider_earnings >= 0),
    meeting_address text,
    cancellation_reason varchar(500),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (end_time > start_time),
    CHECK (platform_fee <= total_amount),
    CHECK (provider_id <> seeker_id)
);

CREATE INDEX IF NOT EXISTS idx_service_orders_seeker_status ON bookings.service_orders (seeker_id, status);
CREATE INDEX IF NOT EXISTS idx_service_orders_provider_status ON bookings.service_orders (provider_id, status);
CREATE INDEX IF NOT EXISTS idx_service_orders_time ON bookings.service_orders (start_time, end_time);

CREATE TABLE IF NOT EXISTS reviews.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL UNIQUE REFERENCES bookings.service_orders(id),
    reviewer_id uuid NOT NULL REFERENCES auth.users(id),
    reviewee_id uuid NOT NULL REFERENCES auth.users(id),
    rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment varchar(4000) NOT NULL,
    timeliness_score integer CHECK (timeliness_score BETWEEN 1 AND 5),
    communication_score integer CHECK (communication_score BETWEEN 1 AND 5),
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK (reviewer_id <> reviewee_id)
);

CREATE TABLE IF NOT EXISTS chat.messages (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES bookings.service_orders(id),
    sender_id uuid NOT NULL REFERENCES auth.users(id),
    content text NOT NULL,
    message_type varchar(50) NOT NULL,
    sent_at timestamptz NOT NULL DEFAULT now(),
    is_read boolean NOT NULL DEFAULT false,
    PRIMARY KEY (id, sent_at)
) PARTITION BY RANGE (sent_at);

CREATE TABLE IF NOT EXISTS chat.messages_default PARTITION OF chat.messages DEFAULT;
CREATE INDEX IF NOT EXISTS idx_chat_messages_order_created ON chat.messages (order_id, sent_at DESC);

CREATE TABLE IF NOT EXISTS payments.payment_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL UNIQUE REFERENCES bookings.service_orders(id),
    stripe_payment_intent_id varchar(255) NOT NULL UNIQUE,
    amount numeric(10,2) NOT NULL CHECK (amount > 0),
    currency varchar(3) NOT NULL,
    status varchar(50) NOT NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support.disputes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL UNIQUE REFERENCES bookings.service_orders(id),
    raised_by uuid NOT NULL REFERENCES auth.users(id),
    reason varchar(500) NOT NULL,
    status varchar(50) NOT NULL,
    resolution text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    type varchar(50) NOT NULL,
    content varchar(4000) NOT NULL,
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications.notifications (user_id, is_read);

CREATE TABLE IF NOT EXISTS reviews.trust_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    event_type varchar(100) NOT NULL,
    score_delta integer NOT NULL,
    reason varchar(500) NOT NULL,
    timestamp timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_trust_events_user_timestamp ON reviews.trust_events (user_id, timestamp DESC);

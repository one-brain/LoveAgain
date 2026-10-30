# Production Deployment Plan & Runbook

This document defines the production deployment plan, cloud architecture, step-by-step rollout procedures, secret management, observability, disaster recovery, and operational cost model for the **Cue** platform.

---

## 1. System Overview & Production Topology

The Cue platform runs as a containerized microservices ecosystem orchestrated via Kubernetes:

```
                                  ┌──────────────────────────────┐
                                  │      Cloudflare Edge CDN     │
                                  │   (DNS, DDoS, WAF, SSL, Caching)
                                  └──────────────┬───────────────┘
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        ▼                                                 ▼
          ┌───────────────────────────┐                     ┌───────────────────────────┐
          │  Frontend SPA (React/Vite)│                     │   Kubernetes Ingress /    │
          │  (Cloudflare Pages / S3)  │                     │   AWS ALB (TLS Term)      │
          └───────────────────────────┘                     └─────────────┬─────────────┘
                                                                          │
                                                                          ▼
                                                            ┌───────────────────────────┐
                                                            │   API Gateway (Ocelot)    │
                                                            │  (Port 8080 / Rate Limit) │
                                                            └─────────────┬─────────────┘
                                                                          │
                ┌────────────────────────────────┬────────────────────────┴────────────────────────┐
                ▼                                ▼                                                 ▼
      ┌──────────────────┐             ┌──────────────────┐                              ┌──────────────────┐
      │   Auth Service   │             │ Booking Service  │                              │   Chat Service   │
      │  (JWT / Refresh) │             │  (Escrow Engine) │                              │ (SignalR/Sockets)│
      └────────┬─────────┘             └────────┬─────────┘                              └────────┬─────────┘
               │                                │                                                 │
               ├────────────────────────────────┼─────────────────────────────────────────────────┤
               ▼                                ▼                                                 ▼
      ┌──────────────────┐             ┌──────────────────┐                              ┌──────────────────┐
      │   User Service   │             │ Payment Service  │                              │Discovery Service │
      │  (KYC / Profiles)│             │ (Razorpay/Stripe)│                              │ (PostGIS Spatial)│
      └────────┬─────────┘             └────────┬─────────┘                              └────────┬─────────┘
               │                                │                                                 │
               └────────────────────────────────┼─────────────────────────────────────────────────┘
                                                │
                     ┌──────────────────────────┼──────────────────────────┐
                     ▼                          ▼                          ▼
          ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
          │ PostgreSQL 15+      │    │ Redis 7             │    │ RabbitMQ Cluster    │
          │ (PostGIS, Geo-Index,│    │ (Session, SignalR,  │    │ (Event Bus, CQRS,   │
          │  Escrow Ledger)     │    │  Distributed Locks) │    │  Domain Events)     │
          └─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

### Microservices Inventory (12 Services + Frontend)
1. `api-gateway` — Ocelot reverse proxy, route aggregation, TLS forward, IP throttling
2. `auth-service` — Identity, JWT issue/refresh, bcrypt, login rate-limiting
3. `user-service` — User profile management, KYC documentation & verification
4. `profile-service` — Companion profile catalog, specialties, intro media
5. `discovery-service` — Geo-spatial proximity search via PostGIS (`ST_DWithin`), filters
6. `booking-service` — Reservation lifecycle, duration slider math, safe escrow state machine
7. `payment-service` — Razorpay / Stripe gateway integration, escrow deposits, automated payouts
8. `chat-service` — Real-time SignalR WebSockets, message history, read receipts
9. `notification-service` — Async email (SES), SMS / WhatsApp (Gupshup/Twilio), push alerts
10. `review-service` — Ratings, escrow verification badges, companion trust scores
11. `support-service` — Customer disputes, cancellation reviews, refund claims
12. `analytics-service` — Metrics aggregation, booking volume, GMV, companion payouts
13. `frontend` — Single Page Application (React 19, TypeScript, Tailwind CSS, Vite)

---

## 2. Infrastructure Options & Sizing Matrix

### Option A: Lean Production (DigitalOcean DOKS / Linode / Hetzner)
*Target: Immediate commercial launch, Seed stage ($1,000–$15,000 MAU)*
- **Kubernetes**: Managed 3-Node Cluster (`4 vCPU, 8 GB RAM` per node)
- **Database**: Managed PostgreSQL 15 with PostGIS (`2 vCPU, 4 GB RAM, 50 GB NVMe`)
- **Cache**: Managed Redis 7 (`1 GB RAM, HA`)
- **Queue**: RabbitMQ in-cluster with persistent volume (`10 GB PVC`)
- **Object Storage**: Cloudflare R2 (Zero egress cost for companion media & KYC)
- **Estimated Cost**: **₹15,000 – ₹22,000 / month** (`$175 – $255 / mo`)

### Option B: Enterprise Hyperscaler (AWS Multi-AZ Production)
*Target: Scale & High Availability ($50,000–$200,000 MAU)*
- **Kubernetes**: AWS EKS Control Plane + Auto-scaling Node Group (`3–6 nodes m6g.xlarge`)
- **Database**: AWS Aurora PostgreSQL Multi-AZ with PostGIS + Auto-scaling Read Replica
- **Cache**: AWS ElastiCache for Redis Multi-AZ (2 shards, automatic failover)
- **Queue**: Amazon MQ for RabbitMQ (3-node cluster)
- **Object Storage**: AWS S3 + S3 Glacier cold archiving + Cloudflare edge CDN
- **Estimated Cost**: **₹1,25,000 – ₹1,90,000 / month** (`$1,450 – $2,200 / mo`)

---

## 3. Pre-Requisites & Tooling

Ensure the following tools are installed on the deployment machine/runner:
- Docker CLI & Buildx (`>= 24.0`)
- `kubectl` (`>= 1.28`) configured with production cluster context
- `helm` (`>= 3.12`)
- AWS CLI / Cloud CLI configured with deployment service-account credentials
- `git` and GitHub CLI (`gh`)

---

## 4. Step-by-Step Production Deployment Playbook

### Phase 1: Network & Cluster Foundation

1. **Provision Virtual Private Cloud (VPC)**:
   - Private subnets for databases, cache, and worker nodes.
   - Public subnets for Application Load Balancers and NAT Gateways.
   - Restrict incoming traffic on databases to Kubernetes worker node security groups.

2. **Create Kubernetes Namespaces**:
   ```bash
   kubectl create namespace cue-infra
   kubectl create namespace cue
   ```

3. **Deploy Ingress Controller & Cert-Manager**:
   ```bash
   # Install Ingress-NGINX or AWS Load Balancer Controller
   helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
   helm repo update
   helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
     --namespace ingress-nginx --create-namespace \
     --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"="nlb"

   # Install cert-manager for automatic TLS certificates
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml
   ```

4. **Configure Production ClusterIssuer (Let's Encrypt)**:
   ```yaml
   apiVersion: cert-manager.io/v1
   kind: ClusterIssuer
   metadata:
     name: letsencrypt-prod
   spec:
     acme:
       server: https://acme-v02.api.letsencrypt.org/directory
       email: devops@cue.local
       privateKeySecretRef:
         name: letsencrypt-prod-key
       solvers:
         - http01:
             ingress:
               class: nginx
   ```

---

### Phase 2: Database & Stateful Services Setup

1. **PostgreSQL Setup with PostGIS**:
   - Enable `postgis` extension on the database:
     ```sql
     CREATE EXTENSION IF NOT EXISTS postgis;
     CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
     ```
   - Configure connection pooling via PgBouncer (max connections: 150–200 pooled).
   - Set parameters: `shared_buffers = 1GB`, `work_mem = 16MB`, `maintenance_work_mem = 256MB`.

2. **Redis Setup**:
   - Enable AOF (Append-Only File) persistence or RDB snapshots.
   - Configure `maxmemory-policy volatile-lru` or `allkeys-lru`.
   - Set secure auth password with minimum 32 random alphanumeric characters.

3. **RabbitMQ Production Configuration**:
   - Configure user credentials, virtual host (`/`), and memory high watermark:
     ```bash
     rabbitmqctl add_user cue_admin <STRONG_PASSWORD>
     rabbitmqctl set_user_tags cue_admin administrator
     rabbitmqctl set_permissions -p / cue_admin ".*" ".*" ".*"
     ```

---

### Phase 3: Production Secrets Management

Store all secrets in Kubernetes `Secret` resources or inject via **AWS Secrets Manager / External Secrets Operator**:

```bash
kubectl create secret generic cue-services-secrets \
  --namespace cue \
  --from-literal=JWT_SIGNING_KEY="<MIN_32_CHAR_PRODUCTION_SECRET>" \
  --from-literal=JWT_ACCESS_TOKEN_MINUTES="15" \
  --from-literal=JWT_REFRESH_TOKEN_DAYS="7" \
  --from-literal=AUTH_DB_CONNECTION="Host=<DB_HOST>;Port=5432;Database=cue_auth;Username=cue_user;Password=<DB_PASSWORD>;SSL Mode=Require;" \
  --from-literal=USER_DB_CONNECTION="Host=<DB_HOST>;Port=5432;Database=cue_user;Username=cue_user;Password=<DB_PASSWORD>;SSL Mode=Require;" \
  --from-literal=BOOKING_DB_CONNECTION="Host=<DB_HOST>;Port=5432;Database=cue_booking;Username=cue_user;Password=<DB_PASSWORD>;SSL Mode=Require;" \
  --from-literal=PAYMENT_DB_CONNECTION="Host=<DB_HOST>;Port=5432;Database=cue_payment;Username=cue_user;Password=<DB_PASSWORD>;SSL Mode=Require;" \
  --from-literal=REDIS_CONNECTION_STRING="<REDIS_HOST>:6379,password=<REDIS_PASSWORD>,ssl=true" \
  --from-literal=RABBITMQ_CONNECTION_STRING="amqps://cue_admin:<RABBITMQ_PASSWORD>@<RABBITMQ_HOST>:5671/" \
  --from-literal=RAZORPAY_KEY_ID="rzp_live_<KEY_ID>" \
  --from-literal=RAZORPAY_KEY_SECRET="<RAZORPAY_SECRET>" \
  --from-literal=RAZORPAY_WEBHOOK_SECRET="<WEBHOOK_SIGNING_SECRET>" \
  --from-literal=SMS_API_KEY="<GUPSHUP_OR_TWILIO_KEY>" \
  --from-literal=EMAIL_API_KEY="<SENDGRID_OR_AWS_SES_KEY>" \
  --from-literal=S3_ACCESS_KEY="<OBJECT_STORAGE_ACCESS_KEY>" \
  --from-literal=S3_SECRET_KEY="<OBJECT_STORAGE_SECRET_KEY>" \
  --from-literal=S3_BUCKET="cue-production-media"
```

> [!CAUTION]
> Never commit raw production credentials, connection strings, or JWT keys into source control. Always verify `.gitignore` excludes `.env` and credential files.

---

### Phase 4: Database Migrations & Validation

Execute Entity Framework Core migrations per service before deploying new container versions:

```bash
# Example: Run migration for BookingService
dotnet ef database update \
  --project backend/Services/BookingService/BookingService.Infrastructure \
  --startup-project backend/Services/BookingService/BookingService.Api \
  --connection "$BOOKING_DB_CONNECTION"
```

Or deploy an automated Kubernetes `Job` with the service migration bundle as an initial Helm pre-upgrade hook.

---

### Phase 5: Container Build & Service Deployment

1. **Build and Tag Multi-Stage Docker Images**:
   ```bash
   TAG=$(git rev-parse --short HEAD)
   REGISTRY="<YOUR_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com"

   # Build services
   docker build -t $REGISTRY/cue/auth-service:$TAG -f backend/Services/AuthService/Dockerfile backend
   docker build -t $REGISTRY/cue/booking-service:$TAG -f backend/Services/BookingService/Dockerfile backend
   docker build -t $REGISTRY/cue/api-gateway:$TAG -f backend/Services/ApiGateway/Dockerfile backend
   docker build -t $REGISTRY/cue/frontend:$TAG -f frontend/Dockerfile frontend

   # Push to Container Registry
   docker push $REGISTRY/cue/auth-service:$TAG
   docker push $REGISTRY/cue/booking-service:$TAG
   docker push $REGISTRY/cue/api-gateway:$TAG
   docker push $REGISTRY/cue/frontend:$TAG
   ```

2. **Deploy via Production Helm Values**:
   Create `helm-chart-services/values-production.yaml` with:
   - Specific immutable image tags (`$TAG` rather than `latest`)
   - Replicas: Minimum 2 replicas per critical service (`auth-service`, `booking-service`, `payment-service`, `api-gateway`)
   - Resource requests: `memory: 256Mi, cpu: 200m`
   - Resource limits: `memory: 512Mi, cpu: 500m`
   - Horizontal Pod Autoscaler (HPA) enabled (target CPU: 70%, memory: 80%)

   Deploy command:
   ```bash
   helm upgrade --install cue-services ./helm-chart-services \
     --namespace cue \
     --values ./helm-chart-services/values-production.yaml \
     --set global.imageRegistry="$REGISTRY" \
     --set backend.imageTag="$TAG" \
     --set frontend.imageTag="$TAG"
   ```

3. **Monitor Rolling Update Status**:
   ```bash
   kubectl rollout status deployment/cue-services-api-gateway -n cue --timeout=120s
   kubectl rollout status deployment/cue-services-booking-service -n cue --timeout=120s
   kubectl get pods -n cue
   ```

---

### Phase 6: Edge, CDN, DNS & Ingress Routing

1. **Configure Ingress Manifest**:
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: cue-production-ingress
     namespace: cue
     annotations:
       cert-manager.io/cluster-issuer: letsencrypt-prod
       nginx.ingress.kubernetes.io/proxy-body-size: "20m"
       nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
       nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
       nginx.ingress.kubernetes.io/websocket-services: "cue-services-chat-service"
   spec:
     ingressClassName: nginx
     tls:
       - hosts:
           - api.cue.co.in
           - app.cue.co.in
         secretName: cue-tls-certificate
     rules:
       - host: api.cue.co.in
         http:
           paths:
             - path: /
               pathType: Prefix
               backend:
                 service:
                   name: cue-services-api-gateway
                   port:
                     number: 8080
       - host: app.cue.co.in
         http:
           paths:
             - path: /
               pathType: Prefix
               backend:
                 service:
                   name: cue-services-frontend
                   port:
                     number: 3000
   ```

2. **Cloudflare Edge Configuration**:
   - Set SSL mode to **Full (Strict)**.
   - Enable **WebSockets** support (for SignalR in `chat-service`).
   - Enable Brotli and HTTP/3.
   - Configure WAF rate limits: Max 60 requests/minute on `/api/auth/login` and `/api/auth/register`.

---

### Phase 7: Post-Deployment Smoke Test & Verification

Run automated verification against the deployed endpoints:

```bash
# 1. Check API Gateway health probe
curl -f https://api.cue.co.in/health || exit 1

# 2. Check Auth Service health & public signing keys
curl -f https://api.cue.co.in/api/auth/health || exit 1

# 3. Verify Discovery Geo-search (Koramangala, Bengaluru coordinates)
curl -X GET "https://api.cue.co.in/api/discovery/companions?latitude=12.9352&longitude=77.6245&radiusKm=10" \
  -H "Accept: application/json"

# 4. Verify Frontend HTTP status and security headers
curl -I https://app.cue.co.in
```

---

## 5. Observability, Logging & Alerting

### 1. Metrics & APM (Prometheus + Grafana)
- **Golden Signals Tracked**:
  - Request Latency (P50, P95, P99)
  - Traffic Rate (Requests per second per service)
  - Error Rate (HTTP 5xx responses)
  - Saturation (CPU, RAM, DB connection pool depth)

### 2. Distributed Tracing (OpenTelemetry + Jaeger)
- Trace IDs propagated across API Gateway $\rightarrow$ Microservices $\rightarrow$ RabbitMQ $\rightarrow$ Database.
- Pinpoint database query execution times and external payment gateway round-trips.

### 3. Critical Production Alerts (Slack / PagerDuty)
| Alert Rule | Condition | Severity | Action |
| :--- | :--- | :--- | :--- |
| **HighErrorRate** | HTTP 5xx > 2% for 3 mins | Critical | On-call paging, inspect gateway logs |
| **EscrowPaymentFailed** | Payment webhook failure count > 0 | Critical | Immediate finance/payment service triage |
| **PostgresConnectionPoolSaturated** | Active connections > 85% of pool | Warning | Scale PgBouncer, check for query leaks |
| **DatabaseDiskSpaceLow** | Remaining disk < 15% | High | Auto-expand volume / prune old logs |
| **PodCrashLoopBackOff** | Restarts > 3 in 10 minutes | High | Pod rollback and log analysis |

---

## 6. Disaster Recovery & Backup Runbook

### Backup Schedule
- **Relational Data (PostgreSQL)**:
  - Full automated snapshot every 24 hours at 03:00 IST.
  - WAL (Write-Ahead Logging) continuous archiving to S3 bucket every 5 minutes (enables Point-In-Time Recovery with `RPO < 5 mins`).
- **Object Storage (KYC & Photos)**:
  - S3 Cross-Region Replication (CRR) or R2 automated versioning.

### Database Recovery Procedure
In case of catastrophic failure or data corruption:
1. Locate latest verified snapshot:
   ```powershell
   # Using automated backup script
   .\scripts\restore-db.ps1 -BackupFile "backups/cue_db_20261030_0300.sql"
   ```
2. For cloud managed databases (AWS RDS / Aurora):
   ```bash
   aws rds restore-db-instance-to-point-in-time \
     --source-db-instance-identifier cue-prod-db \
     --target-db-instance-identifier cue-prod-db-restored \
     --restore-time "2026-10-30T02:00:00Z"
   ```
3. Update database connection secret in Kubernetes and perform rolling restart of all services.

---

## 7. Cost & Budget Ledger (INR ₹ & USD $)

| Item | Monthly (Launch Phase) | Monthly (Growth Phase) | Notes |
| :--- | :--- | :--- | :--- |
| **Kubernetes Compute** | `₹6,200 – ₹13,800` | `₹36,000 – ₹50,000` | 3 nodes $\rightarrow$ 6 auto-scaled nodes |
| **PostgreSQL + PostGIS** | `₹3,400 – ₹7,700` | `₹27,500 – ₹41,000` | Single managed $\rightarrow$ Multi-AZ Aurora |
| **Redis Cache** | `₹1,300 – ₹3,000` | `₹11,000 – ₹16,500` | Standalone HA $\rightarrow$ Multi-shard cluster |
| **Message Broker (RabbitMQ)** | `₹0 – ₹3,900` | `₹13,800 – ₹19,000` | In-cluster pod $\rightarrow$ Amazon MQ cluster |
| **Media Storage (R2 / S3)** | `₹430 – ₹1,300` | `₹5,200 – ₹9,500` | Zero egress on R2 |
| **Edge CDN & WAF (Cloudflare)** | `₹1,700 – ₹2,150` | `₹5,000 – ₹10,000` | Pro tier $\rightarrow$ Business / Advanced WAF |
| **SMS / WhatsApp / Email APIs** | `₹3,000 – ₹8,000` | `₹15,000 – ₹25,000` | OTPs, check-in PIN alerts, notifications |
| **Total Estimated Run-Rate** | **`₹16,000 – ₹39,850` / mo** | **`₹1,34,000 – ₹1,91,000` / mo** | Excluding payment transaction fees (2%) |

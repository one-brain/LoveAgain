# Low-Cost Infrastructure Deployment Guide (Cue / LoveAgain)

This guide documents how to run the full Cue microservice stack (12 .NET 10 microservices, PostgreSQL with PostGIS, RabbitMQ, Redis, React Vite SPA frontend, and Flutter mobile endpoints) on low-cost infrastructure for **$10 – $25/month total**, compared to **$300 – $600/month** on standard managed AWS/GCP/Azure Kubernetes clusters.

---

## 1. Cost Comparison

| Component | Standard Cloud Approach (~$400+/mo) | Low-Cost Single VPS Strategy (~$15–$25/mo) |
| :--- | :--- | :--- |
| **Cluster / Host** | EKS/GKE Control Plane ($73/mo) + 2–3 Nodes ($180/mo) | 1x Hetzner Cloud CPX31 (4 vCPU, 8 GB RAM, ~€13.50/mo) or DigitalOcean Droplet ($24/mo) |
| **NAT Gateway** | AWS NAT Gateway ($32/mo + $0.045/GB data fees) | **$0** (Direct IPv4/IPv6 egress via VPS network adapter) |
| **Load Balancer** | AWS ALB / GCP HTTPS Load Balancer ($22/mo) | **$0** (Nginx / Caddy container + Cloudflare Free SSL / WAF) |
| **Database** | AWS RDS PostgreSQL with PostGIS ($45–$120/mo) | Docker PostgreSQL PostGIS container on local NVMe or Supabase/Neon Free/Starter tier |
| **Cache & Queue** | ElastiCache ($25/mo) + CloudAMQP ($30/mo) | Docker Redis (capped at 96MB) + Docker RabbitMQ (memory watermark 0.4) |
| **Frontend CDN** | S3 + CloudFront ($10–$25/mo egress) | **$0** (Cloudflare Pages or self-hosted Nginx container) |
| **Total Cost** | **$395 – $650 / month** | **$15 – $25 / month** |

---

## 2. Key Code & Runtime Optimizations Applied

### A. Workstation GC + DATAS (`Directory.Build.props`)
Default .NET runtime inside containers uses **Server GC**, which allocates memory segments based on host CPU cores (often 200–400MB idle per microservice).
* Root [`Directory.Build.props`](../Directory.Build.props) forces:
  * `<ServerGarbageCollection>false</ServerGarbageCollection>` (Workstation GC).
  * `<GCDynamicAdaptationMode>1</GCDynamicAdaptationMode>` (.NET Dynamic Adaptation To Application Sizes - DATAS).
  * `<ConcurrentGarbageCollection>true</ConcurrentGarbageCollection>`.
* **Result**: Idle memory drops from ~250MB to **~40–60MB per microservice**, allowing all 12 services to sit comfortably in ~600MB–800MB aggregate memory.

### B. Container Runtime Environment Variables
All backend Dockerfiles (`backend/Services/*/Dockerfile`) configure:
```dockerfile
ENV ASPNETCORE_URLS=http://+:8080 \
    DOTNET_gcServer=0 \
    DOTNET_gcConcurrent=1 \
    DOTNET_GCDynamicAdaptationMode=1 \
    DOTNET_EnableDiagnostics=0
```

---

## 3. Option A: Single-Node VPS with Docker Compose (Recommended)

This requires only Docker and Docker Compose installed on any Ubuntu/Debian VPS.

### Quick Start
1. **Clone repository on VPS**:
   ```bash
   git clone <repo-url> /opt/cue
   cd /opt/cue
   ```
2. **Setup environment variables**:
   ```bash
   cp .env.lowcost.example .env.lowcost
   nano .env.lowcost # Edit POSTGRES_PASSWORD, REDIS_PASSWORD, RABBITMQ_PASSWORD, and JWT_SIGNING_KEY
   ```
3. **Launch the stack**:
   ```bash
   docker compose -f docker-compose.lowcost.yml --env-file .env.lowcost up -d --build
   ```
4. **Check container memory and health**:
   ```bash
   docker stats --no-stream
   ```

### Reverse Proxy & SSL (Cloudflare + Nginx / Caddy)
Point your DNS records (A record) on **Cloudflare** to your VPS IP:
* `app.yourdomain.com` -> Points to VPS port `80` (Frontend Nginx container).
* In Cloudflare Dashboard, set SSL/TLS encryption mode to **Full** or **Full (Strict)**.
* Cloudflare provides free automated SSL, DDoS mitigation, and global edge CDN caching.

---

## 4. Option B: Single-Node K3s / Lightweight Kubernetes

If you prefer Kubernetes deployment without paying $73/mo for managed control planes, install [K3s](https://k3s.io) on a single VPS:

```bash
# 1. Install K3s (takes ~30 seconds)
curl -sfL https://get.k3s.io | sh -

# 2. Deploy Low-Cost Infrastructure Chart (Postgres, RabbitMQ, Redis with low memory requests)
helm install cue-infra ./helm-chart-infrastructure -f ./helm-chart-infrastructure/values-lowcost.yaml -n cue --create-namespace

# 3. Deploy Low-Cost Microservices Chart
helm install cue-services ./helm-chart-services -f ./helm-chart-services/values-lowcost.yaml -n cue --create-namespace
```

### What `values-lowcost.yaml` changes:
* Memory requests per microservice lowered to **48Mi** (limits to **128Mi**).
* CPU requests lowered to **20m** (limits to **250m**).
* PgAdmin disabled (`replicaCount: 0`).
* Jaeger tracing pod disabled (`replicaCount: 0`) to prevent Prometheus/Jaeger from consuming 1GB+ memory.

---

## 5. Maintenance & Disk Space Safeguards
* **Log Rotation**: In [`docker-compose.lowcost.yml`](../docker-compose.lowcost.yml), logging is restricted to `json-file` with `max-size: 10m` and `max-file: 3` so application logs never exhaust disk space.
* **Database Backups**: Use the existing automated backup scripts in [`scripts/backup-db.ps1`](../scripts/backup-db.ps1) with a cron or scheduled job to push nightly `.sql.gz` dumps to **Cloudflare R2** (10 GB free tier, zero egress fees).

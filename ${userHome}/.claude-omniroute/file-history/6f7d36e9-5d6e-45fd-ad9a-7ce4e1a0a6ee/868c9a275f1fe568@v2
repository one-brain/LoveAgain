# Cue Platform - Separated Helm Charts

This repository contains two separate Helm charts for deploying the Cue platform:

## 1. Infrastructure Chart (`helm-chart-infrastructure`)

**Purpose**: Deploys stable infrastructure components that don't need frequent updates.

**Components**:
- **PostgreSQL** (postgis/postgis) - Database with persistence
- **RabbitMQ** (rabbitmq:3-management) - Message queue with management UI
- **Redis** (redis:7-alpine) - Cache
- **PgAdmin** (dpage/pgadmin4) - Database administration UI

**When to deploy**: 
- Initial cluster setup
- Infrastructure version upgrades (rare)
- Disaster recovery

**Deployment**:
```bash
# Install infrastructure
helm install cue-infra ./helm-chart-infrastructure -f ./helm-chart-infrastructure/values-local.yaml -n cue --create-namespace

# Upgrade infrastructure (rare)
helm upgrade cue-infra ./helm-chart-infrastructure -f ./helm-chart-infrastructure/values-local.yaml -n cue
```

**Access**:
- PostgreSQL: `cue-infra-cue-infrastructure-postgres:5432`
- RabbitMQ: `cue-infra-cue-infrastructure-rabbitmq:5672` (AMQP), `:15672` (Management UI)
- Redis: `cue-infra-cue-infrastructure-redis:6379`
- PgAdmin: NodePort 30001 (http://localhost:30001)

---

## 2. Services Chart (`helm-chart-services`)

**Purpose**: Deploys microservices and frontend that are under active development and need frequent deployments.

**Components**:
- **12 Backend Microservices**: auth-service, user-service, profile-service, discovery-service, booking-service, payment-service, chat-service, notification-service, review-service, support-service, analytics-service, api-gateway
- **Frontend** (React/Next.js)
- **Jaeger** (Distributed tracing)

**When to deploy**:
- Every code change (CI/CD pipeline)
- Feature deployments
- Bug fixes
- Canary/blue-green deployments

**Deployment**:
```bash
# Install services (assumes infrastructure already deployed)
helm install cue-services ./helm-chart-services -f ./helm-chart-services/values-local.yaml -n cue --create-namespace

# Upgrade specific service (via image tag)
helm upgrade cue-services ./helm-chart-services -f ./helm-chart-services/values-local.yaml \
  --set backendServices[0].imageTag=v1.2.3 \
  -n cue

# Upgrade all services with new image tag
helm upgrade cue-services ./helm-chart-services -f ./helm-chart-services/values-local.yaml \
  --set backend.imageTag=v1.2.3 \
  -n cue

# Deploy only frontend
helm upgrade cue-services ./helm-chart-services -f ./helm-chart-services/values-local.yaml \
  --set frontend.imageTag=v1.2.3 \
  -n cue
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Kubernetes Cluster                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┐  ┌────────────────────────┐   │
│  │  cue-infra (namespace)   │  │  cue-services (ns)     │   │
│  │  ┌────────────────────┐  │  │  ┌──────────────────┐  │   │
│  │  │ PostgreSQL         │  │  │  │ auth-service     │  │   │
│  │  │ RabbitMQ           │  │  │  │ user-service     │  │   │
│  │  │ Redis              │  │  │  │ profile-service  │  │   │
│  │  │ PgAdmin            │  │  │  │ ... (12 total)   │  │   │
│  │  └────────────────────┘  │  │  │ frontend         │  │   │
│  │         ▲                │  │  │ Jaeger           │  │   │
│  │         │ DNS            │  │  └──────────────────┘  │   │
│  │         │                │  │         ▲              │   │
│  └─────────┼────────────────┘  └─────────┼──────────────┘   │
│            │                              │                  │
│            │   Service Discovery          │                  │
│            │   (ClusterIP Services)       │                  │
│            └──────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Service Discovery

Services in `cue-services` namespace connect to infrastructure via Kubernetes DNS:

| Infrastructure | DNS Name | Port |
|----------------|----------|------|
| PostgreSQL | `cue-infra-cue-infrastructure-postgres.cue-infra.svc.cluster.local` | 5432 |
| RabbitMQ | `cue-infra-cue-infrastructure-rabbitmq.cue-infra.svc.cluster.local` | 5672 |
| RabbitMQ Management | `cue-infra-cue-infrastructure-rabbitmq.cue-infra.svc.cluster.local` | 15672 |
| Redis | `cue-infra-cue-infrastructure-redis.cue-infra.svc.cluster.local` | 6379 |

> **Note**: The `values-local.yaml` in services chart uses short names (e.g., `cue-cue-infrastructure-postgres`) assuming both charts deployed to same namespace. For cross-namespace, use FQDN format above.

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/deploy-infrastructure.yml
name: Deploy Infrastructure
on:
  workflow_dispatch:
  push:
    paths:
      - 'helm-chart-infrastructure/**'
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: azure/k8s-set-context@v1
        with:
          kubeconfig: ${{ secrets.KUBECONFIG }}
      - run: helm upgrade --install cue-infra ./helm-chart-infrastructure -f ./helm-chart-infrastructure/values.yaml -n cue-infra --create-namespace
```

```yaml
# .github/workflows/deploy-services.yml
name: Deploy Services
on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - 'frontend/**'
      - 'helm-chart-services/**'
      - '!helm-chart-infrastructure/**'
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: azure/k8s-set-context@v1
        with:
          kubeconfig: ${{ secrets.KUBECONFIG }}
      - run: |
          IMAGE_TAG=${{ github.sha }}
          helm upgrade --install cue-services ./helm-chart-services \
            -f ./helm-chart-services/values.yaml \
            --set backend.imageTag=$IMAGE_TAG \
            --set frontend.imageTag=$IMAGE_TAG \
            -n cue --create-namespace
```

---

## Benefits of Separation

| Aspect | Before (Single Chart) | After (Separated) |
|--------|----------------------|-------------------|
| **Infrastructure updates** | Risk of restarting services | Independent, safe upgrades |
| **Service deployments** | Full chart reinstall | Fast, targeted deployments |
| **Rollback** | Everything rolls back | Rollback only services |
| **CI/CD** | Single pipeline | Separate pipelines, different triggers |
| **Team ownership** | Shared | Infra team owns infra, App team owns services |
| **Testing** | Full stack test | Unit test services, integration test infra |

---

## Migration from Single Chart

If migrating from the original `helm-chart`:

1. Deploy infrastructure first:
   ```bash
   helm install cue-infra ./helm-chart-infrastructure -f ./helm-chart-infrastructure/values-local.yaml -n cue --create-namespace
   ```

2. Verify infrastructure is healthy:
   ```bash
   kubectl get pods -n cue -l app.kubernetes.io/instance=cue-infra
   ```

3. Deploy services:
   ```bash
   helm install cue-services ./helm-chart-services -f ./helm-chart-services/values-local.yaml -n cue --create-namespace
   ```

4. Verify services connect to infrastructure:
   ```bash
   kubectl logs -n cue deployment/cue-services-auth-service
   ```

5. Delete old chart:
   ```bash
   helm uninstall cue -n cue
   ```
# Cue Platform - Setup Guide

## Prerequisites

### Required Software

- **.NET SDK 8.0** or later ([download](https://dotnet.microsoft.com/download))
- **Docker Desktop** ([download](https://www.docker.com/products/docker-desktop))
- **kind** (Kubernetes IN Docker) - [installation guide](https://kind.sigs.k8s.io/docs/user/quick-start/)
- **kubectl** (Kubernetes command-line tool) - [installation guide](https://kubernetes.io/docs/tasks/tools/)
- **Git** ([download](https://git-scm.com/))
- **VS Code** or **Visual Studio 2022** ([download](https://visualstudio.microsoft.com/))
- **Node.js 18+** (for frontend development)
- **PowerShell 7+** (for the provided scripts) - [download](https://github.com/PowerShell/PowerShell)

### System Requirements

- **RAM:** Minimum 8GB (16GB recommended)
- **Disk Space:** 20GB free space
- **OS:** Windows, macOS, or Linux

---

## Local Development Setup (Kind Kubernetes)

The recommended way to run the entire Cue platform locally is using Kind (Kubernetes IN Docker). This approach provides a production-like environment with all services orchestrated by Kubernetes.

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cue-platform.git
cd LoveAgain
```

### 2. Create a Kind Cluster and Local Registry

The provided script will create a local Kind cluster and a Docker registry for fast image iteration.

```powershell
.\scripts\kind-create.ps1
```

This script:
- Creates a local registry container (kind-registry:5000) if it doesn't exist
- Creates a Kind cluster named `loveagain-kind` with the registry configured as a mirror
- Connects the registry to the Kind network
- Sets up port forwarding (container port 80 → host port 8080) for accessibility

### 3. Build and Load Docker Images into Kind

Build all service Docker images and load them into the Kind nodes.

```powershell
.\scripts\build-and-load.ps1
```

This script:
- Discovers all services with Dockerfiles under `backend\Services\` and `frontend\`
- Builds Docker images for each service
- Loads them into the Kind cluster using `kind load docker-image`
- Images are tagged as `localhost:5000/loveagain-<service>:local`

### 4. Deploy the Kubernetes Manifests

Deploy the development overlay which includes all backend services, infrastructure, and the frontend.

```powershell
kubectl apply -k infra/k8s/overlays/dev
```

### 5. Access the Application

#### Option A - Port-forward Ingress Controller (Recommended)
```powershell
kubectl -n ingress-nginx port-forward svc/ingress-nginx-controller 8080:80
```
Then visit `http://localhost:8080`

#### Option B - Direct Frontend Port-forward
```powershell
kubectl port-forward svc/web-frontend 8081:80
```
Then visit `http://localhost:8081`

#### Option C - Use Convenience Script
```powershell
.\scripts\port-forward-ingress.ps1
```

### 6. Verify Deployment

```powershell
# Check all pods in the default namespace
kubectl get pods

# Check services
kubectl get svc

# Check deployments
kubectl get deployments
```

### 7. Development Login

The Development environment seeds one idempotent demo account:

| Username | Password |
| -------- | -------- |
| `demo@cue.local` | `CueDemo123!` |

Use this account only for local development. Replace it with a real account flow and secret management before deploying beyond development.

---

## Environment Configuration

Environment variables for services are configured via Kubernetes manifests in `infra/k8s/overlays/dev/`. To customize:

1. Edit the relevant YAML files in the overlays/dev directory (e.g., `backend-services.yaml` for backend service environment variables)
2. Or create a custom overlay by copying the dev overlay and modifying it
3. Then deploy using `kubectl apply -k <path-to-your-overlay>`

Note: Secrets should be managed using Kubernetes Secrets and not committed to version control.

---

## Development Workflow

1. **Create feature branch:** `git checkout -b feature/my-feature`
2. **Make changes** and write tests
3. **Run tests locally:** `dotnet test`
4. **Push branch:** `git push origin feature/my-feature`
5. **Create Pull Request** with description
6. **CI/CD pipeline runs** automatically
7. **Merge after approval**

---

## Building for Production

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed production deployment instructions.

---

## Additional Resources

- [API Documentation](API_CONTRACTS.md)
- [Database Schema](DATABASE_SCHEMA.md)
- [Architecture Overview](ARCHITECTURE.md)
- [Local Deployment Guide (Kind)](DEPLOYMENT_LOCAL.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
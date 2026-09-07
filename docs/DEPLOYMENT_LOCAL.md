Local deployment guide (kind + local registry)

This guide explains how to create a local Kubernetes cluster using kind, build the repository images, load them into the cluster, and deploy the included Kubernetes manifests for development/e2e testing.

Prerequisites
- Docker Desktop (or equivalent) running and accessible via the docker CLI
- kind (https://kind.sigs.k8s.io/)
- kubectl configured in PATH
- (Optional) helm if you plan to use Helm charts

Quick start (recommended)
1. Create a kind cluster and local registry
   Open PowerShell at the repository root and run:
     .\scripts\kind-create.ps1
   This will create a cluster named 'loveagain-kind' (default) and a local registry at localhost:5000.

2. Build images and load them into kind
   Build all services with Dockerfiles and load them into kind:
     .\scripts\build-and-load.ps1
   The script discovers Dockerfiles under backend\Services and frontend and builds images named like:
     localhost:5000/loveagain-userservice:local
   and loads them into the kind nodes.

3. Deploy Kubernetes manifests (dev overlay) or Helm chart
   Option A - Use existing k8s overlays (quick):
     kubectl apply -k infra/k8s/overlays/dev

   Option B - Use the umbrella Helm chart (recommended for templating):
     helm install loveagain infra/k8s/helm-chart -f infra/k8s/helm-chart/values.yaml
     OR (upgrade if already installed):
     helm upgrade --install loveagain infra/k8s/helm-chart -f infra/k8s/helm-chart/values.yaml

   Note: There is a PowerShell helper at infra/k8s/overlays/dev/deploy-limited.ps1 that may automate limited deployments.

4. Install ingress (optional)
   If you plan to use Ingress, install ingress-nginx with the helper:
     .\scripts\install-ingress.ps1

5. Expose and test
   - To expose the app via the ingress controller on localhost, forward the ingress controller to a local port:
       kubectl -n ingress-nginx port-forward svc/ingress-nginx-controller 8080:80
     or use the convenience script:
       .\scripts\port-forward-ingress.ps1

     Optionally, dev-up.ps1 can start the port-forward in a new PowerShell window when run with the -AutoPortForward flag:
       .\scripts\dev-up.ps1 -AutoPortForward

   - Alternatively, port-forward the frontend service directly:
       kubectl port-forward svc/web-frontend 8081:80

   - If you used the default kind config, host port 8080 is forwarded to container port 80 for the control-plane node.
   - Check pods and services:
       kubectl get pods -A
       kubectl get svc -n default

   - For Ingress: the dev overlay includes ingress.yaml — install ingress-nginx if not present:
       helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
       helm install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace

   - Access the app using the forwarded port or port-forwarding:
       kubectl port-forward svc/<service-name> 8081:80

What this setup provides
- Local registry for fast iteration
- Scripts to build and load images into kind
- Existing k8s manifests and overlays (infra/k8s) reused by this workflow

Notes and troubleshooting
- If kind cannot reach the local registry, ensure the registry container is connected to the kind network (scripts/kind-create.ps1 attempts to connect it).
- For stateful services (Postgres), dev overlay uses hostPath or minimal PVCs. Data will be ephemeral unless you configure persistent storage.
- If a service requires cloud-managed features (S3, SES, etc) configure local emulators or point to test accounts.

Next steps (non-blocking)
- Create a Helm umbrella chart at k8s/helm-chart to templatize deployments and make per-environment overrides easier.
- Add health-check smoke tests (scripts/tests) that run after deployment to validate readiness and DB connectivity.
- Optionally add Makefile or cross-platform scripts for convenience.

Reference files added
- scripts\kind-create.ps1 — creates kind cluster + local registry
- scripts\build-and-load.ps1 — builds Docker images and loads them into kind


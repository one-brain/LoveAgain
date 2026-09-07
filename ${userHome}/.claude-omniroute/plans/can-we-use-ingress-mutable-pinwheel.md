# Plan: Implement Ingress for Frontend and API Gateway

## Context
The user wants to expose the frontend via Ingress and have it reverse proxy to the API Gateway, which then routes traffic to backend services (already implemented via Ocelot).

Currently:
- Frontend is deployed as a Deployment + Service (ClusterIP on port 3000)
- API Gateway is deployed as a Deployment + Service (ClusterIP on port 8080)
- Backend services are deployed as Deployments + Services (ClusterIP on port 8080)
- Ingress is configured in `values.yaml` but no Ingress template exists

## Architecture
```
External Traffic → Ingress (nginx) → / → Frontend (port 3000)
                                    → /api/* → API Gateway (port 8080) → Backend Services (Ocelot routes)
```

## Implementation Plan

### 1. Create Ingress Template (`helm-chart/templates/ingress.yaml`)
Create a new Ingress resource that:
- Routes `/` path to `{{ include "cue.fullname" . }}-frontend-service` on port 3000
- Routes `/api` path to `api-gateway` on port 8080
- Uses configurable annotations, className, and TLS from `values.yaml`
- Supports multiple hosts from `values.yaml`

### 2. Update Frontend to Proxy API Calls
The frontend (served by `serve`) needs to proxy `/api` calls to the API Gateway. Options:
- **Option A**: Configure nginx as a sidecar in the frontend pod (more complex)
- **Option B**: Use Ingress path-based routing (simpler, recommended)

Since the Ingress handles path-based routing, the frontend just needs to make API calls to `/api/...` and the Ingress will route them to the API Gateway.

### 3. Update API Gateway Ocelot Configuration
The Ocelot config uses upstream paths like `/api/v1/auth/{everything}` and `/api/auth/{everything}`. The Ingress should strip the `/api` prefix or the Ocelot config needs to match. Currently Ocelot expects both `/api/v1/...` and `/api/...` paths, which matches what the Ingress will forward.

### 4. Update Values Files
- Ensure `values.yaml` and `values-local.yaml` have appropriate Ingress configuration (host, TLS, annotations)
- For local development, add a host like `cue.local` and configure `/etc/hosts`

## Files to Modify/Create

1. **Create**: `helm-chart/templates/ingress.yaml` - New Ingress template
2. **Review**: `helm-chart/values.yaml` - Ensure Ingress config is appropriate
3. **Review**: `helm-chart/values-local.yaml` - Add local Ingress config (host, TLS if needed)

## Ingress Template Design

```yaml
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "cue.fullname" . }}-ingress
  labels:
    {{- include "cue.labels" . | nindent 4 }}
  {{- with .Values.ingress.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  {{- if .Values.ingress.className }}
  ingressClassName: {{ .Values.ingress.className }}
  {{- end }}
  {{- if .Values.ingress.tls }}
  tls:
    {{- toYaml .Values.ingress.tls | nindent 4 }}
  {{- end }}
  rules:
    {{- range .Values.ingress.hosts }}
    - host: {{ .host | quote }}
      http:
        paths:
          {{- range .paths }}
          - path: {{ .path }}
            pathType: {{ .pathType }}
            backend:
              service:
                name: {{ include "cue.fullname" $ }}-frontend-service
                port:
                  number: 3000
          {{- end }}
    {{- end }}
{{- end }}
```

## Verification Steps

1. Deploy with `helm upgrade cue ./helm-chart -n cue-platform -f ./helm-chart/values-local.yaml --create-namespace`
2. Check Ingress is created: `kubectl get ingress -n cue-platform`
3. Verify frontend accessible at configured host
4. Verify API calls to `/api/...` reach API Gateway
5. Test end-to-end: frontend → API Gateway → backend services

## User Answers

1. **Hostname**: `cue.local` (requires `/etc/hosts` entry)
2. **Ingress Controller**: nginx-ingress
3. **TLS**: No, HTTP only for local development
4. **API Calls**: Frontend will use relative paths `/api/...`

## Final Implementation Plan

### 1. Create Ingress Template (`helm-chart/templates/ingress.yaml`)
Create a new Ingress resource that routes:
- `/` → Frontend service (port 3000)
- `/api` → API Gateway service (port 8080)

### 2. Update `values-local.yaml` with Ingress Configuration
Add local ingress config with host `cue.local`

### 3. Verify Frontend Makes API Calls to `/api/...`
Check if frontend code uses relative paths for API calls
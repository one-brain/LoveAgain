{{- /* Backend service template */ -}}
{{- define "cue._backend-service.tpl" -}}
---
apiVersion: v1
kind: Service
metadata:
  name: {{ .svc.name }}
  namespace: {{ .root.Release.Namespace }}
  labels:
    {{- include "cue.labels" .root | nindent 4 }}
spec:
  type: ClusterIP
  ports:
    - port: {{ .svc.port }}
      targetPort: {{ .svc.port }}
      protocol: TCP
  selector:
    {{- include "cue.selectorLabels" .root | nindent 4 }}
{{- end }}
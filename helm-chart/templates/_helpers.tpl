{{- /*
Common template functions
*/ -}}

{{- define "cue.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end }}

{{- define "cue.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "cue.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "cue.image" -}}
{{- /* Build image reference: <repository>:<tag> */ -}}
{{- $repo := .Values.image.repository | default .Chart.Name -}}
{{- $tag := .Values.image.tag | default "latest" -}}
{{- printf "%s:%s" $repo $tag -}}
{{- end }}
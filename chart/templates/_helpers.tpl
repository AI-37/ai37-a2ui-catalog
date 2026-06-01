{{- define "a2ui-catalog.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "a2ui-catalog.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name (include "a2ui-catalog.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "a2ui-catalog.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "a2ui-catalog.labels" -}}
helm.sh/chart: {{ include "a2ui-catalog.chart" . }}
app.kubernetes.io/name: {{ include "a2ui-catalog.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "a2ui-catalog.selectorLabels" -}}
app.kubernetes.io/name: {{ include "a2ui-catalog.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "a2ui-catalog.image" -}}
{{- $repository := .Values.image.repository -}}
{{- if .Values.global.imageRepositoryPrefix -}}
{{- $repository = printf "%s/%s" .Values.global.imageRepositoryPrefix .Values.image.repository -}}
{{- end -}}
{{- $tag := .Values.image.tag | default .Values.global.imageTag | default .Chart.AppVersion -}}
{{- printf "%s:%s" $repository $tag -}}
{{- end -}}

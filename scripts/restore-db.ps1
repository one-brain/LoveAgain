# Database Restore Script for Cue (PostgreSQL in Kubernetes)
param (
    [Parameter(Mandatory = $true)]
    [string]$BackupFile,
    [string]$Namespace = "cue"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupFile)) {
    throw "Backup file not found at: $BackupFile"
}

Write-Host "Finding PostgreSQL pod in namespace '$Namespace'..." -ForegroundColor Cyan
$pgPod = (kubectl get pods -n $Namespace --no-headers -o custom-columns=":metadata.name" | Select-String "postgres").ToString().Trim()

if (-not $pgPod) {
    throw "PostgreSQL pod not found in namespace '$Namespace'."
}

Write-Host "Restoring database from '$BackupFile' into '$pgPod'..." -ForegroundColor Yellow
Get-Content $BackupFile | kubectl exec -i -n $Namespace $pgPod -- psql -U admin -d cue_db

Write-Host "Database restoration completed successfully!" -ForegroundColor Green


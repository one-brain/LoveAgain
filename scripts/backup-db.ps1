# Database Backup Script for Cue (PostgreSQL in Kubernetes)
param (
    [string]$Namespace = "cue",
    [string]$OutputDir = "./backups"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path $OutputDir "cue_db_backup_$timestamp.sql"

Write-Host "Finding PostgreSQL pod in namespace '$Namespace'..." -ForegroundColor Cyan
$pgPod = (kubectl get pods -n $Namespace --no-headers -o custom-columns=":metadata.name" | Select-String "postgres").ToString().Trim()

if (-not $pgPod) {
    throw "PostgreSQL pod not found in namespace '$Namespace'."
}

Write-Host "Starting pg_dump from pod '$pgPod' to '$backupFile'..." -ForegroundColor Cyan
& kubectl exec -n $Namespace $pgPod -- pg_dump -U admin -d cue_db --clean --if-exists > $backupFile

$fileInfo = Get-Item $backupFile
if ($fileInfo.Length -gt 0) {
    Write-Host "Backup completed successfully!" -ForegroundColor Green
    Write-Host "Location: $($fileInfo.FullName)" -ForegroundColor Green
    Write-Host "Size: $([math]::Round($fileInfo.Length / 1KB, 2)) KB" -ForegroundColor Green
} else {
    Remove-Item $backupFile -Force -ErrorAction SilentlyContinue
    throw "Backup failed: generated empty file."
}


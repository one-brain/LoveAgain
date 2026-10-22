# PowerShell helper to start port forwarding for Cue services and infrastructure in Kubernetes
Write-Host "Starting port-forwarding for Cue services (namespace: cue)..." -ForegroundColor Cyan

$jobs = @()

$portMappings = @(
    @{ Name = "Frontend"; Svc = "cue-services-cue-services-frontend"; LocalPort = 3000; RemotePort = 3000 },
    @{ Name = "API Gateway"; Svc = "api-gateway"; LocalPort = 8080; RemotePort = 8080 },
    @{ Name = "PgAdmin"; Svc = "cue-infra-cue-infrastructure-pg-admin"; LocalPort = 5050; RemotePort = 80 },
    @{ Name = "RabbitMQ Management"; Svc = "cue-infra-cue-infrastructure-rabbitmq"; LocalPort = 15672; RemotePort = 15672 },
    @{ Name = "PostgreSQL"; Svc = "cue-infra-cue-infrastructure-postgres"; LocalPort = 5432; RemotePort = 5432 }
)

foreach ($mapping in $portMappings) {
    Write-Host "Forwarding $($mapping.Name): http://localhost:$($mapping.LocalPort) -> svc/$($mapping.Svc):$($mapping.RemotePort)" -ForegroundColor Green
    $command = "while (`$true) { & kubectl port-forward -n cue svc/$($mapping.Svc) $($mapping.LocalPort):$($mapping.RemotePort) --address 0.0.0.0; Start-Sleep -Milliseconds 500 }"
    $job = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile", "-WindowStyle", "Hidden", "-Command", $command -PassThru
    $jobs += $job
}

Write-Host "`nAll port-forwarding processes are running in the background." -ForegroundColor Cyan
Write-Host "Press Enter to stop all port forwards..." -ForegroundColor Yellow
Read-Host

Write-Host "Stopping port forwards..." -ForegroundColor Cyan
foreach ($job in $jobs) {
    Start-Process -FilePath "taskkill" -ArgumentList "/F", "/T", "/PID", "$($job.Id)" -Wait -NoNewWindow -ErrorAction SilentlyContinue | Out-Null
    Stop-Process -Id $job.Id -Force -ErrorAction SilentlyContinue
}
Write-Host "Stopped." -ForegroundColor Green


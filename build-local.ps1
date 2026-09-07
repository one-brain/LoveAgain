param(
    [string]$Tag = "v1.0.0"
)

$repoRoot = $PSScriptRoot
$servicesDir = Join-Path $repoRoot "backend\Services"

$dirs = Get-ChildItem -Path $servicesDir -Directory | Where-Object { Test-Path (Join-Path $_.FullName "Dockerfile") }

foreach ($dir in $dirs) {
    $name = $dir.Name.ToLowerInvariant()
    $image = "$name`:$Tag"
    Write-Host "Building $image ..."
    docker build --rm -t $image -f $dir\Dockerfile $repoRoot
    if ($LASTEXITCODE -eq 0) { Write-Host "  OK" -ForegroundColor Green } else { Write-Host "  FAIL" -ForegroundColor Red }
}

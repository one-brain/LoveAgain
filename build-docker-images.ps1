# build-docker-images.ps1
# Builds all backend service Docker images locally using the tag and registry defined
# in the Helm chart's values.yaml (defaults to *.imageTag, falls back to ``latest``).
# Registry defaults to empty (local daemon) if not specified.
#
# Example: .\build-docker-images.ps1          # uses the tag and registry present in values.yaml
#          .\build-docker-images.ps1 -Tag v2.0 # overrides the values.yaml tag
#          .\build-docker-images.ps1 -Registry myregistry.com # overrides the values.yaml registry

# Param block must come first
param(
    [string]$Tag,
    [string]$Registry
)

# ---------- Read the tag and registry from values.yaml, if present ----------
$valuesFile = Join-Path $PSScriptRoot "helm-chart-services\values.yaml"
if (-Not (Test-Path $valuesFile)) {
    Write-Error "Error: $valuesFile not found."
    exit 1
}

# Extract the tags.  Look for "backend.imageTag:" or "frontend.imageTag:"; use the first match.
$backendTagMatch = Get-Content $valuesFile | Select-String -Pattern '^\s*backend\.imageTag\s*:\s*(\S+)' | Select-Object -First 1
$backendTag = if ($backendTagMatch -and $backendTagMatch.Matches) { $backendTagMatch.Matches[0].Groups[1].Value } else { $null }

$frontendTagMatch = Get-Content $valuesFile | Select-String -Pattern '^\s*frontend\.imageTag\s*:\s*(\S+)' | Select-Object -First 1
$frontendTag = if ($frontendTagMatch -and $frontendTagMatch.Matches) { $frontendTagMatch.Matches[0].Groups[1].Value } else { $null }

# Extract the registry. Look for "global.imageRegistry:" or "image.registry:"; use the first match.
$globalRegistryMatch = Get-Content $valuesFile | Select-String -Pattern '^\s*global\.imageRegistry\s*:\s*(\S+)' | Select-Object -First 1
$globalRegistry = if ($globalRegistryMatch -and $globalRegistryMatch.Matches) { $globalRegistryMatch.Matches[0].Groups[1].Value } else { $null }

$imageRegistryMatch = Get-Content $valuesFile | Select-String -Pattern '^\s*image\.registry\s*:\s*(\S+)' | Select-Object -First 1
$imageRegistry = if ($imageRegistryMatch -and $imageRegistryMatch.Matches) { $imageRegistryMatch.Matches[0].Groups[1].Value } else { $null }

# Fallback to 'latest' for tags if not defined
if (-Not $backendTag) { $backendTag = "latest" }
if (-Not $frontendTag) { $frontendTag = "latest" }

# Fallback to empty string for registry if not defined (means use local Docker daemon)
if (-Not $globalRegistry) { $globalRegistry = "" }
if (-Not $imageRegistry) { $imageRegistry = "" }

# If the user supplied a Tag, use it; otherwise use the tag from values.yaml
if ($Tag) {
    $imageTag = $Tag
} elseif ($backendTag) {
    $imageTag = $backendTag
} else {
    $imageTag = "latest"
}

# If the user supplied a Registry, use it; otherwise use the registry from values.yaml
if ($Registry) {
    $finalRegistry = $Registry
} elseif ($globalRegistry) {
    $finalRegistry = $globalRegistry
} elseif ($imageRegistry) {
    $finalRegistry = $imageRegistry
} else {
    $finalRegistry = ""  # Empty means local Docker daemon
}

$repoRoot   = $PSScriptRoot
$servicesDir = Join-Path $repoRoot "backend\Services"

if (-Not (Test-Path $servicesDir)) {
    Write-Error "Directory not found: $servicesDir"
    exit 1
}

$serviceDirs = Get-ChildItem -Path $servicesDir -Directory | Where-Object {
    Test-Path (Join-Path $_.FullName "Dockerfile")
}

if ($serviceDirs.Count -eq 0) {
    Write-Warning "No service directories with Dockerfile found under $servicesDir"
    exit 0
}

foreach ($dir in $serviceDirs) {
    # Convert directory name (PascalCase) to Helm service name (kebab-case)
    # e.g., AuthService -> auth-service, APIGateway -> api-gateway
    $pascalName = $dir.Name
    # Handle PascalCase to kebab-case conversion:
    # Insert boundary between lowercase and uppercase, or before uppercase followed by lowercase (not at start)
    $kebabName = ($pascalName -creplace '(?<=[a-z])(?=[A-Z])|(?<!^)(?=[A-Z][a-z])', '-').ToLowerInvariant()
    # Helm creates images named "<service-name>"; set the tag to $imageTag
    if ($finalRegistry) {
        $imageName = "$finalRegistry/$kebabName`:$imageTag"
    } else {
        $imageName = "$kebabName`:$imageTag"
    }

    $dockerfilePath = Join-Path $dir.FullName "Dockerfile"
    Write-Host "Building $imageName from $($dir.Name)..."
    docker build -t $imageName -f $dockerfilePath $repoRoot

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  → OK" -ForegroundColor Green
    } else {
        Write-Host "  → FAILED (exit $LASTEXITCODE)" -ForegroundColor Red
    }
}

# Build frontend image
$frontendPath = Join-Path $repoRoot "frontend"
$frontendDockerfile = Join-Path $frontendPath "Dockerfile"

if (Test-Path $frontendDockerfile) {
    if ($finalRegistry) {
        $frontendImageName = "$finalRegistry/frontend`:$imageTag"
    } else {
        $frontendImageName = "frontend`:$imageTag"
    }
    Write-Host "Building $frontendImageName from frontend..."
    docker build -t $frontendImageName -f $frontendDockerfile $frontendPath

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  → OK" -ForegroundColor Green
    } else {
        Write-Host "  → FAILED (exit $LASTEXITCODE)" -ForegroundColor Red
    }
} else {
    Write-Warning "Frontend Dockerfile not found at $frontendDockerfile"
}

Write-Host "All builds completed." -ForegroundColor Cyan
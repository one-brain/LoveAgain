# remove-docker-images.ps1
# Removes all Docker images whose repository name starts with "cue."

<# Usage
   .\remove-docker-images.ps1                # remove all cue.* images
   .\remove-docker-images.ps1 -Force         # skip confirmation prompt
   .\remove-docker-images.ps1 -Registry docker.io/myorg   # only that registry
#>

param(
    [string]$Registry = "",
    [switch]$Force
)

$filter = if ($Registry) {
    $clean = $Registry.TrimEnd("/")
    "$clean/*"
}
else {
    "*"
}

Write-Host "Finding images matching '$filter'..."

$images = docker images --format "{{.Repository}}:{{.Tag}} {{.ID}}" |
Select-String -Pattern "^$filter" |
ForEach-Object { $_.Line.Split(" ")[1] }

if (-Not $images) {
    Write-Host "No matching images found."
    exit 0
}

Write-Host "Images to be removed:"
$images | ForEach-Object { Write-Host "  $_" }

if (-Not $Force) {
    $confirm = Read-Host "Remove these images? [y/N]"
    if ($confirm.ToLower() -ne "y") {
        Write-Host "Aborted."
        exit 0
    }
}

foreach ($id in $images) {
    Write-Host "Removing $id ..."
    docker rmi $id
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  → OK" -ForegroundColor Green
    }
    else {
        Write-Host "  → FAILED" -ForegroundColor Red
    }
}

Write-Host "Done." -ForegroundColor Cyan
$name = 'APIGateway'
Write-Host "Original: $name"
$pattern = '([a-z])([A-Z])'
$replacement = '$1-$2'
$step1 = $name -creplace $pattern, $replacement
Write-Host "After creplace: $step1"
$kebab = $step1.ToLowerInvariant()
Write-Host "Final kebab-case: $kebab"
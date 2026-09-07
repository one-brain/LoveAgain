# Test the conversion logic
$dirName = "APIGateway"
Write-Host "Directory name: $dirName"

# Apply the conversion from the script
$pascalName = $dirName
$kebabName = -join ($pascalName -creplace '([a-z])([A-Z])', '$1-$2').ToLowerInvariant()
Write-Host "Kebab case: $kebabName"

# Test with other service names
$testNames = @("AuthService", "UserService", "ProfileService", "DiscoveryService", "BookingService", "PaymentService", "ChatService", "NotificationService", "ReviewService", "SupportService", "AnalyticsService", "APIGateway")

foreach ($name in $testNames) {
    $converted = -join ($name -creplace '([a-z])([A-Z])', '$1-$2').ToLowerInvariant()
    Write-Host "$name -> $converted"
}
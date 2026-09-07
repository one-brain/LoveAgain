# Quick test of the conversion logic
$testNames = @('APIGateway', 'AuthService', 'UserService', 'ProfileService', 'DiscoveryService',
              'BookingService', 'PaymentService', 'ChatService', 'NotificationService',
              'ReviewService', 'SupportService', 'AnalyticsService')

Write-Host "Testing PascalCase to kebab-case conversion:"
Write-Host "============================================"

foreach ($name in $testNames) {
    # Apply the fixed conversion logic from the script
    $converted = ($name -creplace '([a-z])([A-Z])', '$1-$2' -creplace '([A-Z]+)([A-Z][a-z])', '$1-$2').ToLowerInvariant()
    Write-Host "$name -> $converted"
}
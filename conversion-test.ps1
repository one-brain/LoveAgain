$testCases = @(
    @{Input='APIGateway'; Expected='api-gateway'},
    @{Input='AuthService'; Expected='auth-service'},
    @{Input='UserService'; Expected='user-service'},
    @{Input='ProfileService'; Expected='profile-service'},
    @{Input='DiscoveryService'; Expected='discovery-service'},
    @{Input='BookingService'; Expected='booking-service'},
    @{Input='PaymentService'; Expected='payment-service'},
    @{Input='ChatService'; Expected='chat-service'},
    @{Input='NotificationService'; Expected='notification-service'},
    @{Input='ReviewService'; Expected='review-service'},
    @{Input='SupportService'; Expected='support-service'},
    @{Input='AnalyticsService'; Expected='analytics-service'}
)

Write-Host "Testing PascalCase to kebab-case conversion:"
Write-Host "=========================================="

$allPassed = $true
foreach ($test in $testCases) {
    $input = $test.Input
    $expected = $test.Expected

    # Apply the conversion logic from the updated script
    $actual = ($input -creplace '([a-z])([A-Z])', '$1-$2' -creplace '([A-Z]+)([A-Z][a-z])', '$1-$2').ToLowerInvariant()

    if ($actual -eq $expected) {
        Write-Host "✓ $input -> $actual" -ForegroundColor Green
    } else {
        Write-Host "✗ $input -> $expected (expected $actual)" -ForegroundColor Red
        $allPassed = $false
    }
}

if ($allPassed) {
    Write-Host "`nAll tests passed!" -ForegroundColor Green
} else {
    Write-Host "`nSome tests failed!" -ForegroundColor Red
}
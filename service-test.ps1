$services = 'APIGateway','AuthService','UserService','ProfileService','DiscoveryService','BookingService','PaymentService','ChatService','NotificationService','ReviewService','SupportService','AnalyticsService'

foreach ($s in $services) {
    $r = ($s -creplace '(?<=[a-z])(?=[A-Z])|(?<!^)(?=[A-Z][a-z])','-').ToLowerInvariant()
    Write-Host "$s -> $r"
}
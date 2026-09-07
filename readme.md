# GitHub Copilot Master Prompt: "Cue" - Partner Renting Platform

## PROJECT OVERVIEW

Build a microservices-based "Experience Companion" platform enabling users to rent/offer companionship services for activities, networking, and skill-sharing. System handles secure payments, real-time chat, GPS verification, and trust-based reputation scoring.

## ARCHITECTURE & TECH STACK

### Infrastructure

- **Containerization:** Docker with multi-stage builds
- **Orchestration:** Kubernetes (minikube for dev, EKS/AKS for prod)
- **Message Queue:** RabbitMQ for async event-driven communication
- **API Gateway:** Ocelot for routing, rate limiting, JWT validation
- **Service Discovery:** Consul or Kubernetes DNS
- **Monitoring:** OpenTelemetry + Jaeger for distributed tracing, Prometheus + Grafana for metrics
- **Logging:** Elasticsearch + Kibana (ELK stack) via Serilog

### Backend (.NET Core 8)

- **Pattern:** Clean Architecture (Domain, Application, Infrastructure, Presentation layers)
- **CQRS:** MediatR for command/query separation
- **ORM:** Entity Framework Core with PostgreSQL
- **Authentication:** JWT with refresh tokens, IdentityServer4 or Duende
- **Validation:** FluentValidation
- **Caching:** Redis for distributed caching (session, availability slots)
- **Payment:** Stripe Connect for marketplace payments
- **Real-time:** SignalR for WebSocket notifications
- **Testing:** xUnit, Moq, Shouldly, Bogus for seed data

### Frontend (React TypeScript)

- **Framework:** Vite + React 18
- **State:** Redux Toolkit + RTK Query for API caching
- **Styling:** Tailwind CSS + Material-UI component library
- **Routing:** React Router v6 with protected routes
- **Forms:** React Hook Form + Zod validation
- **Maps:** Mapbox GL JS or Google Maps API
- **Video:** React Player for intro video playback

### Mobile (Flutter)

- **State:** Riverpod or BLoC pattern
- **Navigation:** GoRouter for declarative routing
- **Local Storage:** Hive or SharedPreferences
- **Camera:** camera plugin for video registration
- **GPS:** location plugin with background tracking
- **Push:** Firebase Cloud Messaging
- **Native Features:** Biometric authentication, file picker, vibration

---

## MICROSERVICES BREAKDOWN

```yaml
Services:
  1. AuthService (Port 5001)
  2. UserService (Port 5002)
  3. ProfileService (Port 5003)
  4. DiscoveryService (Port 5004) - Search/Filter/Geo
  5. BookingService (Port 5005) - Scheduling/Calendar
  6. PaymentService (Port 5006) - Stripe Integration
  7. ChatService (Port 5007) - Real-time messaging
  8. NotificationService (Port 5008) - Email/SMS/Push
  9. ReviewService (Port 5009) - Ratings/Trust Scores
  10. SupportService (Port 5010) - Disputes/Tickets
  11. AnalyticsService (Port 5011) - Event tracking
  12. APIGateway (Port 5000) - Reverse proxy
```

---

## GITHUB COPILOT PROMPT

```markdown
# Cue Platform - Full Stack Implementation

## CONTEXT
I'm building a microservices-based marketplace app called "Cue" where users can rent companionship for activities (tennis, language exchange, museum tours, networking events). 

## TECHNICAL REQUIREMENTS

### 1. Domain Models (Domain Layer)
Create the following domain entities with DDD principles:
- `User` (Id, Email, Phone, FirstName, LastName, DateOfBirth, IsVerified, TrustScore, CreatedAt, UpdatedAt)
- `UserRole` (Seeker, Provider, Admin)
- `ProviderProfile` (UserId, HourlyRate, Bio, Specialties[], MaxRadiusKm, IntroVideoUrl, IsActive, AverageResponseTime)
- `ServiceOrder` (Id, ProviderId, SeekerId, StartTime, EndTime, Status, TotalAmount, PlatformFee, ProviderEarnings, MeetingAddress, CancellationReason)
- `AvailabilitySlot` (Id, ProviderId, StartTime, EndTime, IsBooked)
- `Review` (Id, OrderId, ReviewerId, RevieweeId, Rating, Comment, TimelinessScore, CommunicationScore)
- `ChatMessage` (Id, OrderId, SenderId, Content, SentAt, IsRead, MessageType)
- `Dispute` (Id, OrderId, RaisedBy, Reason, Status, Resolution, CreatedAt)
- `PaymentTransaction` (Id, OrderId, StripePaymentIntentId, Amount, Currency, Status, Metadata)
- `Notification` (Id, UserId, Type, Content, IsRead, CreatedAt)
- `TrustEvent` (Id, UserId, EventType, ScoreDelta, Reason, Timestamp)

### 2. CQRS Implementation
For each microservice, implement:
- Commands: CreateBookingCommand, CancelBookingCommand, UpdateProfileCommand, CompleteOrderCommand
- Queries: GetAvailableProvidersQuery, GetUserBookingsQuery, GetProviderAnalyticsQuery
- Use MediatR for command/query handlers
- Use FluentValidation for input validation
- Use AutoMapper for DTO mapping

### 3. Event-Driven Communication (RabbitMQ)
Define these events:
- `UserRegisteredEvent` (UserId, Email, Role)
- `ProfileCreatedEvent` (ProviderId, HourlyRate, Specialties)
- `BookingCreatedEvent` (OrderId, ProviderId, SeekerId, TimeSlot)
- `BookingConfirmedEvent` (OrderId, Status)
- `BookingCompletedEvent` (OrderId, Duration)
- `PaymentProcessedEvent` (OrderId, Amount, Status)
- `ReviewSubmittedEvent` (OrderId, Rating, RevieweeId)
- `TrustScoreUpdatedEvent` (UserId, NewScore, Delta)

Implement:
- `IEventPublisher` interface with PublishAsync<T>(T @event) method
- `IEventHandler<T>` interface with HandleAsync(T @event, CancellationToken ct)
- Use RabbitMQ.Client with connection pooling
- Implement dead-letter queues for failed events
- Use MassTransit or Raw RabbitMQ with Polly retry policies

### 4. Database Design (PostgreSQL)
Generate migration scripts with:
- UUID primary keys (use Guid.NewGuid())
- PostgreSQL-specific features: JSONB for metadata fields
- Full-text search with GIN indexes on `specialties` and `bio`
- PostGIS extension for geospatial queries (ST_DWithin for location-based discovery)
- Composite indexes: (ProviderId, StartTime) on AvailabilitySlot
- Partition tables for ChatMessages by month/year
- Use EF Core's `HasIndex()` and `HasQueryFilter()` for soft delete

```sql
-- Critical indexes
CREATE INDEX idx_provider_profile_location ON provider_profiles USING GIST (location);
CREATE INDEX idx_availability_slot_search ON availability_slots (provider_id, start_time) WHERE is_booked = false;
CREATE INDEX idx_service_orders_seeker_status ON service_orders (seeker_id, status);
CREATE INDEX idx_chat_messages_order_created ON chat_messages (order_id, created_at DESC);
```

### 5. Authentication & Authorization

Implement IdentityServer4/Duende with:

- OAuth2 + OIDC flows (Authorization Code with PKCE for mobile)
- JWT access tokens (15 min expiry) + refresh tokens (7 days)
- Custom AuthorizationHandlers for resource-based permissions:
  - `CanManageBookingRequirement` (only provider/seeker involved)
  - `CanViewProfileRequirement` (based on trust score thresholds)
- Two-factor authentication via Twilio Verify API
- Role-based claims: "Provider", "Seeker", "Admin"

### 6. Core Business Logic Services

#### BookingService Implementation

```csharp
public async Task<BookingResult> CreateBookingAsync(CreateBookingCommand command)
{
    // 1. Validate availability (pessimistic locking)
    using var transaction = await _dbContext.Database.BeginTransactionAsync();
    try {
        var slot = await _dbContext.AvailabilitySlots
            .Where(s => s.ProviderId == command.ProviderId 
                && s.StartTime == command.StartTime 
                && !s.IsBooked)
            .FirstOrDefaultAsync();
    
        if (slot == null) return BookingResult.Failure("Slot unavailable");
    
        // 2. Hold slot with row lock
        slot.IsBooked = true;
        slot.BookedBy = command.SeekerId;
        await _dbContext.SaveChangesAsync();
    
        // 3. Create order (pending payment)
        var order = new ServiceOrder {
            Id = Guid.NewGuid(),
            ProviderId = command.ProviderId,
            SeekerId = command.SeekerId,
            StartTime = command.StartTime,
            EndTime = command.StartTime.AddHours(command.Duration),
            Status = OrderStatus.PendingPayment,
            TotalAmount = command.HourlyRate * command.Duration,
            PlatformFee = CalculatePlatformFee(command.HourlyRate, command.Duration),
            ProviderEarnings = CalculateProviderEarnings(command.HourlyRate, command.Duration)
        };
        _dbContext.ServiceOrders.Add(order);
        await _dbContext.SaveChangesAsync();
    
        // 4. Publish event
        await _eventPublisher.PublishAsync(new BookingCreatedEvent {
            OrderId = order.Id,
            ProviderId = order.ProviderId,
            SeekerId = order.SeekerId,
            Amount = order.TotalAmount
        });
    
        await transaction.CommitAsync();
        return BookingResult.Success(order);
    } catch {
        await transaction.RollbackAsync();
        throw;
    }
}
```

#### PaymentService Implementation

```csharp
public async Task<PaymentResult> ProcessPaymentAsync(ProcessPaymentCommand command)
{
    // 1. Create Stripe PaymentIntent with escrow
    var options = new PaymentIntentCreateOptions {
        Amount = (long)(command.Amount * 100), // Convert to cents
        Currency = "usd",
        PaymentMethodTypes = new List<string> { "card" },
        CaptureMethod = "manual", // Authorize only initially
        Metadata = new Dictionary<string, string> {
            ["order_id"] = command.OrderId.ToString(),
            ["platform_fee"] = command.PlatformFee.ToString()
        },
        TransferData = new PaymentIntentTransferDataOptions {
            Destination = command.ConnectedAccountId // Stripe Connect
        },
        OnBehalfOf = command.ConnectedAccountId
    };
  
    var paymentIntent = await _stripeClient.PaymentIntents.CreateAsync(options);
  
    // 2. Store transaction
    var transaction = new PaymentTransaction {
        Id = Guid.NewGuid(),
        OrderId = command.OrderId,
        StripePaymentIntentId = paymentIntent.Id,
        ClientSecret = paymentIntent.ClientSecret,
        Amount = command.Amount,
        Status = TransactionStatus.Authorized
    };
    _dbContext.PaymentTransactions.Add(transaction);
    await _dbContext.SaveChangesAsync();
  
    // 3. Return client secret to frontend for confirmation
    return PaymentResult.Success(paymentIntent.ClientSecret, transaction.Id);
}

// Webhook handler for Stripe events
[HttpPost("webhook")]
public async Task<IActionResult> HandleStripeWebhook()
{
    var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
    var stripeEvent = EventUtility.ConstructEvent(json, 
        Request.Headers["Stripe-Signature"], _webhookSecret);
  
    switch (stripeEvent.Type) {
        case Events.PaymentIntentSucceeded:
            await HandlePaymentSuccess((PaymentIntent)stripeEvent.Data.Object);
            break;
        case Events.PaymentIntentPaymentFailed:
            await HandlePaymentFailure((PaymentIntent)stripeEvent.Data.Object);
            break;
    }
    return Ok();
}
```

#### DiscoveryService Implementation (Geo-Search)

```csharp
public async Task<List<ProviderDto>> SearchProvidersAsync(SearchProvidersQuery query)
{
    // 1. Build base query
    var providerQuery = _dbContext.ProviderProfiles
        .Include(p => p.User)
        .Where(p => p.IsActive && p.User.TrustScore >= 70);
  
    // 2. Apply filters
    if (!string.IsNullOrEmpty(query.Specialty)) {
        providerQuery = providerQuery.Where(p => 
            p.Specialties.Contains(query.Specialty));
    }
  
    if (query.MaxPrice.HasValue) {
        providerQuery = providerQuery.Where(p => 
            p.HourlyRate <= query.MaxPrice.Value);
    }
  
    // 3. Geo-location filter (PostGIS)
    if (query.Latitude.HasValue && query.Longitude.HasValue) {
        var point = new NpgsqlPoint(query.Longitude.Value, query.Latitude.Value);
        providerQuery = providerQuery.Where(p => 
            p.Location.IsWithinDistance(point, query.RadiusKm.Value * 1000));
    }
  
    // 4. Apply sorting
    providerQuery = query.SortBy switch {
        "price_asc" => providerQuery.OrderBy(p => p.HourlyRate),
        "price_desc" => providerQuery.OrderByDescending(p => p.HourlyRate),
        "rating" => providerQuery.OrderByDescending(p => p.AverageRating),
        "distance" => providerQuery.OrderBy(p => 
            p.Location.Distance(point)), // Distance sorting
        _ => providerQuery.OrderBy(p => p.User.TrustScore)
    };
  
    // 5. Pagination
    var providers = await providerQuery
        .Skip((query.Page - 1) * query.PageSize)
        .Take(query.PageSize)
        .Select(p => new ProviderDto {
            Id = p.UserId,
            Name = p.User.FirstName + " " + p.User.LastName[0] + ".",
            Rate = p.HourlyRate,
            Rating = p.AverageRating,
            Distance = query.Latitude.HasValue ? 
                CalculateDistance(p.Location, point) : null,
            Specialties = p.Specialties,
            IntroVideoUrl = p.IntroVideoUrl,
            AvailableNow = _redisCache.CheckAvailability(p.UserId, DateTime.UtcNow)
        })
        .ToListAsync();
  
    return providers;
}
```

### 7. Real-Time Features (SignalR)

Implement SignalR hubs for:

- **ChatHub**: Send/Receive messages, typing indicators, read receipts
- **BookingHub**: Real-time booking status updates, provider availability changes
- **NotificationHub**: Push notifications to connected clients

```csharp
public class ChatHub : Hub
{
    private readonly IChatService _chatService;
    private readonly IEventPublisher _eventPublisher;
  
    public async Task SendMessage(SendMessageCommand command)
    {
        // 1. Validate order exists and user is participant
        var order = await _chatService.GetOrderAsync(command.OrderId);
        if (order.SeekerId != command.SenderId && order.ProviderId != command.SenderId)
            throw new HubException("Unauthorized");
    
        // 2. Save message to database
        var message = new ChatMessage {
            Id = Guid.NewGuid(),
            OrderId = command.OrderId,
            SenderId = command.SenderId,
            Content = await SanitizeMessage(command.Content), // XSS protection
            SentAt = DateTime.UtcNow,
            MessageType = command.MessageType
        };
        await _chatService.SaveMessageAsync(message);
    
        // 3. Determine recipient
        var recipientId = command.SenderId == order.SeekerId ? 
            order.ProviderId : order.SeekerId;
    
        // 4. Broadcast via SignalR
        await Clients.User(recipientId.ToString())
            .SendAsync("ReceiveMessage", new {
                message.Id,
                message.Content,
                message.SentAt,
                SenderId = command.SenderId
            });
    
        // 5. Send push notification if offline
        await _eventPublisher.PublishAsync(new NewMessageEvent {
            RecipientId = recipientId,
            SenderName = command.SenderName,
            MessagePreview = message.Content.Substring(0, Math.Min(50, message.Content.Length))
        });
    }
}
```

### 8. React Frontend Implementation

```tsx
// Core folder structure
src/
  ├── api/
  │   ├── baseApi.ts (RTK Query configuration)
  │   ├── authApi.ts
  │   ├── bookingApi.ts
  │   ├── discoveryApi.ts
  │   └── chatApi.ts
  ├── features/
  │   ├── auth/
  │   │   ├── LoginPage.tsx
  │   │   ├── RegisterPage.tsx
  │   │   └── VerifyPhonePage.tsx
  │   ├── discovery/
  │   │   ├── SearchPage.tsx
  │   │   ├── Filters.tsx
  │   │   └── ProviderCard.tsx
  │   ├── booking/
  │   │   ├── BookingFlow/
  │   │   │   ├── SelectSlot.tsx
  │   │   │   ├── PaymentForm.tsx
  │   │   │   └── Confirmation.tsx
  │   │   └── MyBookings.tsx
  │   ├── profile/
  │   │   ├── ProfileEditor.tsx
  │   │   ├── AvailabilityManager.tsx
  │   │   └── EarningsDashboard.tsx
  │   └── chat/
  │       ├── ChatList.tsx
  │       ├── ChatWindow.tsx
  │       └── MessageBubble.tsx
  ├── hooks/
  │   ├── useAuth.ts
  │   ├── useWebSocket.ts (SignalR wrapper)
  │   └── useGeolocation.ts
  ├── store/
  │   ├── store.ts
  │   └── rootReducer.ts
  └── utils/
      ├── validators.ts (Zod schemas)
      └── constants.ts

// RTK Query setup
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Booking', 'Profile', 'Chat'],
  endpoints: () => ({}),
});

// Discovery API
export const discoveryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchProviders: builder.query<Provider[], SearchParams>({
      query: (params) => ({
        url: '/discovery/search',
        params: {
          ...params,
          latitude: params.location?.lat,
          longitude: params.location?.lng,
        },
      }),
      providesTags: ['Profile'],
      keepUnusedDataFor: 300, // 5 minutes
    }),
  
    getProviderAvailability: builder.query<Slot[], { providerId: string; date: string }>({
      query: ({ providerId, date }) => `/discovery/availability/${providerId}?date=${date}`,
      transformResponse: (response: Slot[]) => 
        response.filter(slot => !slot.isBooked),
    }),
  }),
});

// Booking flow with React Hook Form
const BookingFlow = () => {
  const { provider, selectedSlot } = useBookingStore();
  const [createBooking] = useCreateBookingMutation();
  const { handleSubmit, control } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      duration: 2,
      specialRequests: '',
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    try {
      const result = await createBooking({
        providerId: provider.id,
        slotId: selectedSlot.id,
        duration: data.duration,
        hourlyRate: provider.hourlyRate,
        specialRequests: data.specialRequests,
      }).unwrap();
  
      navigate(`/booking/confirmation/${result.orderId}`);
    } catch (error) {
      toast.error('Booking failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="duration"
        control={control}
        render={({ field }) => (
          <Slider
            {...field}
            min={1}
            max={6}
            step={0.5}
            marks={[...Array(12)].map((_, i) => ({ value: (i + 1) / 2 }))}
          />
        )}
      />
      <Controller
        name="specialRequests"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            multiline
            rows={3}
            placeholder="Any specific requirements for your experience?"
          />
        )}
      />
      <PaymentElement />
      <Button type="submit" variant="contained" size="large">
        Confirm Booking (${provider.hourlyRate * data.duration})
      </Button>
    </form>
  );
};
```

### 9. Flutter Mobile Implementation

```dart
// Core architecture with Riverpod
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authRepositoryProvider));
});

final bookingProvider = FutureProvider.family<Booking, String>((ref, bookingId) {
  return ref.read(bookingRepositoryProvider).getBooking(bookingId);
});

// Chat with SignalR
class ChatService {
  final HubConnection _connection;
  final StreamController<ChatMessage> _messageController = 
      StreamController.broadcast();
  
  ChatService(this._connection) {
    _connection.on('ReceiveMessage', (data) {
      final message = ChatMessage.fromJson(data.first);
      _messageController.add(message);
    });
  
    _connection.start();
  }
  
  Future<void> sendMessage(String orderId, String content) async {
    await _connection.invoke('SendMessage', args: {
      'orderId': orderId,
      'content': content,
    });
  }
  
  Stream<ChatMessage> get onMessage => _messageController.stream;
}

// GPS tracking with background
class LocationService extends Service {
  Stream<Position> get locationUpdates => Geolocator.getPositionStream(
    locationSettings: const LocationSettings(
      accuracy: LocationAccuracy.best,
      distanceFilter: 50, // Update every 50 meters
    ),
  );
  
  Future<void> startTrackingForBooking(String orderId) async {
    await _locationUpdates.listen((position) async {
      await _api.reportLocation(orderId, position);
    }).asStream();
  }
}

// UI Components
class ProviderCard extends StatelessWidget {
  final Provider provider;
  final VoidCallback onBook;
  
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: [
          CachedNetworkImage(
            imageUrl: provider.profilePhotoUrl,
            height: 200,
            width: double.infinity,
            fit: BoxFit.cover,
          ),
          ListTile(
            leading: CircleAvatar(
              backgroundColor: provider.isAvailableNow ? Colors.green : Colors.grey,
            ),
            title: Text('${provider.firstName} ${provider.lastName[0]}.'),
            subtitle: Text(provider.specialties.join(' • ')),
            trailing: Text('\$${provider.hourlyRate}/hr'),
          ),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: onBook,
                  icon: Icon(Icons.calendar_today),
                  label: Text('Book Now'),
                ),
              ),
              IconButton(
                icon: Icon(Icons.favorite_border),
                onPressed: () => context.read(favoritesProvider).toggle(provider.id),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
```

### 10. DevOps & Deployment

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  auth-service:
    build: 
      context: ./AuthService
      dockerfile: Dockerfile
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=authdb;Username=admin;Password=secret
      - RabbitMQ__Host=rabbitmq
      - Redis__ConnectionString=redis:6379
    ports:
      - "5001:5001"
    depends_on:
      - postgres
      - rabbitmq
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5001/health"]
      interval: 30s

  api-gateway:
    image: ocelot/gateway:latest
    ports:
      - "5000:5000"
    volumes:
      - ./gateway-config.json:/app/configuration.json
    depends_on:
      - auth-service
      - booking-service

  postgres:
    image: postgis/postgis:15-3.4
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: cues_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  rabbitmq:
    image: rabbitmq:3-management
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: secret
    ports:
      - "5672:5672"
      - "15672:15672" # Management UI

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  react-frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://localhost:5000
    depends_on:
      - api-gateway

volumes:
  postgres_data:
```

```yaml
# Kubernetes deployment (k8s/service-deployment.yaml)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: booking-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: booking-service
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: booking-service
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "5005"
    spec:
      containers:
      - name: booking-service
        image: cues/booking-service:latest
        ports:
        - containerPort: 5005
        env:
        - name: ConnectionStrings__DefaultConnection
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: connection-string
        - name: RabbitMQ__Host
          value: rabbitmq-service
        - name: OTEL_EXPORTER_OTLP_ENDPOINT
          value: http://jaeger-collector:4317
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5005
          initialDelaySeconds: 60
        readinessProbe:
          httpGet:
            path: /ready
            port: 5005
          initialDelaySeconds: 30
---
apiVersion: v1
kind: Service
metadata:
  name: booking-service
spec:
  selector:
    app: booking-service
  ports:
  - port: 80
    targetPort: 5005
  type: ClusterIP
```

### 11. Security Best Practices

```csharp
// Implement rate limiting
public class RateLimitingMiddleware
{
    private readonly IMemoryCache _cache;
    private readonly RequestDelegate _next;
  
    public async Task InvokeAsync(HttpContext context)
    {
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId != null)
        {
            var key = $"rate_limit_{userId}_{context.Request.Path}";
            var count = _cache.GetOrCreate(key, entry => {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(1);
                return 0;
            });
        
            if (count >= 100) // 100 requests per minute
            {
                context.Response.StatusCode = 429;
                await context.Response.WriteAsync("Rate limit exceeded");
                return;
            }
        
            _cache.Set(key, count + 1, TimeSpan.FromMinutes(1));
        }
    
        await _next(context);
    }
}

// Data encryption for sensitive fields
public class EncryptedStringConverter : ValueConverter<string, string>
{
    public EncryptedStringConverter() 
        : base(
            v => Protect(v), // Encrypt before storing
            v => Unprotect(v)) // Decrypt when reading
    {}
}

// Implement CORS properly
services.AddCors(options => {
    options.AddPolicy("MobileApp", policy => {
        policy.WithOrigins("http://localhost:3000", "https://app.cue.com")
            .AllowCredentials()
            .AllowAnyHeader()
            .AllowAnyMethod()
            .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
    });
});
```

### 12. Testing Strategy

```csharp
// Unit test with xUnit
[Fact]
public async Task CreateBooking_ValidRequest_ReturnsSuccess()
{
    // Arrange
    var command = new CreateBookingCommand {
        ProviderId = Guid.NewGuid(),
        SeekerId = Guid.NewGuid(),
        StartTime = DateTime.UtcNow.AddHours(2),
        Duration = 2,
        HourlyRate = 50m
    };
  
    var mockContext = new Mock<IApplicationDbContext>();
    var mockPublisher = new Mock<IEventPublisher>();
    var handler = new CreateBookingCommandHandler(mockContext.Object, mockPublisher.Object);
  
    // Act
    var result = await handler.Handle(command, CancellationToken.None);
  
    // Assert
    Assert.True(result.IsSuccess);
    Assert.NotNull(result.OrderId);
    mockPublisher.Verify(x => x.PublishAsync(It.IsAny<BookingCreatedEvent>()), Times.Once);
}

// Integration test with TestContainers
public class BookingIntegrationTest : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgis/postgis:15-3.4")
        .Build();
  
    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
        // Initialize DB schema
    }
  
    [Fact]
    public async Task Booking_EndToEnd_CompletesSuccessfully()
    {
        // Test full flow with real database
    }
}

// Load test with K6
export default function() {
    const url = 'http://api-gateway:5000/discovery/search';
    const payload = JSON.stringify({
        latitude: 40.7128,
        longitude: -74.0060,
        radius: 10,
        specialty: 'tennis'
    });
  
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${__ENV.TEST_TOKEN}`
        }
    };
  
    const res = http.post(url, payload, params);
    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 200ms': (r) => r.timings.duration < 200,
    });
}
```

### 13. CI/CD Pipeline (GitHub Actions)

```yaml
name: Build and Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-dotnet@v3
        with:
          dotnet-version: 8.0.x
      - run: dotnet test --configuration Release --collect:"XPlat Code Coverage"

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: docker/setup-buildx-action@v2
      - uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - run: |
          docker build -t ghcr.io/cue/auth-service:${{ github.sha }} ./AuthService
          docker push ghcr.io/cue/auth-service:${{ github.sha }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: azure/setup-kubectl@v3
      - uses: azure/setup-helm@v3
      - run: |
          helm upgrade --install cue ./helm \
            --set auth.image.tag=${{ github.sha }} \
            --set booking.image.tag=${{ github.sha }}
```

## DELIVERABLES EXPECTED

1. **Complete source code** following Clean Architecture
2. **Database migration scripts** with seed data
3. **Dockerfiles** for each service
4. **Kubernetes manifests** for all services
5. **Postman/OpenAPI documentation** for all APIs
6. **README.md** with setup instructions
7. **GitHub Actions workflow** for CI/CD
8. **Prometheus/Grafana dashboards** JSON

---

**Now, Copilot, generate the complete implementation following this specification. Start with the Domain layer, then Application layer, then Infrastructure, and finally the Presentation layer. Ensure all code follows SOLID principles, includes comprehensive error handling, and maintains high test coverage.**

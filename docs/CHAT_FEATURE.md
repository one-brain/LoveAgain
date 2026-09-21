# Chat Feature Implementation

## Overview

The chat feature enables real-time communication between seekers and providers for their bookings using SignalR WebSockets with REST API for message history.

## Architecture

### Backend Components

#### Domain Layer (`shared/Libraries/Cue.Domain/`)

**ChatMessage.cs**
- Message entity with order association
- Properties: OrderId, SenderId, Content, SentAt, IsRead, MessageType
- Enforces: non-empty order/sender, non-whitespace content
- `MarkRead()` method for read receipts

#### Application Layer (`shared/Libraries/Cue.Application/Chat/`)

**Queries** (`ChatQueries.cs`)
- `GetOrderMessagesQuery` - Retrieve message history with pagination
- `GetUnreadCountQuery` - Count unread messages for a user in an order
- Authorization: Only booking participants can access messages

**Commands** (`ChatCommands.cs`)
- `MarkMessagesAsReadCommand` - Mark all messages in order as read for user

#### Infrastructure Layer (`shared/Libraries/Cue.Infrastructure.Data/`)

**ChatRepository.cs**
- `GetOrderMessagesAsync` - Paginated message retrieval ordered by SentAt
- `GetUnreadCountAsync` - Count unread messages (excluding user's own)
- `MarkMessagesAsReadAsync` - Bulk update IsRead flag
- Uses EF Core `ExecuteUpdateAsync` for efficient bulk updates

#### Real-time Layer (`backend/Services/ChatService/`)

**ChatHub.cs** (SignalR Hub)
- `JoinOrder(orderId)` - Join SignalR group for an order (auth check: must be participant)
- `SendMessage(orderId, content, messageType)` - Send message to order group
- Authorization: JWT from query string (`?access_token=...`)
- Participants only: validates sender is provider or seeker
- Broadcasts to group: `ReceiveMessage` event with message DTO

**ChatController.cs** (REST API)
- `GET /api/v1/chat/orders/{orderId}/messages` - Get message history (limit/offset)
- `GET /api/v1/chat/orders/{orderId}/unread-count` - Get unread count
- `POST /api/v1/chat/orders/{orderId}/mark-read` - Mark messages as read
- JWT Bearer authentication
- Authorization: Only booking participants

**Program.cs**
- JWT authentication with SignalR support (token from query string)
- CORS for frontend origins with credentials
- Repositories: ChatRepository, BookingRepository
- SignalR hub mapping: `/hubs/chat`

### Frontend Components

#### API Layer (`frontend/src/store/chatApi.ts`)

RTK Query API slice:
- `getOrderMessages` - GET message history with pagination
- `getUnreadCount` - GET unread count
- `markMessagesAsRead` - POST mark as read
- Cache tags: `['ChatMessages']` per orderId
- Auto-invalidation on mark-as-read

#### Pages

**Chat.tsx** (new)
- SignalR connection with JWT token via query string
- Real-time message sending/receiving
- Message history loading on mount
- Auto-scroll to latest message
- Auto-mark messages as read
- Keyboard shortcut: Enter to send (Shift+Enter for newline)
- Visual distinction: own messages (orange) vs other (white)
- Time display for each message
- Empty state with icon
- Header with back navigation and booking info
- Textarea input with send button
- Connection management: auto-reconnect, cleanup on unmount

**Bookings.tsx** (updated)
- Added "💬 Chat" button for each booking
- Navigates to `/chat/{orderId}`
- Styled with hover effects

#### SignalR Integration

Using `@microsoft/signalr` package:
- WebSocket transport (skipNegotiation: true)
- Automatic reconnection on disconnect
- JWT token passed via query string for hub authentication
- Event handlers: `ReceiveMessage` → append to local state
- Hub methods: `JoinOrder`, `SendMessage`

## Chat Flow

### 1. Opening Chat

```
User clicks "Chat" button on booking
  → Navigate to /chat/{orderId}
  → Load booking details (validate user is participant)
  → Load message history via REST API
  → Establish SignalR connection
  → Join order group via hub.invoke('JoinOrder', orderId)
  → Mark messages as read
```

### 2. Sending Message

```
User types message and presses Enter
  → Call hub.invoke('SendMessage', orderId, content, messageType)
  → Hub validates sender is participant
  → Hub saves message to database
  → Hub broadcasts to group via Clients.Group(orderId).SendAsync('ReceiveMessage', dto)
  → All connected clients (seeker + provider) receive message
  → Append to local message state
  → Auto-scroll to bottom
```

### 3. Receiving Message

```
SignalR client receives 'ReceiveMessage' event
  → Append message to messages array
  → If message is from other user, mark as read via REST API
  → Trigger re-render
  → Auto-scroll to bottom
```

### 4. Message History Pagination

```
Load initial 50 messages on mount
  → GET /api/v1/chat/orders/{orderId}/messages?limit=50&offset=0
  → Display in chronological order (oldest first, newest at bottom)
  → Future: load more on scroll to top
```

## Database Schema

**chat_messages table:**
```sql
id UUID PRIMARY KEY
order_id UUID NOT NULL (FK to service_orders.id)
sender_id UUID NOT NULL (FK to users.id)
content TEXT NOT NULL
sent_at TIMESTAMP NOT NULL
is_read BOOLEAN NOT NULL DEFAULT FALSE
message_type INT NOT NULL (enum: Text=1, Image=2, Video=3, File=4)

INDEX idx_chat_messages_order_sent (order_id, sent_at)
INDEX idx_chat_messages_unread (order_id, sender_id, is_read)
```

Partitioned by order_id for scalability (noted in CLAUDE.md).

## Security

1. **Authentication**:
   - REST API: JWT Bearer token in Authorization header
   - SignalR: JWT token in query string (`?access_token=...`)
   - Token validation on every hub method call

2. **Authorization**:
   - Only booking participants (provider or seeker) can access chat
   - Validated on:
     - JoinOrder (checks ServiceOrder.ProviderId/SeekerId)
     - SendMessage (checks before saving)
     - GetOrderMessages (query handler checks)

3. **Input Validation**:
   - Content trimmed and non-empty
   - OrderId and SenderId required
   - Message length limits enforced by database column type

4. **CORS**:
   - Restricted to frontend origins (localhost:5173, localhost:3000)
   - AllowCredentials: true (for cookie/header auth)

## Message Types

Enum `MessageType`:
- **Text** (0): Plain text messages (current implementation)
- **Image** (1): Future - image URLs or base64
- **Video** (2): Future - video URLs
- **File** (3): Future - file attachments with metadata

Currently only Text is supported. Images/videos/files require integration with storage service.

## Real-time Features

### SignalR Groups

Each booking has a group: `order:{orderId}`
- Participants join group on connection
- Messages broadcast to group members only
- Group membership managed by SignalR server

### Connection Management

**Frontend:**
- Automatic reconnection on disconnect
- Connection cleanup on component unmount
- Token refresh on 401 (future)

**Backend:**
- Connection tracking per user
- Graceful disconnect handling
- Group cleanup on disconnect

## API Examples

### Get Message History

```bash
GET http://localhost:5004/api/v1/chat/orders/{orderId}/messages?limit=50&offset=0
Authorization: Bearer {JWT}
```

Response:
```json
[
  {
    "id": "a1b2c3...",
    "orderId": "e5f6g7...",
    "senderId": "i9j0k1...",
    "content": "Hello! Looking forward to our session.",
    "sentAt": "2026-09-21T14:30:00Z",
    "isRead": true,
    "messageType": "Text"
  }
]
```

### Mark as Read

```bash
POST http://localhost:5004/api/v1/chat/orders/{orderId}/mark-read
Authorization: Bearer {JWT}
```

Response: `204 No Content`

### SignalR Events

**Client → Server:**
```javascript
await connection.invoke('JoinOrder', orderId);
await connection.invoke('SendMessage', orderId, 'Hello!', 0);
```

**Server → Client:**
```javascript
connection.on('ReceiveMessage', (message) => {
  console.log(message); // { id, orderId, senderId, content, sentAt, messageType }
});
```

## UI/UX Features

1. **Message Bubbles**:
   - Own messages: orange background, right-aligned
   - Other messages: white background, left-aligned, border
   - Timestamps in smaller text
   - Max width 70% for readability

2. **Auto-scroll**:
   - Scrolls to bottom on new message
   - Smooth behavior
   - Triggered by ref on messages array change

3. **Empty State**:
   - Icon + "No messages yet" message
   - Encourages starting conversation

4. **Keyboard Shortcuts**:
   - Enter: Send message
   - Shift+Enter: New line in textarea

5. **Loading States**:
   - Loading spinner while fetching history
   - "Sending..." button state
   - Disabled input during send

6. **Error Handling**:
   - Connection errors logged to console
   - Send failures show alert
   - 404/403 errors show user-friendly message
   - Redirect to login if unauthorized

## Performance Optimizations

1. **Pagination**:
   - Load 50 messages at a time
   - Offset-based pagination for history
   - Future: infinite scroll with reverse pagination

2. **Bulk Updates**:
   - Mark-as-read uses `ExecuteUpdateAsync` (single query)
   - No N+1 queries

3. **WebSocket Efficiency**:
   - Single connection per chat
   - Binary messages for future media support
   - Auto-reconnect with backoff

4. **Database Indexing**:
   - Composite index on (order_id, sent_at) for history queries
   - Index on (order_id, sender_id, is_read) for unread counts

5. **Caching**:
   - RTK Query caches message history
   - Invalidates on mark-as-read
   - Optimistic UI updates for own messages

## Testing

### Manual Testing Checklist

Backend:
- [ ] Start ChatService on port 5004
- [ ] Connect to SignalR hub via Postman/Insomnia
- [ ] Send message via hub
- [ ] Verify message saved to database
- [ ] Get message history via REST API
- [ ] Mark messages as read
- [ ] Verify only participants can access

Frontend:
- [ ] Navigate to booking, click "Chat"
- [ ] Verify message history loads
- [ ] Send message
- [ ] Verify message appears immediately (own)
- [ ] Open same chat in incognito (different user)
- [ ] Verify message received in real-time
- [ ] Test auto-scroll
- [ ] Test Enter to send
- [ ] Test connection resilience (restart backend)

### Unit Tests (Future)

- `ChatMessageTests.cs` - Domain invariants
- `ChatRepositoryTests.cs` - Data access logic
- `GetOrderMessagesQueryHandlerTests.cs` - Authorization checks
- Frontend: Jest tests for Chat component

## Future Enhancements

1. **Rich Media**:
   - Image upload/display
   - Video embedding
   - File attachments with preview
   - Integration with Cue.Infrastructure.Storage

2. **Typing Indicators**:
   - SignalR event: `UserTyping`
   - Show "Provider is typing..." indicator

3. **Read Receipts**:
   - Display checkmarks: sent (✓), delivered (✓✓), read (✓✓ blue)
   - Track per-message read status

4. **Push Notifications**:
   - Unread message count badge
   - Browser push notifications when chat closed
   - Mobile push via Firebase (Flutter app)

5. **Message Search**:
   - Full-text search across messages
   - Filter by date range, sender, type

6. **Message Reactions**:
   - Emoji reactions (👍, ❤️, etc.)
   - Store in JSONB metadata column

7. **Message Editing/Deletion**:
   - Edit sent message (with "edited" indicator)
   - Delete message (soft delete, show "Message deleted")

8. **Presence**:
   - Show online/offline status
   - Last seen timestamp

9. **Unread Badge**:
   - Display unread count on "Chat" button
   - Persist across sessions

10. **Voice Messages**:
    - Audio recording
    - Waveform visualization
    - Playback controls

## Configuration

### ChatService appsettings.json

```json
{
  "ConnectionStrings": {
    "CueDatabase": "Host=localhost;Database=cue_db;Username=postgres;Password=..."
  },
  "Jwt": {
    "Issuer": "cue-auth",
    "Audience": "cue-platform",
    "SigningKey": "your-secret-key-here"
  }
}
```

### Frontend Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8080
```

SignalR hub URL constructed as `${VITE_API_BASE_URL}/hubs/chat`.

## Related Documentation

- [BOOKING_FEATURE.md](BOOKING_FEATURE.md) - Booking feature (chat prerequisite)
- [CONTEXT.md](../CONTEXT.md) - Domain terms and invariants
- [CLAUDE.md](../CLAUDE.md) - Project structure and patterns
- [SignalR Documentation](https://learn.microsoft.com/en-us/aspnet/core/signalr/)

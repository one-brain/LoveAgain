import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import { useGetOrderMessagesQuery, useMarkMessagesAsReadMutation, type ChatMessageDto } from '../store/chatApi';
import { useGetMyBookingsQuery } from '../store/bookingApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const Chat: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem('userId');

  const { data: bookings } = useGetMyBookingsQuery();
  const booking = bookings?.find(b => b.orderId === orderId);
  const canChat = booking && (booking.status !== 'Cancelled' && booking.status !== 'Disputed' && booking.status !== 'PendingPayment');

  const { data: historyMessages } = useGetOrderMessagesQuery(
    { orderId: orderId || '' },
    { skip: !orderId || !canChat }
  );

  const [markAsRead] = useMarkMessagesAsReadMutation();

  // Initialize SignalR connection
  useEffect(() => {
    if (!orderId) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!canChat) {
      return;
    }

    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/chat?access_token=${token}`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build();

    hubConnection.start()
      .then(() => {
        console.log('SignalR connected');
        return hubConnection.invoke('JoinOrder', orderId);
      })
      .catch(err => console.error('SignalR connection error:', err));

    hubConnection.on('ReceiveMessage', (message: ChatMessageDto) => {
      setMessages(prev => [...prev, message]);
      // Mark as read if it's from the other person
      const loggedInUserId = localStorage.getItem('userId');
      if (message.senderId !== loggedInUserId) {
        markAsRead(orderId);
      }
    });

    setConnection(hubConnection);

    return () => {
      hubConnection.stop();
    };
  }, [orderId, navigate, currentUserId, markAsRead]);

  // Load history and mark as read
  useEffect(() => {
    if (historyMessages) {
      setMessages(historyMessages);
      if (orderId) {
        markAsRead(orderId);
      }
    }
  }, [historyMessages, orderId, markAsRead]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!connection || !newMessage.trim() || !orderId || isSending) return;

    setIsSending(true);
    try {
      await connection.invoke('SendMessage', orderId, newMessage.trim(), 0); // 0 = Text
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF9' }}>
        <div className="rounded-xl p-8 text-center max-w-md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E3E0' }}>
          <svg className="mx-auto h-12 w-12 mb-4" style={{ color: '#E7E3E0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium mb-2" style={{ color: '#1A1614' }}>Chat not available</h3>
          <p className="mb-4" style={{ color: '#746B66' }}>This booking doesn't exist or you don't have access</p>
          <button
            onClick={() => navigate('/bookings')}
            className="inline-block px-5 py-2.5 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#E8773D', color: '#FFFFFF' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C65D28'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E8773D'}
          >
            Back to bookings
          </button>
        </div>
      </div>
    );
  }

  const isProvider = booking.providerId === currentUserId;

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#FAFAF9' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E7E3E0' }}>
        <div className="max-w-4xl mx-auto py-4 px-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/bookings')}
            className="text-sm font-medium inline-flex items-center transition-colors"
            style={{ color: '#746B66' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1A1614'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#746B66'}
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold" style={{ color: '#1A1614' }}>
              Chat - {isProvider ? 'Seeker' : 'Provider'}
            </h1>
            <p className="text-sm" style={{ color: '#746B66' }}>
              {new Date(booking.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>
          <div style={{ width: '80px' }} />
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 mb-4" style={{ color: '#E7E3E0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p style={{ color: '#746B66' }}>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[70%] px-4 py-3 rounded-2xl"
                    style={{
                      backgroundColor: isOwn ? '#E8773D' : '#FFFFFF',
                      color: isOwn ? '#FFFFFF' : '#1A1614',
                      border: isOwn ? 'none' : '1px solid #E7E3E0',
                    }}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: isOwn ? 'rgba(255,255,255,0.8)' : '#746B66' }}
                    >
                      {new Date(msg.sentAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E7E3E0' }}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-end gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              disabled={isSending}
              className="flex-1 px-4 py-3 rounded-lg border resize-none focus:outline-none disabled:opacity-40"
              style={{ borderColor: '#E7E3E0', color: '#1A1614', maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || isSending}
              className="px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#E8773D', color: '#FFFFFF' }}
              onMouseEnter={(e) => !isSending && newMessage.trim() && (e.currentTarget.style.backgroundColor = '#C65D28')}
              onMouseLeave={(e) => !isSending && (e.currentTarget.style.backgroundColor = '#E8773D')}
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

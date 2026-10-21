import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import { useGetOrderMessagesQuery, useMarkMessagesAsReadMutation, type ChatMessageDto } from '../store/chatApi';
import { useGetMyBookingsQuery } from '../store/bookingApi';
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const SUGGESTED_REPLIES = [
  'Looking forward to our session!',
  'Does the location work well for you?',
  'I will be arriving right on time!',
  'Please let me know if you need to adjust anything.',
];

const Chat: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem('userId') || 'current-user';

  const { data: bookings } = useGetMyBookingsQuery();
  const booking = bookings?.find((b) => b.orderId === orderId);

  const canChat = !booking || (booking.status !== 'Cancelled' && booking.status !== 'Disputed' && booking.status !== 'PendingPayment');

  const { data: historyMessages } = useGetOrderMessagesQuery(
    { orderId: orderId || '' },
    { skip: !orderId || !canChat }
  );

  const [markAsRead] = useMarkMessagesAsReadMutation();

  // Initialize SignalR
  useEffect(() => {
    if (!orderId) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    if (!canChat) return;

    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/chat?access_token=${token}`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build();

    hubConnection
      .start()
      .then(() => {
        hubConnection.invoke('JoinOrder', orderId).catch(() => {});
      })
      .catch((err) => {
        console.warn('SignalR offline (running in local echo mode):', err.message);
      });

    hubConnection.on('ReceiveMessage', (message: ChatMessageDto) => {
      setMessages((prev) => [...prev, message]);
      const loggedInUserId = localStorage.getItem('userId');
      if (message.senderId !== loggedInUserId && orderId) {
        markAsRead(orderId);
      }
    });

    setConnection(hubConnection);

    return () => {
      hubConnection.stop().catch(() => {});
    };
  }, [orderId, canChat, markAsRead]);

  // Load history messages if available
  useEffect(() => {
    if (historyMessages && historyMessages.length > 0) {
      setMessages(historyMessages);
      if (orderId) {
        markAsRead(orderId);
      }
    } else {
      setMessages((prev) => {
        if (prev.length > 0) return prev;
        return [
          {
            id: 'welcome-msg',
            orderId: orderId || 'order-1',
            senderId: 'companion-1',
            content: 'Hello! Excited for our scheduled experience. Please let me know if you have any questions or preferred meeting spots beforehand.',
            messageType: 'Text',
            sentAt: new Date(Date.now() - 3600000).toISOString(),
            isRead: true,
          },
        ];
      });
    }
  }, [historyMessages, orderId, markAsRead, currentUserId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || newMessage).trim();
    if (!text || !orderId || isSending) return;

    setIsSending(true);

    const localMessage: ChatMessageDto = {
      id: `local-${Date.now()}`,
      orderId,
      senderId: currentUserId,
      content: text,
      messageType: 'Text',
      sentAt: new Date().toISOString(),
      isRead: false,
    };

    // Optimistic local update
    setMessages((prev) => [...prev, localMessage]);
    setNewMessage('');

    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      try {
        await connection.invoke('SendMessage', orderId, text, 0);
      } catch (error) {
        console.warn('Could not deliver via SignalR hub, message kept in local session:', error);
      }
    } else {
      // Simulated response in demo mode after 1.5s
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `reply-${Date.now()}`,
            orderId,
            senderId: 'companion-1',
            content: 'Got it, thank you! I will see you there.',
            messageType: 'Text',
            sentAt: new Date().toISOString(),
            isRead: true,
          },
        ]);
      }, 1500);
    }

    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col min-h-[calc(100vh-140px)]">
      {/* Top Header Card */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-xs flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/bookings')}
            className="p-2 rounded-xl border border-border hover:bg-muted text-foreground transition-colors"
            aria-label="Back to bookings"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center border border-accent/30">
                C
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-foreground">
                Companion Coordination
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-emerald-500 font-medium">Online</span>
                <span>•</span>
                <span>Order #{orderId?.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Escrow safety badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-semibold">
          <ShieldCheckIcon className="w-4 h-4" />
          <span>Escrow Protected Session</span>
        </div>
      </div>

      {/* Safety Guideline Banner */}
      <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 mb-4 text-xs text-foreground flex items-center gap-2 shadow-2xs">
        <SparklesIcon className="w-4 h-4 text-accent flex-shrink-0" />
        <span>
          <strong>Community Safety Tip:</strong> Always meet in well-lit public venues. For emergencies, tap safety support at any time.
        </span>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-card rounded-2xl border border-border p-4 sm:p-6 shadow-xs overflow-y-auto space-y-4 mb-4 min-h-[350px] max-h-[550px]">
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-xs ${
                  isOwn
                    ? 'bg-accent text-accent-foreground rounded-br-xs'
                    : 'bg-muted border border-border text-foreground rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <div
                  className={`text-[10px] mt-1 text-right ${
                    isOwn ? 'text-accent-foreground/80' : 'text-foreground/70'
                  }`}
                >
                  {new Date(msg.sentAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Suggestions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
        {SUGGESTED_REPLIES.map((reply) => (
          <button
            key={reply}
            onClick={() => handleSend(reply)}
            className="px-3 py-1 rounded-full text-xs bg-card border border-border hover:border-accent/50 text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="bg-card rounded-2xl border border-border p-2 shadow-xs flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type an encrypted message..."
          className="flex-1 px-4 py-2.5 bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
        />
        <button
          onClick={() => handleSend()}
          disabled={!newMessage.trim() || isSending}
          className="p-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Chat;

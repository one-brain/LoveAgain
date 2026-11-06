import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import { Button, Textarea, Badge } from '@fluentui/react-components';
import {
  ArrowLeft20Regular,
  Send20Regular,
  ShieldCheckmark16Regular,
  Info16Regular,
} from '@fluentui/react-icons';
import {
  useGetOrderMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
  type ChatMessageDto,
} from '../store/chatApi';
import { useGetMyBookingsQuery } from '../store/bookingApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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

  const { data: historyMessages, refetch: refetchMessages } = useGetOrderMessagesQuery(
    { orderId: orderId || '' },
    { skip: !orderId || !canChat, pollingInterval: 2500 }
  );

  const [sendMessageMutation] = useSendMessageMutation();
  const [markAsRead] = useMarkMessagesAsReadMutation();

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
        console.warn('SignalR offline (running in real-time REST polling mode):', err.message);
      });

    hubConnection.on('ReceiveMessage', (message: ChatMessageDto) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        const filtered = prev.filter(
          (m) => !(m.id.startsWith('local-') && m.content === message.content && m.senderId === message.senderId)
        );
        return [...filtered, message];
      });
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

  useEffect(() => {
    if (historyMessages && historyMessages.length > 0) {
      setMessages((prev) => {
        const pendingLocals = prev.filter(
          (p) => p.id.startsWith('local-') && !historyMessages.some((h) => h.content === p.content)
        );
        return [...historyMessages, ...pendingLocals];
      });
      if (orderId) {
        markAsRead(orderId);
      }
    }
  }, [historyMessages, orderId, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || newMessage).trim();
    if (!text || !orderId || isSending) return;

    setIsSending(true);

    const localId = `local-${Date.now()}`;
    const localMessage: ChatMessageDto = {
      id: localId,
      orderId,
      senderId: currentUserId,
      content: text,
      messageType: 'Text',
      sentAt: new Date().toISOString(),
      isRead: false,
    };

    setMessages((prev) => [...prev, localMessage]);
    setNewMessage('');

    try {
      const res = await sendMessageMutation({ orderId, content: text, messageType: 'Text' }).unwrap();
      setMessages((prev) =>
        prev.map((m) => (m.id === localId ? res : m))
      );
      refetchMessages();
    } catch {
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        try {
          await connection.invoke('SendMessage', orderId, text, 0);
        } catch (hubError) {
          console.warn('Could not deliver via SignalR hub:', hubError);
        }
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col min-h-[calc(100vh-140px)]">
      {/* Top Header Card */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-sm flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Button
            appearance="outline"
            icon={<ArrowLeft20Regular />}
            onClick={() => navigate('/bookings')}
            aria-label="Back to bookings"
            className="min-h-11 min-w-11"
          />

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-accent-light text-brand-fg font-semibold flex items-center justify-center border border-border">
                C
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-card" />
            </div>

            <div>
              <h2 className="text-subtitle2 font-semibold text-foreground">
                Outing coordination
              </h2>
              <div className="flex items-center gap-2 text-caption1 text-muted-foreground">
                <span className="text-success font-semibold">Online</span>
                <span>•</span>
                <span className="tabular">Order #{orderId?.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Escrow safety badge */}
        <div className="hidden sm:flex">
          <Badge
            appearance="tint"
            color="warning"
            icon={<ShieldCheckmark16Regular />}
            className="bg-trust-light text-trust border border-trust-border"
          >
            Escrow protected session
          </Badge>
        </div>
      </div>

      {/* Safety Guideline Banner */}
      <div className="bg-accent-light border border-border rounded-lg p-3 mb-4 text-caption1 text-foreground flex items-center gap-2">
        <Info16Regular className="text-brand-fg shrink-0" />
        <span>
          <strong>Community safety tip:</strong> Always meet in well-lit public venues. For emergencies, tap safety support at any time.
        </span>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-card rounded-2xl border border-border p-4 sm:p-6 shadow-sm overflow-y-auto space-y-4 mb-4 min-h-[350px] max-h-[550px]">
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-2xl text-body1 shadow-sm ${
                  isOwn
                    ? 'bg-accent text-accent-foreground rounded-br-xs'
                    : 'bg-muted border border-border text-foreground rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <div
                  className={`text-caption2 mt-1 text-right tabular ${
                    isOwn ? 'text-accent-foreground/80' : 'text-muted-foreground'
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
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3">
        {SUGGESTED_REPLIES.map((reply) => (
          <Button
            key={reply}
            appearance="outline"
            size="small"
            onClick={() => handleSend(reply)}
            className="whitespace-nowrap shrink-0"
          >
            {reply}
          </Button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="bg-card rounded-2xl border border-border p-2 shadow-sm flex items-end gap-2">
        <Textarea
          rows={1}
          value={newMessage}
          onChange={(_, data) => setNewMessage(data.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type an encrypted message..."
          className="flex-1"
        />
        <Button
          appearance="primary"
          size="large"
          onClick={() => handleSend()}
          disabled={!newMessage.trim() || isSending}
          icon={<Send20Regular />}
          aria-label="Send message"
          className="min-h-11 min-w-11"
        />
      </div>
    </div>
  );
};

export default Chat;

import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface BookingSummary {
  orderId: string;
  providerId: string;
  seekerId: string;
  startTime: string;
  endTime: string;
  status: 'PendingPayment' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled' | 'Disputed';
  totalAmount: number;
}

interface BookingCardProps {
  booking: BookingSummary;
  onCancel?: (orderId: string) => void;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  PendingPayment: { bg: '#FEF3EE', text: '#C65D28', label: 'Pending Payment' },
  Confirmed: { bg: '#F0F9F1', text: '#378742', label: 'Confirmed' },
  InProgress: { bg: '#E8F4F8', text: '#2B8CB8', label: 'In Progress' },
  Completed: { bg: '#F0F9F1', text: '#378742', label: 'Completed' },
  Cancelled: { bg: '#FDF2F2', text: '#D94A4A', label: 'Cancelled' },
  Disputed: { bg: '#FEF3EE', text: '#C65D28', label: 'Disputed' },
};

function formatBookingTime(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${month} ${day}, ${year} at ${hour12}:${minutes} ${ampm}`;
}

function formatDuration(start: string, end: string): string {
  const durationMs = new Date(end).getTime() - new Date(start).getTime();
  const minutes = Math.round(durationMs / (1000 * 60));
  return `${minutes} minutes`;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onCancel,
}) => {
  const navigate = useNavigate();
  const statusStyle = statusColors[booking.status] || statusColors.PendingPayment;

  const handleChat = () => {
    navigate(`/chat/${booking.orderId}`);
  };

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-5 transition-all hover:shadow-md"
      style={{ borderColor: '#E7E3E0' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1" style={{ color: '#746B66' }}>
            Booking #{booking.orderId.slice(0, 8)}
          </p>
          <p className="text-sm font-medium" style={{ color: '#111827' }}>
            {formatBookingTime(booking.startTime)}
          </p>
        </div>
        <span
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
        >
          {statusStyle.label}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500" style={{ color: '#746B66' }}>Duration</span>
          <span className="text-sm font-medium" style={{ color: '#111827' }}>
            {formatDuration(booking.startTime, booking.endTime)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500" style={{ color: '#746B66' }}>Total</span>
          <span className="text-sm font-semibold" style={{ color: '#111827' }}>${booking.totalAmount}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleChat}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
          style={{ borderColor: '#E7E3E0' }}
        >
          Chat
        </button>
        {onCancel && (
          <button
            onClick={() => onCancel(booking.orderId)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#E7E3E0' }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;

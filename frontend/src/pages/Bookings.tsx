import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetMyBookingsQuery, useCancelBookingMutation } from '../store/bookingApi';

const STATUS_COLORS = {
  PendingPayment: { bg: '#FEF3EE', text: '#C65D28' },
  Confirmed: { bg: '#E8F5E9', text: '#2E7D32' },
  InProgress: { bg: '#E3F2FD', text: '#1565C0' },
  Completed: { bg: '#F3E5F5', text: '#6A1B9A' },
  Cancelled: { bg: '#FAFAF9', text: '#746B66' },
  Disputed: { bg: '#FFEBEE', text: '#C62828' },
};

const STATUS_LABELS = {
  PendingPayment: 'Pending payment',
  Confirmed: 'Confirmed',
  InProgress: 'In progress',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
  Disputed: 'Disputed',
};

const Bookings: React.FC = () => {
  const navigate = useNavigate();
  const { data: bookings, isLoading, isError } = useGetMyBookingsQuery();
  const [cancelBooking] = useCancelBookingMutation();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (orderId: string) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason?.trim()) return;

    try {
      setCancellingId(orderId);
      await cancelBooking({ orderId, reason }).unwrap();
      alert('Booking cancelled successfully');
    } catch (error) {
      console.error('Cancel failed:', error);
      alert('Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF9' }}>
        <div className="text-lg" style={{ color: '#746B66' }}>Loading bookings...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF9' }}>
        <div className="rounded-xl p-8 text-center max-w-md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E3E0' }}>
          <svg className="mx-auto h-12 w-12 mb-4" style={{ color: '#E7E3E0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium mb-2" style={{ color: '#1A1614' }}>Failed to load bookings</h3>
          <p className="mb-4" style={{ color: '#746B66' }}>Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF9' }}>
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E7E3E0' }}>
        <div className="max-w-6xl mx-auto py-6 px-6">
          <h1 className="text-3xl font-semibold" style={{ color: '#1A1614' }}>My Bookings</h1>
          <p className="mt-2" style={{ color: '#746B66' }}>View and manage your bookings</p>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          {!bookings || bookings.length === 0 ? (
            <div className="rounded-xl p-12 text-center" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E3E0' }}>
              <svg className="mx-auto h-16 w-16 mb-4" style={{ color: '#E7E3E0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-medium mb-2" style={{ color: '#1A1614' }}>No bookings yet</h3>
              <p className="mb-6" style={{ color: '#746B66' }}>Start exploring providers to book your first experience</p>
              <button
                onClick={() => navigate('/discovery')}
                className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#E8773D', color: '#FFFFFF' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C65D28'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E8773D'}
              >
                Discover providers
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const colors = STATUS_COLORS[booking.status];
                const canCancel = booking.status === 'PendingPayment' || booking.status === 'Confirmed';
                const startTime = new Date(booking.startTime);
                const endTime = new Date(booking.endTime);

                return (
                  <div
                    key={booking.orderId}
                    className="rounded-xl p-6"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E3E0' }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold" style={{ color: '#1A1614' }}>
                            Booking #{booking.orderId.slice(0, 8)}
                          </h3>
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: colors.bg, color: colors.text }}
                          >
                            {STATUS_LABELS[booking.status]}
                          </span>
                        </div>
                        <div className="space-y-1" style={{ color: '#746B66' }}>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>
                              {startTime.toLocaleString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>
                              Duration: {((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)).toFixed(1)} hours
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-semibold mb-1" style={{ color: '#1A1614' }}>
                          ${booking.totalAmount.toFixed(2)}
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => navigate(`/chat/${booking.orderId}`)}
                            className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                            style={{ backgroundColor: '#FEF3EE', color: '#E8773D', border: '1px solid #E8773D' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#E8773D';
                              e.currentTarget.style.color = '#FFFFFF';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#FEF3EE';
                              e.currentTarget.style.color = '#E8773D';
                            }}
                          >
                            💬 Chat
                          </button>
                          {canCancel && (
                            <button
                              onClick={() => handleCancel(booking.orderId)}
                              disabled={cancellingId === booking.orderId}
                              className="text-sm font-medium hover:underline disabled:opacity-40"
                              style={{ color: '#C62828' }}
                            >
                              {cancellingId === booking.orderId ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {booking.status === 'PendingPayment' && (
                      <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#FEF3EE' }}>
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#E8773D' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="font-medium mb-1" style={{ color: '#C65D28' }}>Payment required</p>
                            <p className="text-sm" style={{ color: '#746B66' }}>Complete payment to confirm this booking</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Bookings;

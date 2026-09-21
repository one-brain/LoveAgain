import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface CreateBookingRequest {
  providerId: string;
  startTime: string;
  endTime: string;
  hourlyRate: number;
  durationHours: number;
  meetingAddress?: string;
}

export interface CreateBookingResponse {
  orderId: string;
  totalAmount: number;
  status: 'PendingPayment' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled' | 'Disputed';
}

export interface BookingSummary {
  orderId: string;
  providerId: string;
  seekerId: string;
  startTime: string;
  endTime: string;
  status: 'PendingPayment' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled' | 'Disputed';
  totalAmount: number;
}

export interface CancelBookingRequest {
  reason: string;
}

export const bookingApi = createApi({
  reducerPath: 'bookingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1/bookings`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Bookings'],
  endpoints: (builder) => ({
    createBooking: builder.mutation<CreateBookingResponse, CreateBookingRequest>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Bookings'],
    }),
    getMyBookings: builder.query<BookingSummary[], void>({
      query: () => '',
      providesTags: ['Bookings'],
    }),
    confirmBooking: builder.mutation<void, string>({
      query: (orderId) => ({
        url: `/${orderId}/confirm`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Bookings'],
    }),
    startBooking: builder.mutation<void, string>({
      query: (orderId) => ({
        url: `/${orderId}/start`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Bookings'],
    }),
    completeBooking: builder.mutation<void, string>({
      query: (orderId) => ({
        url: `/${orderId}/complete`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Bookings'],
    }),
    cancelBooking: builder.mutation<void, { orderId: string; reason: string }>({
      query: ({ orderId, reason }) => ({
        url: `/${orderId}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Bookings'],
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useConfirmBookingMutation,
  useStartBookingMutation,
  useCompleteBookingMutation,
  useCancelBookingMutation,
} = bookingApi;

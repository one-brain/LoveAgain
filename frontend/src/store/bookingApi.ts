import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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

export interface AddServiceSpecialtyRequest {
  specialty: string;
}

export interface AddServiceSpecialtyResponse {
  specialties: string[];
}

export interface RemoveServiceSpecialtyRequest {
  specialty: string;
}

export interface RemoveServiceSpecialtyResponse {
  specialties: string[];
}

export interface ProviderIncomingBookingsResponse {
  bookings: BookingSummary[];
}

export interface SeekerOutgoingBookingsResponse {
  bookings: BookingSummary[];
}

export const bookingApi = createApi({
  reducerPath: 'bookingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Bookings', 'Profile'],
  endpoints: (builder) => ({
    createBooking: builder.mutation<CreateBookingResponse, CreateBookingRequest>({
      query: (body) => ({
        url: `/bookings`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Bookings'],
    }),
    getMyBookings: builder.query<BookingSummary[], void>({
      query: () => `/bookings/mine`,
      providesTags: ['Bookings'],
    }),
    confirmBooking: builder.mutation<void, string>({
      query: (orderId) => ({
        url: `/bookings/${orderId}/confirm`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Bookings'],
    }),
    startBooking: builder.mutation<void, string>({
      query: (orderId) => ({
        url: `/bookings/${orderId}/start`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Bookings'],
    }),
    completeBooking: builder.mutation<void, string>({
      query: (orderId) => ({
        url: `/bookings/${orderId}/complete`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Bookings'],
    }),
    cancelBooking: builder.mutation<void, { orderId: string; reason: string }>({
      query: ({ orderId, reason }) => ({
        url: `/bookings/${orderId}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Bookings'],
    }),
    // Profile Service Management
    addServiceSpecialty: builder.mutation<AddServiceSpecialtyResponse, AddServiceSpecialtyRequest>({
      query: (body) => ({
        url: `/profiles/provider/services`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    removeServiceSpecialty: builder.mutation<RemoveServiceSpecialtyResponse, RemoveServiceSpecialtyRequest>({
      query: (body) => ({
        url: `/profiles/provider/services`,
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    // Booking History
    getProviderIncomingBookings: builder.query<ProviderIncomingBookingsResponse, string>({
      query: (providerId) => `/bookings/provider/incoming/${providerId}`,
      providesTags: ['Bookings'],
    }),
    getSeekerOutgoingBookings: builder.query<SeekerOutgoingBookingsResponse, string>({
      query: (seekerId) => `/bookings/seeker/outgoing/${seekerId}`,
      providesTags: ['Bookings'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useConfirmBookingMutation,
  useStartBookingMutation,
  useCompleteBookingMutation,
  useCancelBookingMutation,
  useAddServiceSpecialtyMutation,
  useRemoveServiceSpecialtyMutation,
  useGetProviderIncomingBookingsQuery,
  useGetSeekerOutgoingBookingsQuery,
} = bookingApi;

// Re-export profile hooks for convenience
export { useGetMyProfileQuery } from './api';
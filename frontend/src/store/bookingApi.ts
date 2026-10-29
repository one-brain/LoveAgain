import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';



export interface BookingRequirementsDto {
  activity?: string;
  activityName?: string;
  dressCode?: string;
  transportMode?: string;
  dietPreference?: string;
  equipmentGear?: string;
  languagePreference?: string;
  specialNotes?: string;
}

export interface CreateBookingRequest {
  providerId: string;
  startTime: string;
  endTime: string;
  hourlyRate: number;
  durationHours: number;
  meetingAddress?: string;
  requirements?: BookingRequirementsDto;
}

export interface CreateBookingResponse {
  orderId: string;
  totalAmount: number;
  status: 'PendingPayment' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled' | 'Disputed';
}

export interface UpdateBookingRequest {
  orderId: string;
  meetingAddress?: string;
  startTime?: string;
  endTime?: string;
  durationHours?: number;
  requirements?: BookingRequirementsDto;
}

export interface BookingSummary {
  orderId: string;
  providerId: string;
  seekerId: string;
  startTime: string;
  endTime: string;
  status: 'PendingPayment' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled' | 'Disputed';
  totalAmount: number;
  platformFee?: number;
  providerEarnings?: number;
  meetingAddress?: string;
  requirements?: BookingRequirementsDto;
  checkInPin?: string;
  checkedInAt?: string;
  cancellationReason?: string;
  createdAt?: string;
  updatedAt?: string;
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
  baseQuery: baseQueryWithReauth,
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
    updateBooking: builder.mutation<BookingSummary, UpdateBookingRequest>({
      query: ({ orderId, ...body }) => ({
        url: `/bookings/${orderId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Bookings'],
    }),
    getMyBookings: builder.query<BookingSummary[], void>({
      query: () => `/bookings`,
      transformResponse: (res: any) => (Array.isArray(res) ? res : res?.bookings || []),
      providesTags: ['Bookings'],
    }),
    confirmBooking: builder.mutation<void, string>({
      query: (orderId) => ({
        url: `/bookings/${orderId}/confirm`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Bookings'],
    }),
    checkInBooking: builder.mutation<void, { orderId: string; pin: string }>({
      query: ({ orderId, pin }) => ({
        url: `/bookings/${orderId}/checkin`,
        method: 'PATCH',
        body: { pin },
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
        url: `/profiles/provider/services/${encodeURIComponent(body.specialty)}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Profile'],
    }),
    // Booking History
    getProviderIncomingBookings: builder.query<ProviderIncomingBookingsResponse, string>({
      query: (providerId) => `/bookings/provider/incoming/${providerId}`,
      transformResponse: (res: any) => ({
        bookings: Array.isArray(res) ? res : res?.bookings || [],
      }),
      providesTags: ['Bookings'],
    }),
    getSeekerOutgoingBookings: builder.query<SeekerOutgoingBookingsResponse, string>({
      query: (seekerId) => `/bookings/seeker/outgoing/${seekerId}`,
      transformResponse: (res: any) => ({
        bookings: Array.isArray(res) ? res : res?.bookings || [],
      }),
      providesTags: ['Bookings'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useGetMyBookingsQuery,
  useConfirmBookingMutation,
  useCheckInBookingMutation,
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
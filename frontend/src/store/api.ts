import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface ProviderProfile {
  userId: string;
  specialties: string[];
  hourlyRate: number;
  bio: string;
  maxRadiusKm: number;
  isActive: boolean;
  averageRating: number;
  introVideoUrl?: string;
}

export interface ProviderProfileResponse {
  profile: ProviderProfile;
}

export interface AvailabilitySlot {
  id: string;
  providerId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookingId?: string;
}

export const profileApi = createApi({
  reducerPath: 'profileApi',
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
  tagTypes: ['Profile', 'Availability'],
  endpoints: (builder) => ({
    getMyProfile: builder.query<ProviderProfileResponse, void>({
      query: () => `/profiles/provider`,
      providesTags: ['Profile'],
    }),
    getSlots: builder.query<AvailabilitySlot[], string>({
      query: (providerId) => `/profiles/provider/slots/${providerId}`,
      providesTags: ['Availability'],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useGetSlotsQuery,
} = profileApi;
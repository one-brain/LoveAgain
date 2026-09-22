import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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

export interface SeekerProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  dateOfBirth: string | null;
  photoUrl: string | null;
  isVerified: boolean;
  trustScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface SeekerProfileResponse {
  profile: SeekerProfile;
}

export interface UpdateSeekerProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  dateOfBirth?: string | null;
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
    getSeekerProfile: builder.query<SeekerProfileResponse, void>({
      query: () => `/profiles/me`,
      providesTags: ['Profile'],
      transformResponse: (response: any) => {
        return {
          ...response,
          profile: {
            ...response.profile,
            specialties: response.profile?.specialties || [],
          },
        };
      },
    }),
    updateSeekerProfile: builder.mutation<SeekerProfileResponse, UpdateSeekerProfileRequest>({
      query: (body) => ({
        url: `/profiles/me`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    getSlots: builder.query<AvailabilitySlot[], string>({
      query: (providerId) => `/profiles/provider/slots/${providerId}`,
      providesTags: ['Availability'],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useGetSeekerProfileQuery,
  useUpdateSeekerProfileMutation,
  useGetSlotsQuery,
} = profileApi;
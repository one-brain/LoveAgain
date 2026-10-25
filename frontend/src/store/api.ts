import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface ProviderProfile {
  userId: string;
  displayName?: string;
  profileImages?: string[];
  specialties: string[];
  hourlyRate: number;
  bio: string;
  maxRadiusKm: number;
  isActive: boolean;
  status?: 'Draft' | 'PendingReview' | 'Approved' | 'Rejected' | 'Suspended';
  idProofUrl?: string;
  selfieVerificationUrl?: string;
  rejectionReason?: string;
  averageRating: number;
  introVideoUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ProviderProfileResponse {
  profile: ProviderProfile;
}

export interface UpdateProviderLocationRequest {
  latitude: number;
  longitude: number;
  maxRadiusKm?: number;
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

export interface UpdateProviderProfileRequest {
  userId?: string;
  HourlyRate: number;
  Bio: string;
  Specialties: string[];
  MaxRadiusKm: number;
  IntroVideoUrl?: string;
  DisplayName?: string;
  ProfileImages?: string[];
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
      if (token && token !== 'demo-jwt-token-12345') {
        headers.set('Authorization', `Bearer ${token}`);
      }
      const userId = localStorage.getItem('userId');
      if (userId) {
        headers.set('X-User-Id', userId);
      }
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          if (parsed?.id) headers.set('X-User-Id', String(parsed.id));
          if (parsed?.email) headers.set('X-User-Email', String(parsed.email));
        } catch {
          // ignore JSON parse error
        }
      }
      return headers;
    },
  }),
  tagTypes: ['Profile', 'Availability'],
  endpoints: (builder) => ({
    getMyProfile: builder.query<ProviderProfileResponse, void>({
      query: () => `/profiles/provider`,
      providesTags: ['Profile'],
      transformResponse: (response: any) => {
        if (response && !response.profile) {
          return { profile: response };
        }
        return response;
      },
    }),
    getSeekerProfile: builder.query<SeekerProfileResponse, void>({
      query: () => `/profiles/me`,
      providesTags: ['Profile'],
      transformResponse: (response: any) => {
        const raw = response?.profile ?? response ?? {};
        return {
          profile: {
            userId: raw.userId || raw.id || '',
            email: raw.email || '',
            firstName: raw.firstName || '',
            lastName: raw.lastName || '',
            phone: raw.phone || null,
            dateOfBirth: raw.dateOfBirth || null,
            photoUrl: raw.photoUrl || null,
            isVerified: raw.isVerified ?? false,
            trustScore: raw.trustScore ?? 50,
            createdAt: raw.createdAt || '',
            updatedAt: raw.updatedAt || '',
            specialties: raw.specialties || [],
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
    uploadSeekerPhoto: builder.mutation<SeekerProfileResponse, FormData>({
      query: (formData) => ({
        url: `/profiles/me/photo`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Profile'],
    }),
    uploadCompanionPhoto: builder.mutation<{ photoUrl: string }, FormData>({
      query: (formData) => ({
        url: `/profiles/provider/upload-photo`,
        method: 'POST',
        body: formData,
      }),
    }),
    getSlots: builder.query<AvailabilitySlot[], string>({
      query: (providerId) => `/profiles/provider/slots/${providerId}`,
      providesTags: ['Availability'],
    }),
    updateProviderProfile: builder.mutation<ProviderProfileResponse, UpdateProviderProfileRequest>({
      query: (profileData) => ({
        url: `/profiles/provider`,
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Profile'],
    }),
    deleteProviderProfile: builder.mutation<void, void>({
      query: () => ({
        url: `/profiles/provider`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Profile'],
    }),
    activateProfile: builder.mutation<void, { active: boolean }>({
      query: (body) => ({
        url: `/profiles/provider/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    updateProviderLocation: builder.mutation<ProviderProfileResponse, UpdateProviderLocationRequest>({
      query: (body) => ({
        url: `/profiles/provider/location`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useGetSeekerProfileQuery,
  useUpdateSeekerProfileMutation,
  useUploadSeekerPhotoMutation,
  useUploadCompanionPhotoMutation,
  useGetSlotsQuery,
  useUpdateProviderProfileMutation,
  useDeleteProviderProfileMutation,
  useActivateProfileMutation,
  useUpdateProviderLocationMutation,
} = profileApi;

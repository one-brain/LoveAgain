import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';



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
  gender?: string;
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
  gender?: string | null;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
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

export interface UserKycDocument {
  id?: string;
  userId: string;
  documentType?: string;
  documentNumberMasked?: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  selfieImageUrl?: string;
  status: 'NotSubmitted' | 'PendingReview' | 'Approved' | 'Rejected';
  rejectionReason?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
}

export interface UpdateSeekerProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
}

export interface AvailabilitySlot {
  id: string;
  providerId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookingId?: string;
}

export interface SubmitSupportTicketRequest {
  category?: string;
  bookingId?: string;
  subject: string;
  message: string;
  email?: string;
}

export interface SupportTicketResponse {
  ticketId: string;
  category: string;
  subject: string;
  status: string;
  createdAt: string;
}

export interface TriggerEmergencySosRequest {
  bookingId?: string;
  companionName?: string;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  reason?: string;
}

export interface EmergencySosResponse {
  incidentId: string;
  bookingId?: string;
  status: string;
  dispatchedAt: string;
  message: string;
}

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Profile', 'Availability', 'Kyc'],
  endpoints: (builder) => ({
    getMyKyc: builder.query<UserKycDocument, void>({
      query: () => `/profiles/me/kyc`,
      providesTags: ['Kyc'],
    }),
    submitMyKyc: builder.mutation<UserKycDocument, FormData>({
      query: (formData) => ({
        url: `/profiles/me/kyc`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Kyc', 'Profile'],
    }),
    getMyProfile: builder.query<ProviderProfileResponse, void>({
      query: () => `/profiles/provider`,
      providesTags: ['Profile'],
      transformResponse: (response: any) => {
        const STATUS_MAP: Record<string, any> = {
          '1': 'Draft',
          '2': 'PendingReview',
          '3': 'Approved',
          '4': 'Rejected',
          '5': 'Suspended',
          Draft: 'Draft',
          PendingReview: 'PendingReview',
          Approved: 'Approved',
          Rejected: 'Rejected',
          Suspended: 'Suspended',
        };
        const prof = response?.profile ?? response;
        if (!prof) return { profile: null as any };
        const mappedStatus = STATUS_MAP[String(prof.status)] || prof.status || 'Draft';
        return {
          profile: {
            ...prof,
            status: mappedStatus,
          },
        };
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
            gender: raw.gender ?? null,
            isEmailVerified: raw.isEmailVerified ?? false,
            isPhoneVerified: raw.isPhoneVerified ?? false,
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
            gender: raw.gender ?? null,
            isEmailVerified: raw.isEmailVerified ?? false,
            isPhoneVerified: raw.isPhoneVerified ?? false,
            createdAt: raw.createdAt || '',
            updatedAt: raw.updatedAt || '',
            specialties: raw.specialties || [],
          },
        };
      },
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
    deleteSeekerPhoto: builder.mutation<SeekerProfileResponse, void>({
      query: () => ({
        url: `/profiles/me/photo`,
        method: 'DELETE',
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
    getSlots: builder.query<AvailabilitySlot[], string | void>({
      query: () => `/profiles/provider/availability`,
      providesTags: ['Availability'],
    }),
    createSlot: builder.mutation<AvailabilitySlot, { startTime: string; endTime: string }>({
      query: (body) => ({
        url: `/profiles/provider/availability`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Availability'],
    }),
    deleteSlot: builder.mutation<void, string>({
      query: (slotId) => ({
        url: `/profiles/provider/availability/${slotId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Availability'],
    }),
    deleteMyAccount: builder.mutation<void, void>({
      query: () => ({
        url: `/profiles/me`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Profile'],
    }),
    submitSupportTicket: builder.mutation<SupportTicketResponse, SubmitSupportTicketRequest>({
      query: (body) => ({
        url: `/support/tickets`,
        method: 'POST',
        body,
      }),
    }),
    triggerEmergencySos: builder.mutation<EmergencySosResponse, TriggerEmergencySosRequest>({
      query: (body) => ({
        url: `/support/sos`,
        method: 'POST',
        body,
      }),
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
    activateProfile: builder.mutation<ProviderProfileResponse, { active: boolean }>({
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
    sendEmailOtp: builder.mutation<{ message: string; expiresInSeconds: number; devOtp?: string }, void>({
      query: () => ({
        url: `/profiles/me/email/send-otp`,
        method: 'POST',
      }),
    }),
    verifyEmailOtp: builder.mutation<SeekerProfileResponse, { otp: string }>({
      query: (body) => ({
        url: `/profiles/me/email/verify-otp`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    sendPhoneOtp: builder.mutation<{ message: string; expiresInSeconds: number; devOtp?: string }, void>({
      query: () => ({
        url: `/profiles/me/phone/send-otp`,
        method: 'POST',
      }),
    }),
    verifyPhoneOtp: builder.mutation<SeekerProfileResponse, { otp: string }>({
      query: (body) => ({
        url: `/profiles/me/phone/verify-otp`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const {
  useGetMyKycQuery,
  useSubmitMyKycMutation,
  useGetMyProfileQuery,
  useGetSeekerProfileQuery,
  useUpdateSeekerProfileMutation,
  useUploadSeekerPhotoMutation,
  useDeleteSeekerPhotoMutation,
  useUploadCompanionPhotoMutation,
  useGetSlotsQuery,
  useCreateSlotMutation,
  useDeleteSlotMutation,
  useDeleteMyAccountMutation,
  useSubmitSupportTicketMutation,
  useTriggerEmergencySosMutation,
  useUpdateProviderProfileMutation,
  useDeleteProviderProfileMutation,
  useActivateProfileMutation,
  useUpdateProviderLocationMutation,
  useSendEmailOtpMutation,
  useVerifyEmailOtpMutation,
  useSendPhoneOtpMutation,
  useVerifyPhoneOtpMutation,
} = profileApi;

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface CompanionApplicationRequest {
  hourlyRate: number;
  bio: string;
  specialties: string[];
  maxRadiusKm: number;
  idProofUrl?: string;
  selfieVerificationUrl?: string;
  upiId?: string;
  introVideoUrl?: string;
}

export interface AdminVerificationItem {
  profileId: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  hourlyRate: number;
  bio: string;
  specialties: string[];
  status: 'Draft' | 'PendingReview' | 'Approved' | 'Rejected' | 'Suspended';
  idProofUrl?: string;
  selfieVerificationUrl?: string;
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface AdminUserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  photoUrl?: string;
  isVerified: boolean;
  trustScore: number;
  roles: string[];
  hasCompanionProfile: boolean;
  companionStatus?: 'Draft' | 'PendingReview' | 'Approved' | 'Rejected' | 'Suspended';
  createdAt: string;
}

export interface PlatformMisReport {
  totalGmv: number;
  totalPlatformRevenue: number;
  activeEscrowLocked: number;
  totalPayoutsCompleted: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  disputedBookings: number;
  completionRatePercent: number;
  dailyTrends: {
    date: string;
    gmv: number;
    revenue: number;
    bookingsCount: number;
  }[];
  topSpecialties: {
    specialty: string;
    bookingsCount: number;
    totalVolume: number;
  }[];
}

export interface AdminPayoutItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  feeAmount: number;
  payoutType: string;
  destination: string;
  status: string;
  razorpayPayoutId?: string;
  createdAt: string;
  processedAt?: string;
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('cue_token') || sessionStorage.getItem('cue_token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Verifications', 'AdminUsers', 'AdminMis', 'AdminPayouts', 'Profile'],
  endpoints: (builder) => ({
    applyCompanion: builder.mutation<any, CompanionApplicationRequest>({
      query: (body) => ({
        url: '/profiles/provider/apply',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Profile', 'Verifications'],
    }),

    getAdminVerifications: builder.query<AdminVerificationItem[], { status?: string }>({
      query: (params) => ({
        url: '/admin/verifications',
        params,
      }),
      providesTags: ['Verifications'],
    }),

    approveVerification: builder.mutation<{ message: string }, string>({
      query: (profileId) => ({
        url: `/admin/verifications/${profileId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['Verifications', 'AdminUsers', 'AdminMis'],
    }),

    rejectVerification: builder.mutation<{ message: string }, { profileId: string; reason: string }>({
      query: ({ profileId, reason }) => ({
        url: `/admin/verifications/${profileId}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Verifications', 'AdminUsers'],
    }),

    getAdminUsers: builder.query<AdminUserItem[], { search?: string }>({
      query: (params) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: ['AdminUsers'],
    }),

    getAdminMis: builder.query<PlatformMisReport, void>({
      query: () => '/payments/admin/mis',
      providesTags: ['AdminMis'],
    }),

    getAdminPayouts: builder.query<AdminPayoutItem[], void>({
      query: () => '/payments/admin/payouts',
      providesTags: ['AdminPayouts'],
    }),

    processAdminPayout: builder.mutation<{ message: string }, { payoutId: string; utrReference?: string }>({
      query: ({ payoutId, utrReference }) => ({
        url: `/payments/admin/payouts/${payoutId}/process`,
        method: 'POST',
        body: { utrReference },
      }),
      invalidatesTags: ['AdminPayouts', 'AdminMis'],
    }),
  }),
});

export const {
  useApplyCompanionMutation,
  useGetAdminVerificationsQuery,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
  useGetAdminUsersQuery,
  useGetAdminMisQuery,
  useGetAdminPayoutsQuery,
  useProcessAdminPayoutMutation,
} = adminApi;

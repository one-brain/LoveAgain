import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { discoveryApi } from './discoveryApi';

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
  displayName?: string;
  profileImages?: string[];
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

export interface AdminBookingLedgerItem {
  id?: string;
  bookingId?: string;
  seekerId: string;
  seekerName: string;
  providerId: string;
  providerName: string;
  status: string;
  totalAmount: number;
  platformFee: number;
  providerEarnings: number;
  startTime: string;
  endTime: string;
  createdAt: string;
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
      const token =
        localStorage.getItem('accessToken') ||
        localStorage.getItem('cue_token') ||
        sessionStorage.getItem('cue_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      const userId = localStorage.getItem('userId');
      if (userId) {
        headers.set('X-User-Id', userId);
      }
      const userStr =
        localStorage.getItem('user') ||
        sessionStorage.getItem('user') ||
        localStorage.getItem('cue_user') ||
        sessionStorage.getItem('cue_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user?.id) headers.set('X-User-Id', String(user.id));
          if (user?.email) headers.set('X-User-Email', String(user.email));
        } catch {
          // ignore parsing error
        }
      }
      return headers;
    },
  }),
  tagTypes: ['Verifications', 'AdminUsers', 'AdminMis', 'AdminPayouts', 'AdminBookings', 'Profile'],
  endpoints: (builder) => ({
    applyCompanion: builder.mutation<any, CompanionApplicationRequest>({
      query: (body) => ({
        url: '/profiles/provider/apply',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Profile', 'Verifications'],
    }),

    getAdminVerifications: builder.query<AdminVerificationItem[], { status?: string } | void>({
      query: (params) => ({
        url: '/admin/verifications',
        params: params || undefined,
      }),
      transformResponse: (response: any[]) => {
        const STATUS_MAP: Record<string, AdminVerificationItem['status']> = {
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
        return (response || []).map((item) => ({
          ...item,
          status: STATUS_MAP[String(item.status)] || (item.status as any) || 'PendingReview',
        }));
      },
      providesTags: ['Verifications'],
    }),

    approveVerification: builder.mutation<{ message: string }, string>({
      query: (profileId) => ({
        url: `/admin/verifications/${profileId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['Verifications', 'AdminUsers', 'AdminMis'],
      async onQueryStarted(profileId, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          try {
            const raw = localStorage.getItem('cue_rejected_provider_ids');
            if (raw) {
              const rejected = JSON.parse(raw).filter((id: string) => id !== profileId);
              localStorage.setItem('cue_rejected_provider_ids', JSON.stringify(rejected));
            }
          } catch {}
          dispatch(discoveryApi.util.resetApiState());
        } catch {}
      },
    }),

    rejectVerification: builder.mutation<{ message: string }, { profileId: string; reason: string }>({
      query: ({ profileId, reason }) => ({
        url: `/admin/verifications/${profileId}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Verifications', 'AdminUsers'],
      async onQueryStarted({ profileId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          try {
            const raw = localStorage.getItem('cue_rejected_provider_ids');
            const rejected = raw ? JSON.parse(raw) : [];
            if (!rejected.includes(profileId)) {
              rejected.push(profileId);
              localStorage.setItem('cue_rejected_provider_ids', JSON.stringify(rejected));
            }
          } catch {}
          dispatch(discoveryApi.util.resetApiState());
        } catch {}
      },
    }),

    getAdminUsers: builder.query<AdminUserItem[], { search?: string }>({
      query: (params) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: ['AdminUsers'],
    }),

    toggleUserSuspend: builder.mutation<{ message: string; isSuspended: boolean }, string>({
      query: (userId) => ({
        url: `/admin/users/${userId}/toggle-suspend`,
        method: 'POST',
      }),
      invalidatesTags: ['AdminUsers', 'Verifications', 'Profile'],
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

    getAdminBookings: builder.query<AdminBookingLedgerItem[], { status?: string } | void>({
      query: (params) => ({
        url: '/admin/bookings',
        params: params || {},
      }),
      transformResponse: (response: (AdminBookingLedgerItem & { id?: string })[]) => {
        return (response || []).map((item) => ({
          ...item,
          bookingId: item.bookingId || item.id || '',
          status: item.status || 'Pending',
          seekerName: item.seekerName || 'Seeker',
          providerName: item.providerName || 'Companion',
        }));
      },
      providesTags: ['AdminBookings'],
    }),

    changeAdminPassword: builder.mutation<{ message: string }, { currentPassword: string; newPassword: string }>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useApplyCompanionMutation,
  useGetAdminVerificationsQuery,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
  useGetAdminUsersQuery,
  useToggleUserSuspendMutation,
  useGetAdminMisQuery,
  useGetAdminPayoutsQuery,
  useProcessAdminPayoutMutation,
  useGetAdminBookingsQuery,
  useChangeAdminPasswordMutation,
} = adminApi;


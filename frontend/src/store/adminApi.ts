import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';
import { discoveryApi } from './discoveryApi';
import { profileApi } from './api';

export interface CompanionApplicationRequest {
  hourlyRate: number;
  bio: string;
  specialties: string[];
  maxRadiusKm: number;
  idProofUrl?: string;
  selfieVerificationUrl?: string;
  upiId?: string;
  introVideoUrl?: string;
  displayName?: string;
  profileImages?: string[];
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

export interface AdminKycVerificationItem {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  documentType: string;
  documentNumberMasked: string;
  frontImageUrl: string;
  backImageUrl: string;
  selfieImageUrl: string;
  status: 'PendingReview' | 'Approved' | 'Rejected';
  rejectionReason?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
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

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function normalizePagedResult<T>(response: any, defaultPage = 1, defaultPageSize = 20): PagedResult<T> {
  if (!response) {
    return { items: [], totalCount: 0, page: defaultPage, pageSize: defaultPageSize, totalPages: 1 };
  }
  if (Array.isArray(response)) {
    return {
      items: response,
      totalCount: response.length,
      page: defaultPage,
      pageSize: defaultPageSize,
      totalPages: Math.max(1, Math.ceil(response.length / defaultPageSize)),
    };
  }
  const items = Array.isArray(response.items) ? response.items : [];
  const totalCount = typeof response.totalCount === 'number' ? response.totalCount : items.length;
  const page = typeof response.page === 'number' ? response.page : defaultPage;
  const pageSize = typeof response.pageSize === 'number' ? response.pageSize : defaultPageSize;
  const totalPages = typeof response.totalPages === 'number' ? response.totalPages : Math.max(1, Math.ceil(totalCount / pageSize));
  return { items, totalCount, page, pageSize, totalPages };
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
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Verifications', 'KycVerifications', 'AdminUsers', 'AdminMis', 'AdminPayouts', 'AdminBookings', 'Profile'],
  endpoints: (builder) => ({
    getAdminKycVerifications: builder.query<PagedResult<AdminKycVerificationItem>, { status?: number; page?: number; pageSize?: number } | void>({
      query: (params) => ({
        url: '/admin/kyc-verifications',
        params: params || undefined,
      }),
      transformResponse: (response: any) => normalizePagedResult<AdminKycVerificationItem>(response),
      providesTags: ['KycVerifications'],
    }),

    approveAdminKyc: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/admin/kyc-verifications/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['KycVerifications', 'AdminUsers', 'Verifications'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(profileApi.util.invalidateTags(['Profile', 'Kyc']));
        } catch {}
      },
    }),

    rejectAdminKyc: builder.mutation<{ message: string }, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/kyc-verifications/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['KycVerifications', 'AdminUsers', 'Verifications'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(profileApi.util.invalidateTags(['Profile', 'Kyc']));
        } catch {}
      },
    }),

    applyCompanion: builder.mutation<any, CompanionApplicationRequest>({
      query: (body) => ({
        url: '/profiles/provider/apply',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Profile', 'Verifications'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(profileApi.util.invalidateTags(['Profile']));
        } catch {}
      },
    }),

    getAdminVerifications: builder.query<PagedResult<AdminVerificationItem>, { status?: string; page?: number; pageSize?: number } | void>({
      query: (params) => ({
        url: '/admin/verifications',
        params: params || undefined,
      }),
      transformResponse: (response: any) => {
        const paged = normalizePagedResult<AdminVerificationItem>(response);
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
        const mappedItems = paged.items.map((item) => ({
          ...item,
          status: STATUS_MAP[String(item.status)] || (item.status as any) || 'PendingReview',
        }));
        return {
          ...paged,
          items: mappedItems,
        };
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

    getAdminUsers: builder.query<PagedResult<AdminUserItem>, { search?: string; page?: number; pageSize?: number } | void>({
      query: (params) => ({
        url: '/admin/users',
        params: params || undefined,
      }),
      transformResponse: (response: any) => normalizePagedResult<AdminUserItem>(response),
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

    getAdminPayouts: builder.query<PagedResult<AdminPayoutItem>, { page?: number; pageSize?: number } | void>({
      query: (params) => ({
        url: '/payments/admin/payouts',
        params: params || undefined,
      }),
      transformResponse: (response: any) => normalizePagedResult<AdminPayoutItem>(response),
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

    getAdminBookings: builder.query<PagedResult<AdminBookingLedgerItem>, { status?: string; page?: number; pageSize?: number } | void>({
      query: (params) => ({
        url: '/admin/bookings',
        params: params || {},
      }),
      transformResponse: (response: any) => {
        const paged = normalizePagedResult<AdminBookingLedgerItem & { id?: string }>(response);
        const mappedItems: AdminBookingLedgerItem[] = paged.items.map((item) => ({
          ...item,
          bookingId: item.bookingId || item.id || '',
          status: item.status || 'Pending',
          seekerName: item.seekerName || 'Seeker',
          providerName: item.providerName || 'Companion',
        }));
        return {
          ...paged,
          items: mappedItems,
        };
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
  useGetAdminKycVerificationsQuery,
  useApproveAdminKycMutation,
  useRejectAdminKycMutation,
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


import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithReauth } from './baseQueryWithReauth';
import { discoveryApi } from './discoveryApi';
import { profileApi } from './api';

export interface ReviewDto {
  id: string;
  orderId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerPhotoUrl?: string | null;
  revieweeId: string;
  rating: number;
  comment: string;
  timelinessScore?: number | null;
  communicationScore?: number | null;
  createdAt: string;
}

export interface SubmitReviewRequest {
  orderId: string;
  rating: number;
  comment: string;
  timelinessScore?: number;
  communicationScore?: number;
}

export interface ProviderReviewsResponse {
  items: ReviewDto[];
  averageRating: number;
  totalReviews: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BookingReviewStatusResponse {
  canReview: boolean;
  hasReviewed: boolean;
  myReview?: ReviewDto | null;
  ineligibleReason?: string | null;
}

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: createBaseQueryWithReauth('/api/v1/reviews'),
  tagTypes: ['Reviews', 'BookingReviewStatus'],
  endpoints: (builder) => ({
    getProviderReviews: builder.query<ProviderReviewsResponse, { providerId: string; page?: number; pageSize?: number }>({
      query: ({ providerId, page = 1, pageSize = 10 }) => ({
        url: `/provider/${providerId}`,
        params: { page, pageSize },
      }),
      providesTags: (_res, _err, { providerId }) => [{ type: 'Reviews', id: providerId }],
    }),

    getBookingReviewStatus: builder.query<BookingReviewStatusResponse, string>({
      query: (orderId) => `/booking/${orderId}/status`,
      providesTags: (_res, _err, orderId) => [{ type: 'BookingReviewStatus', id: orderId }],
    }),

    submitReview: builder.mutation<ReviewDto, SubmitReviewRequest>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: 'BookingReviewStatus', id: arg.orderId },
        'Reviews',
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate discovery and provider profile caches so new average rating displays instantly
          dispatch(discoveryApi.util.resetApiState());
          dispatch(profileApi.util.invalidateTags(['Profile']));
        } catch {}
      },
    }),
  }),
});

export const {
  useGetProviderReviewsQuery,
  useGetBookingReviewStatusQuery,
  useSubmitReviewMutation,
} = reviewApi;


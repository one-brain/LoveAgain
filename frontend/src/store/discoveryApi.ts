import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const discoveryApi = createApi({
  reducerPath: 'discoveryApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  endpoints: (builder) => ({
    listProviders: builder.query<
      Array<{
        providerId: string;
        displayName: string;
        photoUrl: string | null;
        hourlyRate: number;
        bio: string;
        specialties: string[];
        averageRating: number;
        isVerified: boolean;
        trustScore: number;
      }>,
      { q?: string; specialty?: string; minRate?: number; maxRate?: number; sortBy?: string; page?: number; pageSize?: number }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.q) searchParams.set('q', params.q);
        if (params.specialty) searchParams.set('specialty', params.specialty);
        if (params.minRate != null) searchParams.set('minRate', String(params.minRate));
        if (params.maxRate != null) searchParams.set('maxRate', String(params.maxRate));
        if (params.sortBy) searchParams.set('sortBy', params.sortBy);
        if (params.page) searchParams.set('page', String(params.page));
        if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
        return { url: `/discovery/providers?${searchParams.toString()}` };
      },
    }),
    getProvider: builder.query<
      {
        providerId: string;
        displayName: string;
        photoUrl: string | null;
        hourlyRate: number;
        bio: string;
        specialties: string[];
        maxRadiusKm: number;
        introVideoUrl: string | null;
        averageRating: number;
        isVerified: boolean;
        trustScore: number;
        upcomingSlots: Array<{ slotId: string; startTime: string; endTime: string; isBooked: boolean }>;
      },
      string
    >({
      query: (userId) => `/discovery/providers/${userId}`,
    }),
  }),
});

export const { useListProvidersQuery, useGetProviderQuery } = discoveryApi;

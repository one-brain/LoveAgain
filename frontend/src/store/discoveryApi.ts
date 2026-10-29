import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQueryWithReauth } from './baseQueryWithReauth';

export const discoveryApi = createApi({
  reducerPath: 'discoveryApi',
  baseQuery: createBaseQueryWithReauth('/api/v1'),
  tagTypes: ['DiscoveryProviders'],
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
        distanceKm: number | null;
        profileImages?: string[];
        latitude?: number | null;
        longitude?: number | null;
        gender?: string | null;
        city?: string | null;
        area?: string | null;
      }>,
      {
        q?: string;
        specialty?: string;
        minRate?: number;
        maxRate?: number;
        sortBy?: string;
        latitude?: number;
        longitude?: number;
        radiusKm?: number;
        page?: number;
        pageSize?: number;
        gender?: string;
        city?: string;
      }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.q) searchParams.set('q', params.q);
        if (params.specialty) searchParams.set('specialty', params.specialty);
        if (params.minRate != null) searchParams.set('minRate', String(params.minRate));
        if (params.maxRate != null) searchParams.set('maxRate', String(params.maxRate));
        if (params.sortBy) searchParams.set('sortBy', params.sortBy);
        if (params.latitude != null) searchParams.set('latitude', String(params.latitude));
        if (params.longitude != null) searchParams.set('longitude', String(params.longitude));
        if (params.radiusKm != null) searchParams.set('radiusKm', String(params.radiusKm));
        if (params.page) searchParams.set('page', String(params.page));
        searchParams.set('pageSize', String(params.pageSize || 120));
        if (params.gender && params.gender !== 'all') searchParams.set('gender', params.gender);
        if (params.city && params.city !== 'all') searchParams.set('city', params.city);
        return { url: `/discovery/providers?${searchParams.toString()}` };
      },
      providesTags: ['DiscoveryProviders'],
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
        profileImages?: string[];
        latitude?: number | null;
        longitude?: number | null;
        distanceKm?: number | null;
      },
      string | { userId: string; latitude?: number; longitude?: number }
    >({
      query: (arg) => {
        if (typeof arg === 'string') {
          return `/discovery/providers/${arg}`;
        }
        const search = new URLSearchParams();
        if (arg.latitude != null) search.set('latitude', String(arg.latitude));
        if (arg.longitude != null) search.set('longitude', String(arg.longitude));
        const qs = search.toString();
        return `/discovery/providers/${arg.userId}${qs ? `?${qs}` : ''}`;
      },
    }),
  }),
});

export const { useListProvidersQuery, useGetProviderQuery } = discoveryApi;

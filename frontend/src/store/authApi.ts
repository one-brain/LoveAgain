import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AuthUser } from './slices/authSlice';

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string | null;
  userId: string;
  expiresIn: number;
  tokenType: string;
  user?: AuthUser;
}

export function parseJwtUser(token: string): Partial<AuthUser> {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const firstName =
      payload.firstName ||
      payload.given_name ||
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] ||
      '';
    const lastName =
      payload.lastName ||
      payload.surname ||
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] ||
      '';
    const email =
      payload.email ||
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
      '';
    const isVerified = payload.isVerified === true || payload.isVerified === 'true';
    const trustScore = payload.trustScore ? Number(payload.trustScore) : undefined;
    return {
      id: payload.sub || payload.nameid || payload.userId,
      email,
      firstName,
      lastName,
      isVerified,
      trustScore,
      roles: ['Seeker', 'Provider'],
    };
  } catch {
    return {};
  }
}

function parseRefreshTokenCookie(setCookie: string | null): string | null {
  if (!setCookie) return null;
  const match = /cue\.refresh=([^;]+)/i.exec(setCookie);
  return match ? decodeURIComponent(match[1]) : null;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/api/v1` }),
  endpoints: (builder) => ({
    register: builder.mutation<AuthTokenResponse, { email: string; password: string; firstName: string; lastName: string; roles: string[] }>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      transformResponse: (response: { accessToken: string; expiresIn: number; tokenType: string; user?: any }, meta) => {
        const accessToken = response.accessToken;
        const jwtUser = parseJwtUser(accessToken);
        const userObj: AuthUser = {
          id: response.user?.id || jwtUser.id || '',
          email: response.user?.email || jwtUser.email || '',
          firstName: response.user?.firstName || jwtUser.firstName || '',
          lastName: response.user?.lastName || jwtUser.lastName || '',
          isVerified: response.user?.isVerified ?? jwtUser.isVerified ?? false,
          trustScore: response.user?.trustScore ?? jwtUser.trustScore ?? 50,
          roles: response.user?.roles || jwtUser.roles || ['Seeker', 'Provider'],
        };
        return {
          accessToken,
          userId: userObj.id,
          refreshToken: parseRefreshTokenCookie(meta?.response?.headers.get('set-cookie') ?? null),
          expiresIn: response.expiresIn,
          tokenType: response.tokenType,
          user: userObj,
        };
      },
    }),
    login: builder.mutation<AuthTokenResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (response: { accessToken: string; expiresIn: number; tokenType: string; user?: any }, meta) => {
        const accessToken = response.accessToken;
        const jwtUser = parseJwtUser(accessToken);
        const userObj: AuthUser = {
          id: response.user?.id || jwtUser.id || '',
          email: response.user?.email || jwtUser.email || '',
          firstName: response.user?.firstName || jwtUser.firstName || '',
          lastName: response.user?.lastName || jwtUser.lastName || '',
          isVerified: response.user?.isVerified ?? jwtUser.isVerified ?? false,
          trustScore: response.user?.trustScore ?? jwtUser.trustScore ?? 50,
          roles: response.user?.roles || jwtUser.roles || ['Seeker', 'Provider'],
        };
        return {
          accessToken,
          userId: userObj.id,
          refreshToken: parseRefreshTokenCookie(meta?.response?.headers.get('set-cookie') ?? null),
          expiresIn: response.expiresIn,
          tokenType: response.tokenType,
          user: userObj,
        };
      },
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation } = authApi;

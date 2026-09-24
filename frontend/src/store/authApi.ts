import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string | null;
  userId: string;
  expiresIn: number;
  tokenType: string;
}

function parseJwtId(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.nameid || payload.userId || '';
  } catch {
    return '';
  }
}

function parseRefreshTokenCookie(setCookie: string | null): string | null {
  if (!setCookie) return null;
  const match = /cue\.refresh=([^;]+)/i.exec(setCookie);
  return match ? decodeURIComponent(match[1]) : null;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  endpoints: (builder) => ({
    register: builder.mutation<AuthTokenResponse, { email: string; password: string; firstName: string; lastName: string; roles: string[] }>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      transformResponse: (response: { accessToken: string; expiresIn: number; tokenType: string }, meta) => {
        const accessToken = response.accessToken;
        return {
          accessToken,
          userId: parseJwtId(accessToken),
          refreshToken: parseRefreshTokenCookie(meta?.response?.headers.get('set-cookie')),
          expiresIn: response.expiresIn,
          tokenType: response.tokenType,
        };
      },
    }),
    login: builder.mutation<AuthTokenResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (response: { accessToken: string; expiresIn: number; tokenType: string }, meta) => {
        const accessToken = response.accessToken;
        return {
          accessToken,
          userId: parseJwtId(accessToken),
          refreshToken: parseRefreshTokenCookie(meta?.response?.headers.get('set-cookie')),
          expiresIn: response.expiresIn,
          tokenType: response.tokenType,
        };
      },
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation } = authApi;
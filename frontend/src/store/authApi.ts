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
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
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
    sendMobileOtp: builder.mutation<{ message: string; expiresInSeconds: number; devOtp?: string }, { phone: string; purpose?: string }>({
      query: (body) => ({ url: '/auth/mobile/send-otp', method: 'POST', body }),
    }),
    verifyMobileOtp: builder.mutation<
      { isNewUser: boolean; message?: string; tokenResponse?: AuthTokenResponse },
      { phone: string; otp: string; firstName?: string; lastName?: string }
    >({
      query: (body) => ({ url: '/auth/mobile/verify-otp', method: 'POST', body }),
      transformResponse: (response: { isNewUser: boolean; message?: string; tokens?: any }, meta) => {
        if (response.isNewUser || !response.tokens) {
          return { isNewUser: true, message: response.message };
        }
        const tokens = response.tokens;
        const accessToken = tokens.accessToken;
        const jwtUser = parseJwtUser(accessToken);
        const userObj: AuthUser = {
          id: tokens.user?.id || jwtUser.id || '',
          email: tokens.user?.email || jwtUser.email || '',
          firstName: tokens.user?.firstName || jwtUser.firstName || '',
          lastName: tokens.user?.lastName || jwtUser.lastName || '',
          isVerified: tokens.user?.isVerified ?? jwtUser.isVerified ?? true,
          trustScore: tokens.user?.trustScore ?? jwtUser.trustScore ?? 50,
          roles: tokens.user?.roles || jwtUser.roles || ['Seeker', 'Provider'],
        };
        return {
          isNewUser: false,
          tokenResponse: {
            accessToken,
            userId: userObj.id,
            refreshToken: parseRefreshTokenCookie(meta?.response?.headers.get('set-cookie') ?? null),
            expiresIn: tokens.expiresIn || 86400,
            tokenType: tokens.tokenType || 'Bearer',
            user: userObj,
          },
        };
      },
    }),
    forgotPassword: builder.mutation<void, { email: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation<void, { token: string; newPassword: string }>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
    verifyEmail: builder.mutation<void, { token: string }>({
      query: (body) => ({ url: '/auth/verify-email', method: 'POST', body }),
    }),
    resendVerification: builder.mutation<void, void>({
      query: () => ({ url: '/auth/resend-verification', method: 'POST' }),
    }),
    logout: builder.mutation<void, { refreshToken?: string } | void>({
      query: (body) => ({
        url: '/auth/logout',
        method: 'POST',
        body: body || {},
      }),
    }),
    refreshToken: builder.mutation<AuthTokenResponse, { refreshToken?: string } | void>({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: body || {},
      }),
      transformResponse: (response: { accessToken: string; expiresIn: number; tokenType: string; user?: any }, meta) => {
        const accessToken = response.accessToken;
        const jwtUser = parseJwtUser(accessToken);
        const userObj: AuthUser = {
          id: response.user?.id || jwtUser.id || '',
          email: response.user?.email || jwtUser.email || '',
          firstName: response.user?.firstName || jwtUser.firstName || '',
          lastName: response.user?.lastName || jwtUser.lastName || '',
          isVerified: response.user?.isVerified ?? jwtUser.isVerified ?? true,
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

export const {
  useRegisterMutation,
  useLoginMutation,
  useSendMobileOtpMutation,
  useVerifyMobileOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
} = authApi;

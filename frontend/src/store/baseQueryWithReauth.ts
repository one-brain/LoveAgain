import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { updateTokens } from './slices/authSlice';
import { executeClientLogout } from '../utils/sessionManager';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

let isRefreshing = false;
let refreshSubscribers: ((newToken: string | null) => void)[] = [];

const subscribeTokenRefresh = (cb: (newToken: string | null) => void) => {
  refreshSubscribers.push(cb);
};

const notifySubscribers = (newToken: string | null) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

/**
 * Creates a customized BaseQueryFn with automatic JWT re-authentication and 401 interception.
 * Accepts an optional subpath (e.g. '/api/v1', '/api/v1/payments', '/api/v1/chat').
 */
export const createBaseQueryWithReauth = (
  basePath: string = '/api/v1'
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${API_BASE_URL}${basePath}`,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token =
        localStorage.getItem('accessToken') ||
        localStorage.getItem('cue_token') ||
        sessionStorage.getItem('cue_token');

      if (token && token !== 'demo-jwt-token-12345') {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const userId = localStorage.getItem('userId');
      if (userId) {
        headers.set('X-User-Id', userId);
      }

      const rawUser =
        localStorage.getItem('user') ||
        sessionStorage.getItem('user') ||
        localStorage.getItem('cue_user') ||
        sessionStorage.getItem('cue_user');

      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          if (parsed?.id) headers.set('X-User-Id', String(parsed.id));
          if (parsed?.email) headers.set('X-User-Email', String(parsed.email));
        } catch {
          // ignore parse error
        }
      }
      return headers;
    },
  });

  return async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      const requestUrl = typeof args === 'string' ? args : args.url;

      // Do not attempt refresh on auth lifecycle endpoints
      if (
        requestUrl.includes('/auth/refresh') ||
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register') ||
        requestUrl.includes('/auth/mobile/verify-otp')
      ) {
        return result;
      }

      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = localStorage.getItem('refreshToken') || undefined;

        try {
          const refreshQuery = fetchBaseQuery({
            baseUrl: `${API_BASE_URL}/api/v1`,
            credentials: 'include',
          });

          const refreshResult = await refreshQuery(
            {
              url: '/auth/refresh',
              method: 'POST',
              body: { refreshToken },
            },
            api,
            extraOptions
          );

          if (refreshResult.data) {
            const data = refreshResult.data as any;
            const newAccessToken =
              data.accessToken || data.token || data.tokens?.accessToken;

            if (newAccessToken) {
              api.dispatch(
                updateTokens({
                  accessToken: newAccessToken,
                  refreshToken: data.refreshToken || data.tokens?.refreshToken,
                })
              );

              notifySubscribers(newAccessToken);
              isRefreshing = false;

              // Retry the initial request with the freshly acquired token
              result = await rawBaseQuery(args, api, extraOptions);
            } else {
              notifySubscribers(null);
              isRefreshing = false;
              executeClientLogout(api.dispatch as any);
            }
          } else {
            notifySubscribers(null);
            isRefreshing = false;
            executeClientLogout(api.dispatch as any);
          }
        } catch (err) {
          notifySubscribers(null);
          isRefreshing = false;
          executeClientLogout(api.dispatch as any);
        }
      } else {
        // Wait for the in-flight refresh request to resolve
        const waitPromise = new Promise<string | null>((resolve) => {
          subscribeTokenRefresh((token) => resolve(token));
        });

        const freshToken = await waitPromise;
        if (freshToken) {
          result = await rawBaseQuery(args, api, extraOptions);
        }
      }
    }

    return result;
  };
};

export const baseQueryWithReauth = createBaseQueryWithReauth('/api/v1');


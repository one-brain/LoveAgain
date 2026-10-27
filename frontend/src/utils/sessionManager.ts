import type { AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { clearUser } from '../store/slices/userSlice';
import { authApi } from '../store/authApi';
import { profileApi } from '../store/api';
import { bookingApi } from '../store/bookingApi';
import { paymentApi } from '../store/paymentApi';
import { chatApi } from '../store/chatApi';
import { discoveryApi } from '../store/discoveryApi';
import { adminApi } from '../store/adminApi';

/**
 * Keys in localStorage associated with authentication, user identity, and session caches.
 * Non-auth preferences such as 'theme' and 'cue_cookie_consent' are explicitly preserved.
 */
export const AUTH_STORAGE_KEYS = [
  'accessToken',
  'refreshToken',
  'user',
  'userId',
  'cue_token',
  'cue_user',
  'cue_rejected_provider_ids',
] as const;

/**
 * Purges all authentication and identity keys from localStorage and completely clears sessionStorage.
 */
export const clearLocalSessionStorage = (): void => {
  try {
    AUTH_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Clean up any dynamic or legacy session keys while preserving theme and cookie preferences
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        key.startsWith('cue_') &&
        key !== 'cue_cookie_consent'
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.warn('[SessionManager] Error clearing localStorage:', err);
  }

  try {
    sessionStorage.clear();
  } catch (err) {
    console.warn('[SessionManager] Error clearing sessionStorage:', err);
  }
};

/**
 * Resets the normalized in-memory query and mutation caches for ALL 7 RTK Query APIs.
 * Prevents stale user profiles, bookings, earnings, messages, or admin telemetry from leaking.
 */
export const resetAllApiCaches = (dispatch: AppDispatch): void => {
  try {
    dispatch(authApi.util.resetApiState());
    dispatch(profileApi.util.resetApiState());
    dispatch(bookingApi.util.resetApiState());
    dispatch(paymentApi.util.resetApiState());
    dispatch(chatApi.util.resetApiState());
    dispatch(discoveryApi.util.resetApiState());
    dispatch(adminApi.util.resetApiState());
  } catch (err) {
    console.warn('[SessionManager] Error resetting API caches:', err);
  }
};

/**
 * Completely purges client-side authentication state:
 * 1. Resets Redux auth and user slices.
 * 2. Resets all 7 RTK Query API caches.
 * 3. Clears auth localStorage and sessionStorage.
 */
export const executeClientLogout = (dispatch: AppDispatch): void => {
  dispatch(logout());
  dispatch(clearUser());
  resetAllApiCaches(dispatch);
  clearLocalSessionStorage();
};

/**
 * Executes a full server and client logout:
 * 1. Calls POST /api/v1/auth/logout with credentials and token body fallback so the backend
 *    marks the refresh token as revoked in PostgreSQL and deletes the HttpOnly cookie.
 * 2. Executes client-side state, cache, and storage cleanup.
 * 3. Navigates to /login if a navigate callback is supplied.
 */
export const performFullLogout = async (
  dispatch: AppDispatch,
  navigate?: (path: string, options?: { replace?: boolean }) => void
): Promise<void> => {
  const refreshToken = localStorage.getItem('refreshToken') || undefined;

  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
    await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });
  } catch (err) {
    console.warn('[SessionManager] Server logout request failed, continuing with client-side cleanup:', err);
  } finally {
    executeClientLogout(dispatch);
    if (navigate) {
      navigate('/login', { replace: true });
    }
  }
};


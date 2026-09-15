import { rawClient } from './rawClient';
import { getCsrfToken } from '../../utils/csrf';
import { useAuthStore } from '../../store/authStore';
import { ApiError } from './normalizeError';

let refreshPromise = null;

export const performRefresh = () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const csrf = getCsrfToken();
    try {
      const res = await rawClient.post('/api/v1/auth/admin/refresh', null, {
        headers: csrf ? { 'x-csrf-token': csrf } : {},
      });
      const payload = res.data?.data ?? {};
      const accessToken = payload.accessToken;
      if (!accessToken) {
        throw new ApiError({
          message: 'Refresh response missing accessToken',
          code: 'REFRESH_INVALID',
        });
      }
      useAuthStore.getState().setAccessToken(accessToken);
      if (payload.admin) {
        useAuthStore.getState().setAdmin({ admin: payload.admin });
      }
      return accessToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

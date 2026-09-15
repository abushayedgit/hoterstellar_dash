import axios from 'axios';
import { BASE_URL, rawClient } from './rawClient';
import { normalizeError } from './normalizeError';
import { performRefresh } from './refreshManager';
import { useAuthStore } from '../../store/authStore';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 20000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const SKIP_REFRESH_PATTERN = /\/auth\/admin\/(refresh|login|request-reset-password|reset-password)/;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;

    const shouldSkipRefresh =
      original._retried ||
      original._skipAuthRefresh ||
      SKIP_REFRESH_PATTERN.test(original.url ?? '');

    if (status === 401 && !shouldSkipRefresh) {
      original._retried = true;
      try {
        const newToken = await performRefresh();
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch {
        useAuthStore.getState().clear();
        return Promise.reject(normalizeError(error));
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

export { rawClient, BASE_URL };

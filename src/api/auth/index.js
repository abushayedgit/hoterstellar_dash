import { apiClient, rawClient } from '../client/axiosClient';
import { getCsrfToken } from '../../utils/csrf';

const unwrap = (res) => res?.data?.data ?? {};

const withCsrf = (headers = {}) => {
  const csrf = getCsrfToken();
  return csrf ? { ...headers, 'x-csrf-token': csrf } : headers;
};

export const loginRequest = async ({ email, password }) =>
  unwrap(await rawClient.post('/api/v1/auth/admin/login', { email, password }));

export const meRequest = async () => unwrap(await apiClient.get('/api/v1/admin/me'));

export const logoutRequest = async () =>
  unwrap(await apiClient.post('/api/v1/auth/admin/logout', null, { headers: withCsrf() }));

export const changePasswordRequest = async ({ currentPassword, newPassword }) =>
  unwrap(
    await apiClient.post('/api/v1/auth/admin/change-password', {
      currentPassword,
      newPassword,
    }),
  );

export const requestResetPasswordRequest = async ({ email }) =>
  unwrap(await rawClient.post('/api/v1/auth/admin/request-reset-password', { email }));

export const resetPasswordRequest = async ({ token, newPassword }) =>
  unwrap(await rawClient.post('/api/v1/auth/admin/reset-password', { token, newPassword }));

// Used by the Admin Management section, not here. Exposed now so the
// auth endpoint set is complete and consistent.
export const createAdminRequest = async ({ email, name, role }) =>
  unwrap(await apiClient.post('/api/v1/auth/admin/create', { email, name, role }));

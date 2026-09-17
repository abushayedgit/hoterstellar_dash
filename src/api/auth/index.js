import { apiClient, rawClient } from '../client/axiosClient';

const unwrap = (res) => res?.data?.data ?? {};

export const loginRequest = async ({ email, password }) =>
  unwrap(await rawClient.post('/api/v1/auth/admin/login', { email, password }));

export const meRequest = async () => unwrap(await apiClient.get('/api/v1/admin/me'));

export const logoutRequest = async () => unwrap(await apiClient.post('/api/v1/auth/admin/logout'));

export const changePasswordRequest = async ({ currentPassword, newPassword }) =>
  unwrap(
    await apiClient.post('/api/v1/auth/admin/change-password', { currentPassword, newPassword }),
  );

export const requestResetPasswordRequest = async ({ email }) =>
  unwrap(await rawClient.post('/api/v1/auth/admin/request-reset-password', { email }));

export const resetPasswordRequest = async ({ token, newPassword }) =>
  unwrap(await rawClient.post('/api/v1/auth/admin/reset-password', { token, newPassword }));

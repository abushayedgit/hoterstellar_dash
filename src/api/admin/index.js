import { apiClient } from '../client/axiosClient';
import { createAdminRequest } from '../auth';

const unwrap = (res) => res?.data?.data ?? {};

export const getAdmins = async (params = {}) => {
  const res = await apiClient.get('/api/v1/admin', { params });
  const data = unwrap(res);
  return {
    items: data.data ?? [],
    pagination: data.pagination ?? {
      page: 1,
      limit: params.limit ?? 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
  };
};

export const getAdmin = async (id) => {
  const data = unwrap(await apiClient.get(`/api/v1/admin/${id}`));
  return data.admin ?? data;
};

export const createAdmin = (body) => createAdminRequest(body);

export const updateAdmin = async (id, body) => {
  const data = unwrap(await apiClient.put(`/api/v1/admin/${id}`, body));
  return data.admin ?? data;
};

export const deactivateAdmin = async (id) => {
  const data = unwrap(await apiClient.patch(`/api/v1/admin/${id}/deactivate`));
  return data.admin ?? data;
};

export const activateAdmin = async (id) => {
  const data = unwrap(await apiClient.patch(`/api/v1/admin/${id}/activate`));
  return data.admin ?? data;
};

export const deleteAdmin = async (id) => {
  unwrap(await apiClient.delete(`/api/v1/admin/${id}`));
};

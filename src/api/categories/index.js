import { apiClient } from '../client/axiosClient';

const unwrap = (res) => res?.data?.data ?? {};

export const getCategories = async (params = {}) => {
  const res = await apiClient.get('/api/v1/categories', { params });
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

export const getCategory = async (id) => {
  const data = unwrap(await apiClient.get(`/api/v1/categories/${id}`));
  return data.category ?? data;
};

export const createCategory = async (formData) => {
  const data = unwrap(
    await apiClient.post('/api/v1/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  );
  return data.category ?? data;
};

export const updateCategory = async (id, formData) => {
  const data = unwrap(
    await apiClient.put(`/api/v1/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  );
  return data.category ?? data;
};

export const deleteCategory = async (id) => {
  unwrap(await apiClient.delete(`/api/v1/categories/${id}`));
};

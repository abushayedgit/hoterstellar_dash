import { apiClient } from '../client/axiosClient';

const unwrap = (res) => res?.data?.data ?? {};

export const getFoods = async (params = {}) => {
  const res = await apiClient.get('/api/v1/foods', { params });
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

export const getFood = async (id) => {
  const data = unwrap(await apiClient.get(`/api/v1/foods/${id}`));
  return data.food ?? data;
};

export const createFood = async (formData) => {
  const data = unwrap(
    await apiClient.post('/api/v1/foods', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  );
  return data.food ?? data;
};

export const updateFood = async (id, formData) => {
  const data = unwrap(
    await apiClient.put(`/api/v1/foods/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  );
  return data.food ?? data;
};

export const deleteFood = async (id) => {
  unwrap(await apiClient.delete(`/api/v1/foods/${id}`));
};

// Delete a single image from a food. `imageId` is an ImageKit fileId,
// which contains slashes (e.g. "foods/biryani_abc123"). encodeURIComponent
// is applied so Express receives the value as a single path segment.
export const deleteFoodImage = async ({ foodId, imageId }) => {
  const encoded = encodeURIComponent(imageId);
  const data = unwrap(await apiClient.delete(`/api/v1/foods/${foodId}/images/${encoded}`));
  return data.images ?? [];
};

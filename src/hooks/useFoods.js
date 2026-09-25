import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFood, deleteFood, getFood, getFoods, updateFood } from '../api/foods';
import { queryKeys } from '../constants/queryKeys';
import { toast } from '../components/ui/Toast';
import { ApiError } from '../api/client/normalizeError';

export const useFoods = (params) =>
  useQuery({
    queryKey: queryKeys.foods.list(params),
    queryFn: () => getFoods(params),
    placeholderData: (prev) => prev,
  });

export const useFood = (id) =>
  useQuery({
    queryKey: queryKeys.foods.detail(id),
    queryFn: () => getFood(id),
    enabled: Boolean(id),
  });

const invalidate = (qc) => qc.invalidateQueries({ queryKey: queryKeys.foods.all });

export const useCreateFood = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createFood,
    onSuccess: () => {
      invalidate(qc);
      toast.success('Food created');
    },
  });
};

export const useUpdateFood = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => updateFood(id, formData),
    onSuccess: (_data, { id }) => {
      invalidate(qc);
      qc.invalidateQueries({ queryKey: queryKeys.foods.detail(id) });
      toast.success('Food updated');
    },
  });
};

export const useDeleteFood = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteFood,
    onSuccess: () => {
      invalidate(qc);
      toast.success('Food deleted');
    },
    onError: (err) => {
      if (err instanceof ApiError) toast.error(err.message);
    },
  });
};

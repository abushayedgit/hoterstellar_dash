import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from '../api/categories';
import { queryKeys } from '../constants/queryKeys';
import { toast } from '../components/ui/Toast';
import { ApiError } from '../api/client/normalizeError';

export const useCategories = (params) =>
  useQuery({
    queryKey: queryKeys.categories.list(params),
    queryFn: () => getCategories(params),
    placeholderData: (prev) => prev,
  });

export const useCategory = (id) =>
  useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => getCategory(id),
    enabled: Boolean(id),
  });

const invalidate = (qc) => qc.invalidateQueries({ queryKey: queryKeys.categories.all });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      invalidate(qc);
      toast.success('Category created');
    },
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => updateCategory(id, formData),
    onSuccess: (_data, { id }) => {
      invalidate(qc);
      qc.invalidateQueries({ queryKey: queryKeys.categories.detail(id) });
      toast.success('Category updated');
    },
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      invalidate(qc);
      toast.success('Category deleted');
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        // Backend returns BadRequestError with a specific message when the
        // category still has foods attached; also 429 for rate limit.
        toast.error(err.message);
      }
    },
  });
};

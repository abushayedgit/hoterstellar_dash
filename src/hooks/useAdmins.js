import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateAdmin,
  createAdmin,
  deactivateAdmin,
  deleteAdmin,
  getAdmin,
  getAdmins,
  updateAdmin,
} from '../api/admin';
import { queryKeys } from '../constants/queryKeys';
import { toast } from '../components/ui/Toast';
import { ApiError } from '../api/client/normalizeError';

export const useAdmins = (params) =>
  useQuery({
    queryKey: queryKeys.admins.list(params),
    queryFn: () => getAdmins(params),
    placeholderData: (prev) => prev,
  });

export const useAdmin = (id) =>
  useQuery({
    queryKey: queryKeys.admins.detail(id),
    queryFn: () => getAdmin(id),
    enabled: Boolean(id),
  });

const invalidateList = (qc) => qc.invalidateQueries({ queryKey: queryKeys.admins.all });

export const useCreateAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      invalidateList(qc);
      toast.success('Admin created', {
        description: 'A welcome email with a temporary password has been sent.',
      });
    },
  });
};

export const useUpdateAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => updateAdmin(id, body),
    onSuccess: (_data, { id }) => {
      invalidateList(qc);
      qc.invalidateQueries({ queryKey: queryKeys.admins.detail(id) });
      toast.success('Admin updated');
    },
  });
};

export const useToggleAdminActive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }) => (active ? activateAdmin(id) : deactivateAdmin(id)),
    onSuccess: (_data, { id, active }) => {
      invalidateList(qc);
      qc.invalidateQueries({ queryKey: queryKeys.admins.detail(id) });
      toast.success(active ? 'Admin activated' : 'Admin deactivated');
    },
  });
};

export const useDeleteAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      invalidateList(qc);
      toast.success('Admin deleted');
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 429) {
        toast.error('Too many destructive operations. Try again shortly.');
      }
    },
  });
};

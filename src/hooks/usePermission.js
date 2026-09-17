import { useAuthStore } from '../store/authStore';

export const can = (perm) => useAuthStore.getState().permissions.includes(perm);
export const canAny = (...perms) =>
  perms.some((p) => useAuthStore.getState().permissions.includes(p));
export const canAll = (...perms) =>
  perms.every((p) => useAuthStore.getState().permissions.includes(p));

export const usePermission = () => {
  const permissions = useAuthStore((s) => s.permissions);
  const role = useAuthStore((s) => s.admin?.role);

  return {
    role,
    permissions,
    can: (perm) => permissions.includes(perm),
    canAny: (...perms) => perms.some((p) => permissions.includes(p)),
    canAll: (...perms) => perms.every((p) => permissions.includes(p)),
  };
};

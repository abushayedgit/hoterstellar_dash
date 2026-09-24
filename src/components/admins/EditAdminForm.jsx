/* eslint-disable react-hooks/incompatible-library */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CREATABLE_ADMIN_ROLES, updateAdminSchema } from '../../schemas/admin';
import { useUpdateAdmin } from '../../hooks/useAdmins';
import { useAuthStore } from '../../store/authStore';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { ApiError } from '../../api/client/normalizeError';
import { applyServerFieldErrors } from '../../utils/formErrors';

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
};

const ROLE_OPTIONS = CREATABLE_ADMIN_ROLES.map((r) => ({
  value: r,
  label: ROLE_LABELS[r],
}));
export default function EditAdminForm({ admin, onSuccess, onCancel }) {
  const currentAdminId = useAuthStore((s) => s.admin?._id);
  const isSelf = String(admin?._id) === String(currentAdminId);

  const updateAdmin = useUpdateAdmin();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updateAdminSchema),
    defaultValues: {
      name: admin?.name ?? '',
      role: admin?.role ?? 'admin',
      isActive: admin?.isActive ?? true,
    },
  });

  const role = watch('role');
  const isActive = watch('isActive');

  const onSubmit = async (values) => {
    try {
      await updateAdmin.mutateAsync({ id: admin._id, body: values });
      onSuccess?.();
    } catch (err) {
      const handled = applyServerFieldErrors(err, setError);
      if (!handled) {
        const message =
          err instanceof ApiError ? err.message : 'Unable to update admin. Please try again.';
        setError('root', { type: 'server', message });
      }
    }
  };

  const submitting = isSubmitting || updateAdmin.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input
        id="edit-admin-name"
        label="Full name"
        error={errors.name?.message}
        {...register('name')}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="edit-admin-role" className="text-sm font-medium text-text-primary">
          Role
        </label>
        <select
          id="edit-admin-role"
          value={role}
          disabled={isSelf}
          onChange={(e) => setValue('role', e.target.value, { shouldValidate: true })}
          className="h-10 rounded-lg border border-input-border bg-input-bg px-3 text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {isSelf && <p className="text-xs text-text-muted">You cannot change your own role.</p>}
        {errors.role && (
          <p role="alert" className="text-xs text-danger">
            {errors.role.message}
          </p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-text-primary">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-input-border text-primary focus:ring-focus disabled:cursor-not-allowed disabled:opacity-60"
          checked={isActive}
          disabled={isSelf}
          onChange={(e) => setValue('isActive', e.target.checked)}
        />
        Active
      </label>
      {isSelf && (
        <p className="-mt-3 text-xs text-text-muted">You cannot deactivate your own account.</p>
      )}

      {errors.root && (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          {errors.root.message}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting} disabled={submitting}>
          {submitting ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}

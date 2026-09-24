/* eslint-disable react-hooks/incompatible-library */
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CREATABLE_ADMIN_ROLES, createAdminSchema } from '../../schemas/admin';
import { useCreateAdmin } from '../../hooks/useAdmins';
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

export default function CreateAdminForm({ onSuccess, onCancel }) {
  const createAdmin = useCreateAdmin();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createAdminSchema),
    defaultValues: { email: '', name: '', role: 'admin' },
  });

  const role = watch('role');

  const onSubmit = async (values) => {
    try {
      await createAdmin.mutateAsync(values);
      onSuccess?.();
    } catch (err) {
      const handled = applyServerFieldErrors(err, setError);
      if (!handled) {
        const message =
          err instanceof ApiError ? err.message : 'Unable to create admin. Please try again.';
        setError('root', { type: 'server', message });
      }
    }
  };

  const submitting = isSubmitting || createAdmin.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input
        id="create-admin-email"
        type="email"
        label="Email"
        placeholder="newadmin@hoterstellar.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        id="create-admin-name"
        label="Full name"
        placeholder="New Admin"
        error={errors.name?.message}
        {...register('name')}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="create-admin-role" className="text-sm font-medium text-text-primary">
          Role
        </label>
        <select
          id="create-admin-role"
          value={role}
          onChange={(e) => setValue('role', e.target.value, { shouldValidate: true })}
          className="h-10 rounded-lg border border-input-border bg-input-bg px-3 text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/40"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.role && (
          <p role="alert" className="text-xs text-danger">
            {errors.role.message}
          </p>
        )}
      </div>

      <p className="text-xs text-text-muted">
        A temporary password will be emailed to this address. It is never displayed in this
        dashboard.
      </p>

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
          {submitting ? 'Creating…' : 'Create admin'}
        </Button>
      </div>
    </form>
  );
}

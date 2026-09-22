import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema } from '../schemas/auth';
import { useChangePassword } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PasswordStrengthMeter from '../components/shared/PasswordStrengthMeter';
import { toast } from '../components/ui/Toast';
import { ApiError } from '../api/client/normalizeError';
import { applyServerFieldErrors } from '../utils/formErrors';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const mustChange = useAuthStore((s) => s.mustChangePassword);
  const clearMustChange = useAuthStore((s) => s.clearMustChangePassword);
  const changePassword = useChangePassword();
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const newPassword = watch('newPassword');

  const onSubmit = async ({ currentPassword, newPassword: next }) => {
    setFormError(null);
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword: next });
      clearMustChange();
      reset();
      toast.success('Password updated');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const handled = applyServerFieldErrors(err, setError);
      if (!handled) {
        setFormError(err instanceof ApiError ? err.message : 'Unable to update password');
      }
    }
  };

  const submitting = isSubmitting || changePassword.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <Card className="w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-text-primary">Change password</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {mustChange
              ? 'For security you must set a new password before continuing.'
              : 'Update the password for your admin account.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Input
            id="currentPassword"
            type="password"
            label="Current password"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <div className="flex flex-col gap-1.5">
            <Input
              id="newPassword"
              type="password"
              label="New password"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <PasswordStrengthMeter password={newPassword ?? ''} />
          </div>
          <Input
            id="confirmPassword"
            type="password"
            label="Confirm new password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {formError && (
            <p
              role="alert"
              className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
            >
              {formError}
            </p>
          )}

          <div className="flex items-center justify-end gap-2">
            {!mustChange && (
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            )}
            <Button type="submit" loading={submitting} disabled={submitting}>
              {submitting ? 'Updating…' : 'Update password'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

/* eslint-disable react-hooks/incompatible-library */
import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '../schemas/auth';
import { resetPasswordRequest } from '../api/auth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PasswordStrengthMeter from '../components/shared/PasswordStrengthMeter';
import { toast } from '../components/ui/Toast';
import { ApiError } from '../api/client/normalizeError';
import { applyServerFieldErrors } from '../utils/formErrors';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [formError, setFormError] = useState(null);

  const mutation = useMutation({ mutationFn: resetPasswordRequest });

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  if (!token) {
    return <Navigate to="/forgot-password" replace />;
  }

  const newPassword = watch('newPassword');

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      await mutation.mutateAsync({ token, newPassword: values.newPassword });
      toast.success('Password updated. Please sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      const handled = applyServerFieldErrors(err, setError);
      if (!handled) {
        setFormError(
          err instanceof ApiError
            ? err.message
            : 'Unable to reset your password. The link may have expired.',
        );
      }
    }
  };

  const submitting = isSubmitting || mutation.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <Card className="w-full max-w-md">
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
            Hoterstellar
          </p>
          <h1 className="mt-1 text-xl font-bold text-text-primary">Set a new password</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Choose a strong password for your admin account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
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

          <Button type="submit" loading={submitting} disabled={submitting}>
            {submitting ? 'Updating…' : 'Update password'}
          </Button>

          <Link to="/login" className="text-center text-sm text-primary hover:underline">
            Back to sign in
          </Link>
        </form>
      </Card>
    </div>
  );
}

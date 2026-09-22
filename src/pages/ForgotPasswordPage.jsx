import { useState } from 'react';
import { Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '../schemas/auth';
import { requestResetPasswordRequest } from '../api/auth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { ApiError } from '../api/client/normalizeError';
import { applyServerFieldErrors } from '../utils/formErrors';

export default function ForgotPasswordPage() {
  const [formError, setFormError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({ mutationFn: requestResetPasswordRequest });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      await mutation.mutateAsync(values);
      setSubmitted(true);
    } catch (err) {
      const handled = applyServerFieldErrors(err, setError);
      if (!handled) {
        setFormError(
          err instanceof ApiError ? err.message : 'Unable to submit the request. Please try again.',
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
          <h1 className="mt-1 text-xl font-bold text-text-primary">Reset your password</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Enter your admin email and we&apos;ll send a reset link if an account exists.
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col gap-4">
            <p
              role="status"
              className="rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-sm text-success"
            >
              If the email exists, a reset link has been sent.
            </p>
            <Link to="/login" className="text-sm text-primary hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <Input
              id="email"
              type="email"
              label="Email"
              autoComplete="email"
              placeholder="admin@hoterstellar.com"
              error={errors.email?.message}
              {...register('email')}
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
              {submitting ? 'Sending…' : 'Send reset link'}
            </Button>

            <Link to="/login" className="text-center text-sm text-primary hover:underline">
              Back to sign in
            </Link>
          </form>
        )}
      </Card>
    </div>
  );
}

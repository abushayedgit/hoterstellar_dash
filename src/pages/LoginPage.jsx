import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schemas/auth';
import { useLogin } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { ApiError } from '../api/client/normalizeError';
import { applyServerFieldErrors } from '../utils/formErrors';

export default function LoginPage() {
  const [formError, setFormError] = useState(null);
  const login = useLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      await login.mutateAsync(values);
    } catch (err) {
      const handled = applyServerFieldErrors(err, setError);
      if (!handled) {
        setFormError(err instanceof ApiError ? err.message : 'Unable to sign in');
      }
    }
  };

  const submitting = isSubmitting || login.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
            Hoterstellar
          </p>
          <h1 className="mt-1 text-2xl font-bold text-text-primary">Admin sign in</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Use your Hoterstellar administrator credentials.
          </p>
        </div>

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
          <Input
            id="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
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
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

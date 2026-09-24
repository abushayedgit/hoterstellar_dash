import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schemas/auth';
import { useLogin } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { ApiError } from '../api/client/normalizeError';
import { applyServerFieldErrors } from '../utils/formErrors';

const REMEMBERED_EMAIL_KEY = 'hoterstellar-remembered-email';

const readRememberedEmail = () => {
  try {
    return localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? '';
  } catch {
    return '';
  }
};

const writeRememberedEmail = (email) => {
  try {
    if (email) localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    else localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  } catch {
    /* ignore */
  }
};

const mapLoginError = (err) => {
  if (!(err instanceof ApiError)) return 'Unable to sign in. Please try again.';

  if (err.status === 429) {
    return 'Too many login attempts. Try again in 5 minutes.';
  }

  // Every other backend-reported error carries an authoritative,
  // human-readable message ("Invalid email or password", "Account is
  // deactivated", validation messages, etc.). Prefer it.
  if (err.message) return err.message;

  return 'Unable to sign in. Please try again.';
};

export default function LoginPage() {
  const remembered = readRememberedEmail();
  const [formError, setFormError] = useState(null);
  const login = useLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: remembered, password: '', rememberMe: Boolean(remembered) },
  });

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      await login.mutateAsync({ email: values.email, password: values.password });
      writeRememberedEmail(values.rememberMe ? values.email : '');
    } catch (err) {
      console.log(err);

      const handled = applyServerFieldErrors(err, setError);
      if (!handled) setFormError(mapLoginError(err));
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

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input-border text-primary focus:ring-focus"
                {...register('rememberMe')}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

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

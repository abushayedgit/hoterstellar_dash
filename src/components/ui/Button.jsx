import { forwardRef } from 'react';
import { cn } from '../../lib/cn';
import Spinner from './Spinner';

const variants = {
  primary: 'bg-primary text-primary-fg hover:opacity-90',
  secondary: 'bg-surface-muted text-text-primary border border-border hover:bg-surface-elevated',
  ghost: 'bg-transparent text-text-primary hover:bg-surface-muted',
  outline: 'bg-transparent border border-border text-text-primary hover:bg-surface-muted',
  danger: 'bg-danger text-white hover:opacity-90',
  accent: 'bg-accent text-accent-fg hover:opacity-90',
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
  icon: 'h-10 w-10 p-0',
};

const Button = forwardRef(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    type = 'button',
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-0',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
});

export default Button;

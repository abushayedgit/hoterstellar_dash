import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

const Input = forwardRef(function Input({ id, label, error, hint, className, ...props }, ref) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={cn(
          'h-10 w-full rounded-lg border border-input-border bg-input-bg px-3 text-sm text-text-primary',
          'placeholder:text-text-muted',
          'focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/40',
          error && 'border-danger focus:border-danger focus:ring-danger/40',
          className,
        )}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="text-xs text-text-muted">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;

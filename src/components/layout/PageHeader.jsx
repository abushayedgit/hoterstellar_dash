import { cn } from '../../lib/cn';

export default function PageHeader({ title, description, actions, className }) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-text-primary sm:text-2xl">{title}</h1>
        {description && <p className="text-sm text-text-secondary">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

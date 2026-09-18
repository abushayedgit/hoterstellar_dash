import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInbox } from '@fortawesome/free-solid-svg-icons';
import { cn } from '../../lib/cn';

export default function EmptyState({
  title = 'Nothing here yet',
  message,
  icon = faInbox,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-8 text-center',
        className,
      )}
    >
      <FontAwesomeIcon icon={icon} className="text-2xl text-text-muted" />
      <div>
        <p className="font-semibold text-text-primary">{title}</p>
        {message && <p className="text-sm text-text-secondary">{message}</p>}
      </div>
      {action}
    </div>
  );
}

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { cn } from '../../lib/cn';
import Button from '../ui/Button';

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl border border-danger/30 bg-danger/5 p-6 text-center',
        className,
      )}
    >
      <FontAwesomeIcon icon={faTriangleExclamation} className="text-2xl text-danger" />
      <div>
        <p className="font-semibold text-text-primary">{title}</p>
        {message && <p className="text-sm text-text-secondary">{message}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

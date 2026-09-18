import Spinner from '../ui/Spinner';
import { cn } from '../../lib/cn';

export default function LoadingState({ label = 'Loading…', fullScreen = false, className }) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-text-secondary',
        fullScreen ? 'min-h-screen' : 'py-12',
        className,
      )}
    >
      <Spinner size="lg" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

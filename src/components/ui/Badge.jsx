import { cn } from '../../lib/cn';

const tones = {
  neutral: 'bg-surface-muted text-text-secondary border-border',
  primary: 'bg-primary/10 text-primary border-primary/30',
  accent: 'bg-accent/20 text-accent-fg border-accent/40',
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  danger: 'bg-danger/10 text-danger border-danger/30',
  info: 'bg-info/10 text-info border-info/30',
};

export default function Badge({ tone = 'neutral', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        tones[tone] ?? tones.neutral,
        className,
      )}
    >
      {children}
    </span>
  );
}

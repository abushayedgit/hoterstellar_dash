import { scorePassword } from '../../utils/passwordStrength';
import { cn } from '../../lib/cn';

const TONE_BY_SCORE = (score) => {
  if (score >= 5) return 'success';
  if (score >= 3) return 'warning';
  return 'danger';
};

const LABEL_BY_SCORE = (score) => {
  if (score === 0) return '';
  if (score >= 5) return 'Strong';
  if (score >= 3) return 'Fair';
  return 'Weak';
};

const TONE_CLASS = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

export default function PasswordStrengthMeter({ password = '' }) {
  const { score } = scorePassword(password);
  const tone = TONE_BY_SCORE(score);
  const label = LABEL_BY_SCORE(score);

  return (
    <div className="flex flex-col gap-1">
      <div
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={5}
        aria-label="Password strength"
        className="flex gap-1"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i < score ? TONE_CLASS[tone] : 'bg-surface-muted',
            )}
          />
        ))}
      </div>
      {label && <p className="text-xs text-text-muted">{label}</p>}
    </div>
  );
}

import { ApiError } from '../api/client/normalizeError';

export const applyServerFieldErrors = (error, setError) => {
  if (!(error instanceof ApiError)) return false;
  if (error.status !== 400 || !Array.isArray(error.details)) return false;
  let applied = false;
  for (const d of error.details) {
    if (d && d.field) {
      setError(d.field, { type: 'server', message: d.message || 'Invalid value' });
      applied = true;
    }
  }
  return applied;
};

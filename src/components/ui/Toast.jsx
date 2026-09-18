/* eslint-disable react-refresh/only-export-components */
import { create } from 'zustand';
import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faCircleExclamation,
  faCircleInfo,
  faTriangleExclamation,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '../../lib/cn';

const useToastStore = create((set) => ({
  toasts: [],
  push: (toast) => {
    const id = toast.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set((s) => ({ toasts: [...s.toasts, { id, variant: 'info', duration: 4000, ...toast }] }));
    if (toast.duration !== 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, toast.duration ?? 4000);
    }
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message, opts) =>
    useToastStore.getState().push({ variant: 'success', message, ...opts }),
  error: (message, opts) => useToastStore.getState().push({ variant: 'danger', message, ...opts }),
  info: (message, opts) => useToastStore.getState().push({ variant: 'info', message, ...opts }),
  warning: (message, opts) =>
    useToastStore.getState().push({ variant: 'warning', message, ...opts }),
};

const ICONS = {
  success: faCheckCircle,
  danger: faCircleExclamation,
  warning: faTriangleExclamation,
  info: faCircleInfo,
};

const TONES = {
  success: 'text-success border-success/30',
  danger: 'text-danger border-danger/30',
  warning: 'text-warning border-warning/30',
  info: 'text-info border-info/30',
};

function ToastItem({ item, onDismiss }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      role="status"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-surface-elevated p-4 shadow-lg',
        TONES[item.variant] ?? TONES.info,
      )}
    >
      <FontAwesomeIcon icon={ICONS[item.variant] ?? faCircleInfo} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        {item.title && <p className="text-sm font-semibold text-text-primary">{item.title}</p>}
        {item.message && <p className="text-sm text-text-secondary">{item.message}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="shrink-0 text-text-muted transition hover:text-text-primary"
        aria-label="Dismiss notification"
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </motion.li>
  );
}

export function ToastProvider({ children }) {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center p-4 sm:inset-auto sm:bottom-auto sm:right-0 sm:top-0 sm:justify-end">
        <ul className="flex w-full flex-col items-center gap-2 sm:items-end">
          <AnimatePresence initial={false}>
            {toasts.map((t) => (
              <ToastItem key={t.id} item={t} onDismiss={dismiss} />
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </>
  );
}

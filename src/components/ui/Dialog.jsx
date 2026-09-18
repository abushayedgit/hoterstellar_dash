import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { cn } from '../../lib/cn';

export default function Dialog({ open, onClose, title, children, footer, className }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={typeof title === 'string' ? title : undefined}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-overlay" onClick={onClose} aria-hidden="true" />
          <motion.div
            initial={{ y: 12, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={cn(
              'relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-xl',
              className,
            )}
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="text-base font-semibold text-text-primary">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-text-muted transition hover:text-text-primary"
                aria-label="Close dialog"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </header>
            <div className="px-5 py-4">{children}</div>
            {footer && <footer className="border-t border-border px-5 py-3">{footer}</footer>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

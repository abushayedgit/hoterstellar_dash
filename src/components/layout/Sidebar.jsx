import { NavLink } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { NAV_ITEMS } from '../../constants/navigation';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/cn';

const filterItems = (permissions, items) =>
  items.filter((item) => {
    if (item.permission) return permissions.includes(item.permission);
    if (item.anyOf) return item.anyOf.some((p) => permissions.includes(p));
    if (item.allOf) return item.allOf.every((p) => permissions.includes(p));
    return true;
  });

function SidebarBody({ onNavigate }) {
  const permissions = useAuthStore((s) => s.permissions);
  const items = filterItems(permissions, NAV_ITEMS);

  return (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto p-3">
      <div className="px-2 pb-4 pt-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
          Hoterstellar
        </p>
        <p className="text-lg font-bold text-text-primary">Admin</p>
      </div>

      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
            )
          }
        >
          <FontAwesomeIcon icon={item.icon} className="w-4" aria-hidden="true" />
          <span className="truncate">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface md:flex">
        <SidebarBody />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-overlay md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-surface md:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.2 }}
              aria-label="Main navigation"
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 text-text-muted transition hover:text-text-primary"
                aria-label="Close navigation"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
              <SidebarBody onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../../store/authStore';
import { useLogout } from '../../hooks/useAuth';
import ThemeToggle from '../shared/ThemeToggle';
import Button from '../ui/Button';

export default function Header({ onMenuClick }) {
  const admin = useAuthStore((s) => s.admin);
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/85 px-3 backdrop-blur sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden"
          aria-label="Open navigation"
        >
          <FontAwesomeIcon icon={faBars} />
        </Button>
        <h1 className="truncate text-sm font-semibold text-text-primary sm:text-base">
          Hoterstellar Admin
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary transition hover:bg-surface-muted"
          >
            <span className="hidden max-w-[120px] truncate sm:inline">
              {admin?.name ?? 'Admin'}
            </span>
            {admin?.role && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                {admin.role}
              </span>
            )}
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-surface-elevated shadow-lg"
            >
              <div className="border-b border-border px-3 py-2">
                <p className="truncate text-sm font-medium text-text-primary">
                  {admin?.name ?? '—'}
                </p>
                <p className="truncate text-xs text-text-muted">{admin?.email ?? '—'}</p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                className="block w-full px-3 py-2 text-left text-sm text-danger transition hover:bg-surface-muted disabled:opacity-50"
              >
                {logout.isPending ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

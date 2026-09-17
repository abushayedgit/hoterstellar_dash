import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

const getSystemTheme = () =>
  typeof window !== 'undefined' && window.matchMedia(SYSTEM_DARK_QUERY).matches ? 'dark' : 'light';

const resolveTheme = (theme) => (theme === 'system' ? getSystemTheme() : theme);

const applyResolvedTheme = (resolved) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', resolved);
};

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system', // 'light' | 'dark' | 'system'
      setTheme: (theme) => {
        set({ theme });
        applyResolvedTheme(resolveTheme(theme));
      },
      toggle: () => {
        const next = resolveTheme(get().theme) === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        applyResolvedTheme(next);
      },
      applyCurrent: () => {
        applyResolvedTheme(resolveTheme(get().theme));
      },
      resolved: () => resolveTheme(get().theme),
    }),
    {
      name: 'hoterstellar-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyResolvedTheme(resolveTheme(state.theme));
      },
    },
  ),
);

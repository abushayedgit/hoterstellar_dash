import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

export const useSystemThemeListener = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const { theme, applyCurrent } = useThemeStore.getState();
      if (theme === 'system') applyCurrent();
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
};

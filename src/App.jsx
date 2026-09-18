import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ToastProvider } from './components/ui/Toast';
import { AppRouter } from './router';
import { useAuthBootstrap } from './hooks/useAuthBootstrap';
import { useSystemThemeListener } from './hooks/useSystemThemeListener';
import { useAuthStore } from './store/authStore';
import LoadingState from './components/shared/LoadingState';

function Bootstrap({ children }) {
  useAuthBootstrap();
  useSystemThemeListener();

  // Reset server-state cache the moment the session drops, without
  // wiring queryClient into the store (keeps store framework-agnostic).
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state, prev) => {
      if (prev.status !== 'unauthenticated' && state.status === 'unauthenticated') {
        queryClient.clear();
      }
    });
    return unsubscribe;
  }, []);

  const status = useAuthStore((s) => s.status);
  if (status === 'idle' || status === 'initializing') {
    return <LoadingState fullScreen label="Loading dashboard…" />;
  }
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Bootstrap>
          <AppRouter />
        </Bootstrap>
      </ToastProvider>
    </QueryClientProvider>
  );
}

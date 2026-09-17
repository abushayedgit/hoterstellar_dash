import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { meRequest } from '../api/auth';
import { performRefresh } from '../api/client/refreshManager';

let bootstrapped = false;

export const useAuthBootstrap = () => {
  useEffect(() => {
    if (bootstrapped) return;
    bootstrapped = true;

    const run = async () => {
      const store = useAuthStore.getState();
      store.setStatus('initializing');

      const existing = store.hydrateToken();

      try {
        if (!existing) {
          await performRefresh();
        }
        const me = await meRequest();
        useAuthStore.getState().setSession({
          accessToken: useAuthStore.getState().accessToken,
          admin: me.admin,
          permissions: me.permissions || [],
          mustChangePassword: false,
        });
      } catch {
        useAuthStore.getState().clear();
      }
    };

    run();
  }, []);
};

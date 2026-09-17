import { create } from 'zustand';

const ACCESS_TOKEN_KEY = 'hoterstellar-access-token';

const readToken = () => {
  try {
    return typeof window !== 'undefined' ? sessionStorage.getItem(ACCESS_TOKEN_KEY) : null;
  } catch {
    return null;
  }
};

const writeToken = (token) => {
  try {
    if (token) sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    else sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    /* sessionStorage unavailable — token stays in-memory only */
  }
};

export const useAuthStore = create((set, get) => ({
  accessToken: null,
  admin: null,
  permissions: [],
  mustChangePassword: false,
  /**
   * idle | initializing | authenticated | unauthenticated | must-change-password
   */
  status: 'idle',

  setAccessToken: (token) => {
    writeToken(token);
    set({ accessToken: token ?? null });
  },

  setAdmin: ({ admin, permissions }) =>
    set((s) => ({
      admin: admin ?? s.admin,
      permissions: permissions ?? s.permissions,
    })),

  setSession: ({ accessToken, admin, permissions = [], mustChangePassword = false }) => {
    if (accessToken) writeToken(accessToken);
    set((s) => ({
      accessToken: accessToken ?? s.accessToken,
      admin: admin ?? s.admin,
      permissions,
      mustChangePassword,
      status: mustChangePassword ? 'must-change-password' : 'authenticated',
    }));
  },

  setStatus: (status) => set({ status }),

  clearMustChangePassword: () =>
    set((s) => ({
      mustChangePassword: false,
      status: s.status === 'must-change-password' ? 'authenticated' : s.status,
    })),

  clear: () => {
    writeToken(null);
    set({
      accessToken: null,
      admin: null,
      permissions: [],
      mustChangePassword: false,
      status: 'unauthenticated',
    });
  },

  hydrateToken: () => {
    const token = readToken();
    if (token && !get().accessToken) set({ accessToken: token });
    return token;
  },
}));

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  email: string;
  fullName: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  _hydrated: boolean;
  login: (token: string, email: string, fullName: string, role: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isAgent: () => boolean;
  isDriver: () => boolean;
  isWarehouseManager: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      _hydrated: false,
      login: (token, email, fullName, role) => {
        set({ token, user: { email, fullName, role } });
      },
      logout: () => {
        set({ token: null, user: null });
      },
      isAuthenticated: () => !!get().token,
      isAdmin: () => get().user?.role === 'Admin',
      isAgent: () => get().user?.role === 'Agent',
      isDriver: () => get().user?.role === 'Driver',
      isWarehouseManager: () => get().user?.role === 'WarehouseManager',
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => state => {
        if (state) state._hydrated = true;
      },
    }
  )
);

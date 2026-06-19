import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  email: string;
  fullName: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  _hydrated: boolean;
  login: (email: string, fullName: string, role: string) => void;
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
      user: null,
      _hydrated: false,
      login: (email, fullName, role) => {
        set({ user: { email, fullName, role } });
        // non-httpOnly cookie for Next.js middleware route protection
        if (typeof document !== 'undefined') {
          document.cookie = `auth-role=${role}; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 30}`;
        }
      },
      logout: () => {
        set({ user: null });
        if (typeof document !== 'undefined') {
          document.cookie = 'auth-role=; path=/; SameSite=Lax; max-age=0';
        }
      },
      isAuthenticated: () => get().user !== null,
      isAdmin: () => get().user?.role === 'Admin',
      isAgent: () => get().user?.role === 'Agent',
      isDriver: () => get().user?.role === 'Driver',
      isWarehouseManager: () => get().user?.role === 'WarehouseManager',
    }),
    {
      name: 'auth-storage',
      partialize: state => ({ user: state.user }),
      onRehydrateStorage: () => state => {
        if (state) state._hydrated = true;
      },
    }
  )
);

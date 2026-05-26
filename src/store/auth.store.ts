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
      login: (token, email, fullName, role) => {
        localStorage.setItem('token', token);
        set({ token, user: { email, fullName, role } });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null });
      },
      isAuthenticated: () => !!get().token,
      isAdmin: () => get().user?.role === 'Admin',
      isAgent: () => get().user?.role === 'Agent',
      isDriver: () => get().user?.role === 'Driver',
      isWarehouseManager: () => get().user?.role === 'WarehouseManager',
    }),
    { name: 'auth-storage', skipHydration: true }
  )
);

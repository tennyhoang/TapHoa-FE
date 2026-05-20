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
    }),
    { name: 'auth-storage', skipHydration: true }
  )
);

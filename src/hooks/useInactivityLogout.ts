import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';

const TIMEOUT_MS = 15 * 60 * 1000;
const WARN_MS = 60 * 1000;

export function useInactivityLogout() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const logoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastIdRef = useRef<string | number | undefined>(undefined);

  useEffect(() => {
    if (!user) return;

    const doLogout = () => {
      logout();
      toast.error('Phiên đăng nhập đã hết hạn', {
        description: 'Bạn đã không hoạt động quá 15 phút.',
        duration: 5000,
      });
      window.location.href = '/auth/login';
    };

    const reset = () => {
      if (logoutRef.current) clearTimeout(logoutRef.current);
      if (warnRef.current) clearTimeout(warnRef.current);
      if (toastIdRef.current !== undefined) toast.dismiss(toastIdRef.current);

      warnRef.current = setTimeout(() => {
        toastIdRef.current = toast.warning('Bạn sắp bị đăng xuất!', {
          description: 'Hãy thao tác để tiếp tục phiên đăng nhập (còn 1 phút)',
          duration: WARN_MS,
        });
      }, TIMEOUT_MS - WARN_MS);

      logoutRef.current = setTimeout(doLogout, TIMEOUT_MS);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      if (logoutRef.current) clearTimeout(logoutRef.current);
      if (warnRef.current) clearTimeout(warnRef.current);
    };
  }, [user, logout]);
}

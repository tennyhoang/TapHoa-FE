'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export function DemoAuthHandler() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    const email = params.get('email');
    const fullName = params.get('fullName');
    const role = params.get('role');

    if (token && email && fullName && role) {
      localStorage.setItem('access_token', token);
      // Set axios default header for non-cookie auth
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Initialize auth store + middleware cookie
      useAuthStore.getState().login(email, fullName, role);
      // Clean URL without causing reload
      const clean = window.location.pathname + window.location.hash;
      window.history.replaceState(null, '', clean);
    }
  }, []);

  return null;
}

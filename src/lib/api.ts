import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5084/api/v1',
});

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  error => {
    if (typeof window === 'undefined') return Promise.reject(error);

    const status = error.response?.status;

    if (status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/auth/login';
      return Promise.reject(error);
    }

    if (status === 403) {
      toast.error('Không có quyền thực hiện thao tác này. Vui lòng đăng xuất và đăng nhập lại.', {
        duration: 5000,
      });
    }

    return Promise.reject(error);
  }
);

export default api;

import api from '@/lib/api';
import { LoginResponse, UserProfile } from '@/types';

export const authService = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }).then(r => r.data),

  register: (fullName: string, email: string, password: string, phoneNumber?: string) =>
    api.post('/auth/register', { fullName, email, password, phoneNumber }).then(r => r.data),

  getProfile: () =>
    api.get<UserProfile>('/users/me').then(r => r.data),

  updateProfile: (data: { fullName: string; phoneNumber?: string; avatarUrl?: string }) =>
    api.put<UserProfile>('/users/me', data).then(r => r.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch('/users/me/password', { currentPassword, newPassword }),

  socialLogin: (provider: 'Google' | 'Facebook', token: string) =>
    api.post<LoginResponse>('/auth/social-login', { provider, token }).then(r => r.data),
};

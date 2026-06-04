import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../auth.service';

vi.mock('@/lib/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '@/lib/api';

const mockApi = vi.mocked(api);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authService', () => {
  it('login posts credentials and returns data', async () => {
    const res = { data: { token: 'abc', user: { email: 'a@b.com' } } };
    mockApi.post.mockResolvedValue(res);
    const result = await authService.login('a@b.com', 'pwd');
    expect(mockApi.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'pwd' });
    expect(result).toEqual(res.data);
  });

  it('register posts registration data', async () => {
    const res = { data: { id: '1' } };
    mockApi.post.mockResolvedValue(res);
    const result = await authService.register('Name', 'a@b.com', 'pwd', '0123');
    expect(mockApi.post).toHaveBeenCalledWith('/auth/register', {
      fullName: 'Name',
      email: 'a@b.com',
      password: 'pwd',
      phoneNumber: '0123',
    });
    expect(result).toEqual(res.data);
  });

  it('register works without phone', async () => {
    mockApi.post.mockResolvedValue({ data: { id: '1' } });
    await authService.register('Name', 'a@b.com', 'pwd');
    expect(mockApi.post).toHaveBeenCalledWith('/auth/register', {
      fullName: 'Name',
      email: 'a@b.com',
      password: 'pwd',
      phoneNumber: undefined,
    });
  });

  it('getProfile fetches user profile', async () => {
    const res = { data: { email: 'a@b.com' } };
    mockApi.get.mockResolvedValue(res);
    const result = await authService.getProfile();
    expect(mockApi.get).toHaveBeenCalledWith('/users/me');
    expect(result).toEqual(res.data);
  });

  it('updateProfile sends profile changes', async () => {
    const res = { data: { fullName: 'New' } };
    mockApi.put.mockResolvedValue(res);
    const result = await authService.updateProfile({ fullName: 'New' });
    expect(mockApi.put).toHaveBeenCalledWith('/users/me', { fullName: 'New' });
    expect(result).toEqual(res.data);
  });

  it('changePassword sends current and new password', async () => {
    mockApi.patch.mockResolvedValue({});
    await authService.changePassword('old', 'new');
    expect(mockApi.patch).toHaveBeenCalledWith('/users/me/password', {
      currentPassword: 'old',
      newPassword: 'new',
    });
  });

  it('socialLogin posts provider and token', async () => {
    const res = { data: { token: 'abc' } };
    mockApi.post.mockResolvedValue(res);
    const result = await authService.socialLogin('Google', 'tok');
    expect(mockApi.post).toHaveBeenCalledWith('/auth/social-login', {
      provider: 'Google',
      token: 'tok',
    });
    expect(result).toEqual(res.data);
  });

  it('throws when API fails', async () => {
    mockApi.post.mockRejectedValue(new Error('Network error'));
    await expect(authService.login('a@b.com', 'pwd')).rejects.toThrow('Network error');
  });
});

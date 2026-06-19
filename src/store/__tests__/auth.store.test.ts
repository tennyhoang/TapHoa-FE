import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../auth.store';

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: null });
});

describe('auth.store', () => {
  it('should have initial state with user=null', () => {
    const { user } = useAuthStore.getState();
    expect(user).toBeNull();
  });

  it('should set user on login', () => {
    useAuthStore.getState().login('test@example.com', 'Test User', 'Admin');
    const { user } = useAuthStore.getState();
    expect(user).toEqual({ email: 'test@example.com', fullName: 'Test User', role: 'Admin' });
  });

  it('should clear user on logout', () => {
    useAuthStore.getState().login('test@example.com', 'Test User', 'Admin');
    useAuthStore.getState().logout();
    const { user } = useAuthStore.getState();
    expect(user).toBeNull();
  });

  it('should return true for isAuthenticated after login', () => {
    useAuthStore.getState().login('test@example.com', 'Test User', 'Admin');
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
  });

  it('should return false for isAuthenticated after logout', () => {
    useAuthStore.getState().login('test@example.com', 'Test User', 'Admin');
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });

  it('should return true for isAdmin when role is Admin and false for others', () => {
    useAuthStore.getState().login('test@example.com', 'Test User', 'Admin');
    expect(useAuthStore.getState().isAdmin()).toBe(true);
    expect(useAuthStore.getState().isAgent()).toBe(false);
    expect(useAuthStore.getState().isDriver()).toBe(false);
    expect(useAuthStore.getState().isWarehouseManager()).toBe(false);
  });

  it('should return true for isAgent when role is Agent', () => {
    useAuthStore.getState().login('test@example.com', 'Test User', 'Agent');
    expect(useAuthStore.getState().isAdmin()).toBe(false);
    expect(useAuthStore.getState().isAgent()).toBe(true);
    expect(useAuthStore.getState().isDriver()).toBe(false);
    expect(useAuthStore.getState().isWarehouseManager()).toBe(false);
  });

  it('should return true for isDriver when role is Driver', () => {
    useAuthStore.getState().login('test@example.com', 'Test User', 'Driver');
    expect(useAuthStore.getState().isDriver()).toBe(true);
  });

  it('should return true for isWarehouseManager when role is WarehouseManager', () => {
    useAuthStore.getState().login('test@example.com', 'Test User', 'WarehouseManager');
    expect(useAuthStore.getState().isWarehouseManager()).toBe(true);
  });

  it('should persist user via zustand persist middleware', () => {
    useAuthStore.getState().login('test@example.com', 'Test User', 'Admin');
    const stored = JSON.parse(localStorage.getItem('auth-storage') ?? '{}');
    expect(stored.state.user).toEqual({
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'Admin',
    });
  });
});

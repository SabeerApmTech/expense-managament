import { createContext, useContext } from 'react';
import type { AuthUser, Role } from '../types/auth.types';

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: Role | null;
  login: (data: AuthUser) => void;
  logout: () => void;
}

const AUTH_KEY = 'expense-auth';

export const getStoredAuth = (): AuthUser | null => {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as AuthUser;
  } catch {
    return null;
  }
};

export const getStoredToken = (): string | null => getStoredAuth()?.token ?? null;

export const setStoredAuth = (data: AuthUser): void => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
};

export const clearStoredAuth = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

export const AuthContext = createContext<AuthState | null>(null);

export const useAuthContext = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};

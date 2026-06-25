import { createContext, useContext } from 'react';
import type { AuthUser, Role } from '../types/auth.types';

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: Role | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
}

const COOKIE_NAME = 'expense-token';
const USER_KEY = 'expense-user';
const COOKIE_DAYS = 7;

function setCookie(value: string): void {
  const expires = new Date(Date.now() + COOKIE_DAYS * 864e5).toUTCString();
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookieValue(): string | null {
  const match = document.cookie.match(new RegExp('(?:^| )' + COOKIE_NAME + '=([^;]+)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(): void {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export const getStoredToken = (): string | null => getCookieValue();

export const getStoredAuth = (): AuthUser | null => {
  try {
    const token = getCookieValue();
    if (!token) return null;
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as AuthUser;
  } catch {
    return null;
  }
};

export const setStoredAuth = (user: AuthUser, token: string): void => {
  setCookie(token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredAuth = (): void => {
  deleteCookie();
  localStorage.removeItem(USER_KEY);
};

export const AuthContext = createContext<AuthState | null>(null);

export const useAuthContext = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};

import type { AuthUser } from '../types/auth.types';

export const canAccessExpenses = (user: AuthUser | null): boolean =>
  !!user && (user.role === 'USER' || user.isInitiator || user.isAccountant);

export const canAccessApprovals = (user: AuthUser | null): boolean =>
  !!user && (user.isInitiator || user.role === 'ADMIN' || user.role === 'SUPERADMIN');

export const canAccessAccounts = (user: AuthUser | null): boolean =>
  !!user && user.isAccountant;

export const canAccessUserManagement = (user: AuthUser | null): boolean =>
  !!user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN');

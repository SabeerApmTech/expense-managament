import type { AuthUser } from '../types/auth.types';

export const canAccessExpenses = (user: AuthUser | null): boolean =>
  !!user && (user.role === 'USER' || user.isInitiator || user.isAccountant);

export const canAccessApprovals = (user: AuthUser | null): boolean =>
  !!user && (user.isInitiator || user.role === 'ADMIN' || user.role === 'SUPERADMIN');

export const canAccessAccounts = (user: AuthUser | null): boolean =>
  !!user && user.isAccountant;

export const canAccessUserManagement = (user: AuthUser | null): boolean =>
  !!user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN');

// Asset creators see their own office's assets; ADMIN/SUPERADMIN see every office's
// (read-only) — same nav entry, the page itself branches on role.
export const canAccessAssets = (user: AuthUser | null): boolean =>
  !!user && (user.isAssetCreator || user.role === 'ADMIN' || user.role === 'SUPERADMIN');

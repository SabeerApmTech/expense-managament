import type { Role } from '../types/auth.types';

// Accounts-department USERs land on the admin approvals screen (where they settle
// expenses via "View Details") instead of the regular "My Expenses" screen.
export const getHomeRoute = (role: Role | null, department?: string | null): string => {
  if (role === 'USER' && department !== 'Accounts') return '/expenses';
  return '/admin/approvals';
};

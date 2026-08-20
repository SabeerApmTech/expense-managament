import type { Role } from '../types/auth.types';
import { ROUTES } from '../constants/masterData';

export const getHomeRoute = (role: Role | null): string => {
  if (role === 'ADMIN' || role === 'SUPERADMIN') return ROUTES.APPROVALS;
  return ROUTES.EXPENSES;
};

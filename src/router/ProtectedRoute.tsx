import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../store/authStore';
import { getHomeRoute } from '../utils/routing';
import type { Role } from '../types/auth.types';

interface Props {
  allowedRoles?: Role[];
  allowedDepartments?: string[];
}

// allowedRoles and allowedDepartments are OR'd together: access is granted if the
// user's role matches allowedRoles, OR their department matches allowedDepartments
// (this is how Accounts-department USER-role staff reach the admin approvals page).
export const ProtectedRoute = ({ allowedRoles, allowedDepartments }: Props) => {
  const { isAuthenticated, role, user } = useAuthContext();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const roleAllowed = !!allowedRoles && !!role && allowedRoles.includes(role);
  const departmentAllowed = !!allowedDepartments && allowedDepartments.includes(user?.department ?? '');

  if ((allowedRoles || allowedDepartments) && !roleAllowed && !departmentAllowed) {
    return <Navigate to={getHomeRoute(role, user?.department)} replace />;
  }

  return <Outlet />;
};

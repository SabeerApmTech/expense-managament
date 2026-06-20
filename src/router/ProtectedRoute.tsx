import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../store/authStore';
import type { Role } from '../types/auth.types';

interface Props {
  allowedRoles?: Role[];
}

export const ProtectedRoute = ({ allowedRoles }: Props) => {
  const { isAuthenticated, role } = useAuthContext();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'USER' ? '/expenses' : '/admin/approvals'} replace />;
  }

  return <Outlet />;
};

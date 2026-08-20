import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '../store/authStore';
import { getHomeRoute } from '../utils/routing';
import type { AuthUser } from '../types/auth.types';

interface Props {
  allow: (user: AuthUser) => boolean;
}

export const ProtectedRoute = ({ allow }: Props) => {
  const { isAuthenticated, role, user } = useAuthContext();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allow(user)) {
    return <Navigate to={getHomeRoute(role)} replace />;
  }

  return <Outlet />;
};

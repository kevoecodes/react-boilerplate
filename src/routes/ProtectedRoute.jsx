import { Navigate, Outlet, useLocation } from 'react-router-dom';
import FullPageSpinner from '@/components/FullPageSpinner';
import { useAuth } from '@/hooks/useAuth';

/** Renders child routes only for logged-in users; otherwise redirects to /login. */
export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

/** The inverse: keeps logged-in users away from /login. */
export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;
  if (isAuthenticated) return <Navigate to={location.state?.from?.pathname ?? '/'} replace />;
  return <Outlet />;
}

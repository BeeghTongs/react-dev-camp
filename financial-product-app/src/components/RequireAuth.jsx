import { Navigate } from 'react-router-dom';
import { useAuthUser } from '../services/useAuthUser';

export default function RequireAuth({ children, allowGuest = true, requireGuest = false }) {
  const user = useAuthUser();
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
  const hasJwtToken = Boolean(token);
  const isAuthenticated = Boolean(user || hasJwtToken);

  if (user === undefined && !token) {
    return <div>Loading...</div>;
  }

  const isGuest = !hasJwtToken && user?.isAnonymous === true;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireGuest && !isGuest) {
    return <Navigate to="/list" replace />;
  }

  if (!allowGuest && isGuest) {
    return <Navigate to="/guest-list" replace />;
  }

  return children;
}
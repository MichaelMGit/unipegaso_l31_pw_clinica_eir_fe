import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardRoute } from '../constants/userRoles';

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Navigate to={getDashboardRoute(user.ruolo)} replace />;
  }

  return children;
}
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardRoute } from '../constants/userRoles';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return null; 

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.ruolo)) {
    return <Navigate to={getDashboardRoute(user.ruolo)} replace />;
  }

  return children;
}
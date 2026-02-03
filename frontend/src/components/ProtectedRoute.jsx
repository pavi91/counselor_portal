import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { hasPermission } from '../services/authService';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  // 1. If not logged in, go to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If logged in but role is not allowed, go to Unauthorized
  if (!hasPermission(user.role, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Authorized? Render child routes
  return <Outlet />;
};

export default ProtectedRoute;
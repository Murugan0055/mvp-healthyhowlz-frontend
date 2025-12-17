import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component to guard routes that require authentication
 * Redirects to login if user is not authenticated
 * Preserves the attempted location for redirect after login
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show nothing or a loader while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Role-based access control
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on user's actual role to avoid unauthorized access
    if (user.role === 'trainer') {
      return <Navigate to="/trainer" replace />;
    } else if (user.role === 'gym_owner') {
      return <Navigate to="/gym-owner" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // User is authenticated and authorized, render the protected content
  return children;
};

export default ProtectedRoute;

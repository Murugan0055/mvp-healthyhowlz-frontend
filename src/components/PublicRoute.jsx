import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PublicRoute component for routes that should only be accessible when NOT authenticated
 * (e.g., Login, Signup pages)
 * Redirects to dashboard if user is already authenticated
 */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

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

  // If already authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  // User is not authenticated, show the public page (login/signup)
  return children;
};

export default PublicRoute;

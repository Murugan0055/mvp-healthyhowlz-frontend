import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import { AuthProvider } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import DietTracker from './pages/DietTracker'
import ForgotPassword from './pages/ForgotPassword'
import Login from './pages/Login'
import MealDetailPage from './pages/MealDetailPage'
import MealsListPage from './pages/MealsListPage'
import NotFound from './pages/NotFound'
import Signup from './pages/Signup'
import WorkoutTracker from './pages/WorkoutTracker'

function App() {
  return (
    <AuthProvider>
      <PWAInstallPrompt />
      <Routes>
        {/* Public Routes - Only accessible when NOT logged in */}
        <Route
          path="/auth/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/auth/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/auth/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* Protected Routes - Require authentication */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="diet" element={<DietTracker />} />
          <Route path="workout" element={<WorkoutTracker />} />
          {/* Meal Detail Routes - Also Protected */}
          <Route
            path="/diet/meals/:id"
            element={
              <ProtectedRoute>
                <MealDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/diet/meals/all"
            element={
              <ProtectedRoute>
                <MealsListPage />
              </ProtectedRoute>
            }
          />
        </Route>


        {/* Fallback Routes */}
        {/* Redirect /login to /auth/login for convenience */}
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />

        {/* 404 Not Found - Must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}

export default App

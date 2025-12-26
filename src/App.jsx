import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import { AuthProvider } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import DietTracker from './pages/DietTracker'
import DietPlanScreen from './components/diet/DietPlanScreen'
import ForgotPassword from './pages/ForgotPassword'
import Login from './pages/Login'
import MealDetailPage from './pages/MealDetailPage'
import MealsListPage from './pages/MealsListPage'
import NotFound from './pages/NotFound'
import Signup from './pages/Signup'
import WorkoutTracker from './pages/WorkoutTracker'
import WorkoutPlanScreen from './components/workout/WorkoutPlanScreen'
import WorkoutListPage from './pages/WorkoutListPage'
import Profile from './pages/Profile'
import BodyMetrics from './pages/BodyMetrics'
import BodyMeasurements from './pages/BodyMeasurements'
import TrainerLanding from './pages/TrainerLanding'
import GymOwnerLanding from './pages/GymOwnerLanding'
import TrainerClients from './pages/TrainerClients'
import TrainerAddClient from './pages/TrainerAddClient'
import TrainerClientDetail from './pages/TrainerClientDetail'
import TrainerLayout from './components/TrainerLayout'
import TrainerLibrary from './pages/TrainerLibrary'
import TrainerDietPlanBuilder from './pages/TrainerDietPlanBuilder'

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
            <ProtectedRoute allowedRoles={['client']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="diet" element={<DietTracker />} />
          <Route path="/diet/plan" element={<DietPlanScreen />} />
          <Route path="workout" element={<WorkoutTracker />} />
          <Route path="/workout/plan" element={<WorkoutPlanScreen />} />
          <Route path="/workout/all" element={<WorkoutListPage />} />
          {/* Meal Detail Routes - Also Protected */}
          <Route
            path="/diet/meals/:id"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <MealDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/diet/meals/all"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <MealsListPage />
              </ProtectedRoute>
            }
          />

          {/* Profile Routes */}
          <Route path="profile" element={<Profile />} />
          <Route path="profile/body-metrics" element={<BodyMetrics />} />
          <Route path="profile/body-measurements" element={<BodyMeasurements />} />
        </Route >

        {/* Trainer Routes */}
        <Route
          path="/trainer"
          element={
            <ProtectedRoute allowedRoles={['trainer']}>
              <TrainerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TrainerLanding />} />
          <Route path="clients" element={<TrainerClients />} />
          <Route path="clients/add" element={<TrainerAddClient />} />
          <Route path="clients/:clientId" element={<TrainerClientDetail />} />

          <Route path="clients/:clientId/diet" element={<DietTracker />} />
          <Route path="clients/:clientId/diet/plan" element={<DietPlanScreen />} />
          <Route path="clients/:clientId/diet/plan/new" element={<TrainerDietPlanBuilder />} />
          <Route path="clients/:clientId/diet/meals/all" element={<MealsListPage />} />

          <Route path="library" element={<TrainerLibrary />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Gym Owner Routes */}
        <Route
          path="/gym-owner"
          element={
            <ProtectedRoute allowedRoles={['gym_owner']}>
              <GymOwnerLanding />
            </ProtectedRoute>
          }
        />


        {/* Fallback Routes */}
        {/* Redirect /login to /auth/login for convenience */}
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />

        {/* 404 Not Found - Must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes >
    </AuthProvider >
  )
}

export default App

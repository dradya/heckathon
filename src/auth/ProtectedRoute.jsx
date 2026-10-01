import { Navigate, useLocation } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import { useAuth } from './AuthProvider'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingState label="Checking your account..." />

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

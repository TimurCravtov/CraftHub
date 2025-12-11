import { Navigate, Outlet } from 'react-router-dom'
import { useAuthApi } from '../context/apiAuthContext'

export default function ProtectedRoute({ allowedRoles }) {
  const { user, accessToken } = useAuthApi()
    console.log('ProtectedRoute - user:', user)
  if (!accessToken || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = user.roles?.some(role => allowedRoles.includes(role))
    if (!hasRole) {
      // User logged in but doesn't have permission
      return <Navigate to="/" replace />
    }
  }

  return <Outlet />
}

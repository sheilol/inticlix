import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../context/useAuth'
import { t } from '../lib/i18n'

export default function ProtectedRoute({ children, admin = false, lang }) {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) return <main className="auth-page"><p>{t(lang, 'loading')}</p></main>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (admin && !isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

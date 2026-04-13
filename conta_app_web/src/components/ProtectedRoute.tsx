import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type Props = {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth()

  // Pendant le chargement
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  // Si pas connecté → redirect login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Sinon accès autorisé
  return <>{children}</>
}
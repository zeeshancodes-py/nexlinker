import { useSelector } from 'react-redux'

export function useAuth() {
  const { user, isAuthenticated, loading } = useSelector(s => s.auth)
  return { user, isAuthenticated, loading }
}
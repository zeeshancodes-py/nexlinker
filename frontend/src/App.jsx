import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuth } from './store/authSlice'
import PrivateRoute from './components/common/PrivateRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import NetworkPage from './pages/NetworkPage'
import MessagesPage from './pages/MessagesPage'
import NotificationsPage from './pages/NotificationsPage'
import JobsPage from './pages/JobsPage'
import SearchPage from './pages/SearchPage'
import LoadingSpinner from './components/common/LoadingSpinner'

export default function App() {
  const dispatch = useDispatch()
  const { loading, isAuthenticated } = useSelector(s => s.auth)

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  if (loading) return <LoadingSpinner fullPage />

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <LandingPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <LoginPage />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/home" /> : <SignupPage />} />
      <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/profile/:userId" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/profile/edit" element={<PrivateRoute><EditProfilePage /></PrivateRoute>} />
      <Route path="/network" element={<PrivateRoute><NetworkPage /></PrivateRoute>} />
      <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
      <Route path="/jobs" element={<PrivateRoute><JobsPage /></PrivateRoute>} />
      <Route path="/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />
    </Routes>
  )
}
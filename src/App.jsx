import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import MenuPage from './pages/MenuPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import PaymentPage from './pages/PaymentPage'
import KitchenPage from './pages/KitchenPage'
import AdminPage from './pages/AdminPage'
import AuthPage from './pages/AuthPage'
import TablePage from './pages/TablePage'
import { CircularProgress, Box } from '@mui/material'

function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress sx={{ color: '#8B4513' }} />
    </Box>
  )
  if (!user) return <Navigate to="/auth" replace state={{ from: location }} />
  if (requiredRole && profile?.role !== requiredRole && profile?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public QR table route */}
      <Route path="/table/:tableId" element={<TablePage />} />
      <Route path="/auth" element={<AuthPage />} />

      {/* Main layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="orders" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
        <Route path="payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="kitchen" element={
          <ProtectedRoute requiredRole="kitchen"><KitchenPage /></ProtectedRoute>
        } />
        <Route path="admin" element={
          <ProtectedRoute requiredRole="admin"><AdminPage /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

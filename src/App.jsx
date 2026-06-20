import { Routes, Route, Navigate } from 'react-router-dom'
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
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress sx={{ color: '#8B4513' }} />
    </Box>
  )
  // Demo mode: skip auth check
  // if (!user) return <Navigate to="/auth" replace />
  // if (requiredRole && profile?.role !== requiredRole && profile?.role !== 'admin') return <Navigate to="/" replace />
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
        <Route path="orders" element={<OrderTrackingPage />} />
        <Route path="payment" element={<PaymentPage />} />
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

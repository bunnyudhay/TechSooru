import { Box, Typography, Paper, Stack, Chip, Divider, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant'
import { useOrders } from '../contexts/OrderContext'
import OrderStatusChip from '../components/tracking/OrderStatusChip'

const STEPS = [
  { key: 'placed',    label: 'Order Placed', icon: '📝' },
  { key: 'preparing', label: 'Preparing',    icon: '👨‍🍳' },
  { key: 'ready',     label: 'Ready!',       icon: '✅' },
]

function getStepIndex(status) {
  if (status === 'pending')   return 0
  if (status === 'preparing') return 1
  if (status === 'ready' || status === 'served') return 2
  return 0
}

function StatusStepper({ status }) {
  const activeIdx = getStepIndex(status)
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
      {STEPS.map((step, i) => (
        <Box key={step.key} sx={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 18, border: '2px solid',
              bgcolor: i < activeIdx ? '#2E7D32' : i === activeIdx ? '#FF6B35' : 'white',
              borderColor: i < activeIdx ? '#2E7D32' : i === activeIdx ? '#FF6B35' : '#E0E0E0',
              boxShadow: i === activeIdx ? '0 0 0 4px rgba(255,107,53,0.2)' : 'none',
              transition: 'all 0.4s',
            }}>
              {step.icon}
            </Box>
            <Typography sx={{
              fontSize: 11, mt: 0.5, textAlign: 'center', color: i === activeIdx ? '#FF6B35' : '#8B6A5A',
              fontWeight: i === activeIdx ? 700 : 400
            }}>
              {step.label}
            </Typography>
          </Box>
          {i < STEPS.length - 1 && (
            <Box sx={{
              flex: 1, height: 2, mb: 3, mx: 0.5,
              bgcolor: i < activeIdx ? '#2E7D32' : '#E0E0E0',
              transition: 'background-color 0.4s'
            }} />
          )}
        </Box>
      ))}
    </Box>
  )
}

export default function OrderTrackingPage() {
  const navigate = useNavigate()
  const { orders } = useOrders()

  if (orders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography sx={{ fontSize: 56, mb: 2 }}>📋</Typography>
        <Typography variant="h5" sx={{ mb: 1 }}>No orders yet</Typography>
        <Typography sx={{ color: '#8B6A5A', mb: 3 }}>Place an order to track it here</Typography>
        <Button variant="contained" onClick={() => navigate('/menu')}
          sx={{ bgcolor: '#8B4513', '&:hover': { bgcolor: '#A0522D' } }}>
          Browse Menu
        </Button>
      </Box>
    )
  }

  return (
    <Box className="fade-in">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontSize: 28, mb: 0.5 }}>My Orders</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box className="pulse" sx={{ width: 8, height: 8, bgcolor: '#4CAF50', borderRadius: '50%' }} />
          <Typography sx={{ color: '#8B6A5A', fontSize: 14 }}>Live updates via Supabase Realtime</Typography>
        </Box>
      </Box>

      <Stack spacing={2.5}>
        {orders.map(order => (
          <Paper key={order.id} elevation={0} sx={{
            border: '1px solid rgba(212,163,115,0.25)', borderRadius: 4, overflow: 'hidden'
          }}>
            {/* Order Header */}
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography sx={{ fontSize: 13, color: '#8B6A5A', fontWeight: 500 }}>{order.id}</Typography>
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#D4A373' }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <TableRestaurantIcon sx={{ fontSize: 13, color: '#8B6A5A' }} />
                    <Typography sx={{ fontSize: 13, color: '#8B6A5A' }}>Table {order.table_number}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <AccessTimeIcon sx={{ fontSize: 13, color: '#8B6A5A' }} />
                    <Typography sx={{ fontSize: 12, color: '#8B6A5A' }}>
                      {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#8B4513', fontWeight: 700 }}>
                  ₹{order.total || order.amount}
                </Typography>
                <Typography sx={{ fontSize: 13, color: '#8B6A5A', mt: 0.3 }}>
                  {(order.items || []).map(i => `${i.name} ×${i.qty || i.quantity}`).join(', ')}
                </Typography>
              </Box>
              <OrderStatusChip status={order.status} />
            </Box>

            <Divider sx={{ borderColor: 'rgba(212,163,115,0.2)' }} />

            {/* Stepper */}
            <Box sx={{ px: 3, pb: 2 }}>
              <StatusStepper status={order.status} />
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}

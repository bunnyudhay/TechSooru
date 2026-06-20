import { Box, Typography, Button, Chip, Stack, Divider } from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant'
import { useOrders } from '../../contexts/OrderContext'

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  return `${Math.floor(diff / 60)}m ago`
}

const HEADER_COLORS = {
  pending:   { bg: 'rgba(245,127,23,0.1)',  text: '#F57F17' },
  preparing: { bg: 'rgba(255,107,53,0.1)',  text: '#FF6B35' },
  ready:     { bg: 'rgba(46,125,50,0.1)',   text: '#2E7D32' },
}

export default function KitchenOrderCard({ order }) {
  const { updateOrderStatus } = useOrders()
  const isNew = order.status === 'pending'
  const cfg = HEADER_COLORS[order.status] || HEADER_COLORS.pending

  return (
    <Box sx={{
      bgcolor: '#FFFCF8', borderRadius: 4, overflow: 'hidden',
      border: isNew ? '2px solid #FF6B35' : '1px solid rgba(212,163,115,0.25)',
      boxShadow: '0 2px 16px rgba(139,69,19,0.1)',
      className: isNew ? 'order-glow' : '',
      animation: isNew ? 'orderGlow 2s ease-in-out infinite' : 'none',
      transition: 'all 0.3s',
    }}>
      {/* Card Header */}
      <Box sx={{ px: 2, py: 1.5, bgcolor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{order.id}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
            <TableRestaurantIcon sx={{ fontSize: 13, color: '#8B6A5A' }} />
            <Typography sx={{ fontSize: 12, color: '#8B6A5A' }}>Table {order.table_number}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={order.status === 'pending' ? '⏳ Pending' : order.status === 'preparing' ? '🔥 Preparing' : '✅ Ready'}
            size="small"
            sx={{ bgcolor: cfg.bg, color: cfg.text, fontWeight: 600, fontSize: 11 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, bgcolor: 'rgba(0,0,0,0.06)', borderRadius: 1, px: 1, py: 0.3 }}>
            <AccessTimeIcon sx={{ fontSize: 12, color: '#8B6A5A' }} />
            <Typography sx={{ fontSize: 11, color: '#8B6A5A' }}>{timeAgo(order.created_at)}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Items */}
      <Box sx={{ bgcolor: 'white', px: 2, py: 1 }}>
        <Stack divider={<Divider sx={{ borderColor: 'rgba(212,163,115,0.15)' }} />}>
          {(order.items || []).map((item, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
              <Box sx={{
                bgcolor: '#E8C9A0', color: '#8B4513', borderRadius: '6px',
                px: 1, py: 0.3, fontSize: 12, fontWeight: 700, minWidth: 32, textAlign: 'center'
              }}>
                ×{item.qty || item.quantity}
              </Box>
              <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{item.name}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Actions */}
      <Box sx={{ px: 2, py: 1.5, bgcolor: '#FAFAFA', display: 'flex', gap: 1 }}>
        {order.status === 'pending' && (
          <Button fullWidth variant="contained" size="small"
            onClick={() => updateOrderStatus(order.id, 'preparing')}
            sx={{ bgcolor: '#FF6B35', '&:hover': { bgcolor: '#FF8C5A' }, fontSize: 12, fontWeight: 700 }}>
            🔥 Start Preparing
          </Button>
        )}
        {order.status === 'preparing' && (
          <Button fullWidth variant="contained" size="small"
            onClick={() => updateOrderStatus(order.id, 'ready')}
            sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#388E3C' }, fontSize: 12, fontWeight: 700 }}>
            ✅ Mark as Ready
          </Button>
        )}
        {order.status === 'ready' && (
          <Button fullWidth variant="contained" size="small"
            onClick={() => updateOrderStatus(order.id, 'served')}
            sx={{ bgcolor: '#8B4513', '&:hover': { bgcolor: '#A0522D' }, fontSize: 12, fontWeight: 700 }}>
            🍽️ Mark as Served
          </Button>
        )}
        {order.status === 'served' && (
          <Box sx={{ textAlign: 'center', width: '100%', py: 0.5 }}>
            <Typography sx={{ fontSize: 12, color: '#8B6A5A', fontWeight: 500 }}>✅ Order Completed</Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

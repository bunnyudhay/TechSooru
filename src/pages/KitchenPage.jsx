import { Box, Typography, Grid, Chip, Stack, Select, MenuItem, FormControl } from '@mui/material'
import { useState } from 'react'
import { useOrders } from '../contexts/OrderContext'
import KitchenOrderCard from '../components/kitchen/KitchenOrderCard'

const STATUS_FILTERS = ['all', 'pending', 'preparing', 'ready']

export default function KitchenPage() {
  const { orders } = useOrders()
  const [filter, setFilter] = useState('all')

  const filtered = orders.filter(o =>
    filter === 'all' ? ['pending', 'preparing', 'ready'].includes(o.status) : o.status === filter
  )

  const counts = {
    pending:   orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready:     orders.filter(o => o.status === 'ready').length,
  }

  return (
    <Box className="fade-in">
      {/* Kitchen Header */}
      <Box sx={{
        bgcolor: '#2C1810', borderRadius: 4, p: { xs: 2.5, md: 3 }, mb: 3,
        display: 'flex', alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between', flexDirection: { xs: 'column', md: 'row' }, gap: 2
      }}>
        <Box>
          <Typography variant="h4" sx={{ color: 'white', fontSize: { xs: 22, md: 26 } }}>
            🧑‍🍳 Kitchen Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Box className="pulse" sx={{ width: 8, height: 8, bgcolor: '#4CAF50', borderRadius: '50%' }} />
            <Typography sx={{ color: '#D4A373', fontSize: 13 }}>
              Live orders · Supabase Realtime active
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1.5}>
          {[
            { label: 'Pending', count: counts.pending, color: '#F57F17' },
            { label: 'Preparing', count: counts.preparing, color: '#FF6B35' },
            { label: 'Ready', count: counts.ready, color: '#4CAF50' },
          ].map(stat => (
            <Box key={stat.label} sx={{
              bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 3, px: 2, py: 1, textAlign: 'center', minWidth: 70
            }}>
              <Typography sx={{ fontFamily: "'Playfair Display', serif", color: stat.color, fontSize: 22, fontWeight: 700 }}>
                {stat.count}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{stat.label}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Filter Tabs */}
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        {STATUS_FILTERS.map(s => (
          <Chip
            key={s}
            label={s === 'all' ? `All (${filtered.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${counts[s] || 0})`}
            onClick={() => setFilter(s)}
            sx={{
              cursor: 'pointer', fontWeight: 600, height: 34, fontSize: 13,
              bgcolor: filter === s ? '#8B4513' : 'white',
              color: filter === s ? 'white' : '#5C3D2E',
              border: `1.5px solid ${filter === s ? '#8B4513' : 'rgba(212,163,115,0.4)'}`,
            }}
          />
        ))}
      </Stack>

      {/* Orders Grid */}
      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography sx={{ fontSize: 64, mb: 2 }}>🍳</Typography>
          <Typography variant="h5" sx={{ mb: 1 }}>No active orders</Typography>
          <Typography sx={{ color: '#8B6A5A' }}>New orders will appear here instantly</Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map(order => (
            <Grid item xs={12} sm={6} lg={4} key={order.id}>
              <KitchenOrderCard order={order} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

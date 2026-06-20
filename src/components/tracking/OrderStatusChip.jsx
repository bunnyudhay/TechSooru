import { Chip } from '@mui/material'

const STATUS_CONFIG = {
  pending:   { label: '⏳ Pending',   bgcolor: 'rgba(245,127,23,0.12)', color: '#F57F17' },
  preparing: { label: '🔥 Preparing', bgcolor: 'rgba(255,107,53,0.12)', color: '#FF6B35' },
  ready:     { label: '✅ Ready',     bgcolor: 'rgba(46,125,50,0.12)',  color: '#2E7D32' },
  served:    { label: '🍽️ Served',    bgcolor: 'rgba(92,61,46,0.1)',    color: '#5C3D2E' },
  cancelled: { label: '✕ Cancelled',  bgcolor: 'rgba(198,40,40,0.1)',  color: '#C62828' },
}

export default function OrderStatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{ bgcolor: cfg.bgcolor, color: cfg.color, fontWeight: 600, fontSize: 12, height: 28 }}
    />
  )
}

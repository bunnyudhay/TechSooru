import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import { useCart } from '../contexts/CartContext'

export default function TablePage() {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const { setTable } = useCart()

  useEffect(() => {
    if (tableId) {
      setTable(parseInt(tableId))
      // Auto-redirect after 2s
      const timer = setTimeout(() => navigate(`/menu?table=${tableId}`), 2000)
      return () => clearTimeout(timer)
    }
  }, [tableId, setTable, navigate])

  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: '#2C1810',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      p: 3, textAlign: 'center'
    }}>
      <Box sx={{ fontSize: 72, mb: 3 }}>🍛</Box>
      <Typography sx={{ fontFamily: "'Playfair Display', serif", color: 'white', fontSize: 32, mb: 1 }}>
        Welcome to TechSooru
      </Typography>
      <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, mb: 3 }}>
        You're at <Box component="span" sx={{ color: '#FF6B35', fontWeight: 700 }}>Table {tableId}</Box>
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <CircularProgress size={20} sx={{ color: '#D4A373' }} />
        <Typography sx={{ color: '#D4A373', fontSize: 14 }}>Loading your menu...</Typography>
      </Box>
      <Button
        variant="contained"
        onClick={() => navigate(`/menu?table=${tableId}`)}
        sx={{ bgcolor: '#FF6B35', '&:hover': { bgcolor: '#FF8C5A' }, px: 4, py: 1.5, fontSize: 15 }}
      >
        View Menu Now
      </Button>
    </Box>
  )
}

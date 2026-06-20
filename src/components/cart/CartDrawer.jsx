import { useNavigate } from 'react-router-dom'
import {
  Drawer, Box, Typography, IconButton, Button, Divider,
  Stack, Avatar
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import { useCart } from '../../contexts/CartContext'

export default function CartDrawer({ open, onClose }) {
  const navigate = useNavigate()
  const { items, itemCount, subtotal, tax, total, addItem, removeItem } = useCart()

  function handleCheckout() {
    onClose()
    navigate('/payment')
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 380 }, bgcolor: '#FFFCF8', display: 'flex', flexDirection: 'column' } }}>

      {/* Header */}
      <Box sx={{ bgcolor: '#2C1810', px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontFamily: "'Playfair Display', serif", color: 'white', fontSize: 20 }}>
          🛒 Your Order
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Items */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ShoppingCartOutlinedIcon sx={{ fontSize: 56, color: '#D4A373', mb: 2 }} />
            <Typography sx={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#1A0A00', mb: 1 }}>
              Cart is empty
            </Typography>
            <Typography sx={{ color: '#8B6A5A', fontSize: 14 }}>Add items from the menu</Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {items.map(item => (
              <Box key={item.id} sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
                bgcolor: 'white', borderRadius: 3, border: '1px solid rgba(212,163,115,0.2)'
              }}>
                <Avatar sx={{ width: 44, height: 44, bgcolor: '#E8C9A0', fontSize: 22, borderRadius: '10px' }}>
                  {item.emoji}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{item.name}</Typography>
                  <Typography sx={{ fontSize: 13, color: '#8B6A5A' }}>₹{item.price} × {item.qty}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <IconButton size="small" onClick={() => removeItem(item.id)}
                    sx={{ bgcolor: 'rgba(139,69,19,0.1)', color: '#8B4513', width: 28, height: 28 }}>
                    <RemoveIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, minWidth: 20, textAlign: 'center' }}>
                    {item.qty}
                  </Typography>
                  <IconButton size="small" onClick={() => addItem(item)}
                    sx={{ bgcolor: '#8B4513', color: 'white', width: 28, height: 28, '&:hover': { bgcolor: '#A0522D' } }}>
                    <AddIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {/* Footer */}
      {items.length > 0 && (
        <Box sx={{ p: 2.5, borderTop: '1px solid rgba(212,163,115,0.3)', bgcolor: 'white' }}>
          <Stack spacing={1} sx={{ mb: 2 }}>
            {[
              { label: 'Subtotal', value: `₹${subtotal}` },
              { label: 'GST (5%)', value: `₹${tax}` },
            ].map(row => (
              <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 14, color: '#5C3D2E' }}>{row.label}</Typography>
                <Typography sx={{ fontSize: 14, color: '#5C3D2E' }}>{row.value}</Typography>
              </Box>
            ))}
            <Divider sx={{ borderColor: 'rgba(212,163,115,0.3)' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Total</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#8B4513' }}>₹{total}</Typography>
            </Box>
          </Stack>
          <Button fullWidth variant="contained" onClick={handleCheckout}
            sx={{ py: 1.6, fontSize: 15, bgcolor: '#FF6B35', '&:hover': { bgcolor: '#FF8C5A' } }}>
            Proceed to Checkout →
          </Button>
        </Box>
      )}
    </Drawer>
  )
}

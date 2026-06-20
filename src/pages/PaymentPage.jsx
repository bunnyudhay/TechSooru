import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Button, TextField, Stack, Divider,
  CircularProgress, Alert, Paper
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LockIcon from '@mui/icons-material/Lock'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useOrders } from '../contexts/OrderContext'

function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function PaymentPage() {
  const navigate = useNavigate()
  const { items, subtotal, tax, total, tableNumber, clearCart } = useCart()
  const { user } = useAuth()
  const { createOrder } = useOrders()
  const [table, setTable] = useState(tableNumber || '')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography sx={{ fontSize: 48, mb: 2 }}>🛒</Typography>
        <Typography variant="h5" sx={{ mb: 2 }}>Your cart is empty</Typography>
        <Button variant="contained" onClick={() => navigate('/menu')}
          sx={{ bgcolor: '#8B4513', '&:hover': { bgcolor: '#A0522D' } }}>
          Browse Menu
        </Button>
      </Box>
    )
  }

  async function handlePayment() {
    if (!table) { setError('Please enter your table number'); return }
    setLoading(true)
    setError('')

    const loaded = await loadRazorpay()
    if (!loaded) {
      setError('Payment gateway failed to load. Please try again.')
      setLoading(false)
      return
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      amount: total * 100, // paise
      currency: 'INR',
      name: 'TechSooru',
      description: `Table ${table} — ${items.length} item(s)`,
      image: '',
      theme: { color: '#8B4513' },
      prefill: { email: user?.email || '' },
      handler: async (response) => {
        try {
          await createOrder({
            userId: user?.id || null,
            tableNumber: parseInt(table),
            items,
            subtotal,
            tax,
            total,
            paymentId: response.razorpay_payment_id,
            notes,
          })
          clearCart()
          navigate('/orders')
        } catch (err) {
          setError('Order placement failed. Please contact staff.')
        } finally {
          setLoading(false)
        }
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  return (
    <Box className="fade-in" sx={{ maxWidth: 480, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/menu')}
        sx={{ color: '#8B4513', mb: 2, fontWeight: 600 }}>
        Back to Menu
      </Button>

      {/* Order Summary */}
      <Paper elevation={0} sx={{ border: '1px solid rgba(212,163,115,0.25)', borderRadius: 4, p: 3, mb: 2 }}>
        <Typography variant="h5" sx={{ mb: 2.5 }}>Order Summary</Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {items.map(item => (
            <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: 18 }}>{item.emoji}</Typography>
                <Typography sx={{ fontSize: 14 }}>{item.name}</Typography>
                <Typography sx={{ fontSize: 12, color: '#8B6A5A' }}>×{item.qty}</Typography>
              </Box>
              <Typography sx={{ fontWeight: 500, fontSize: 14 }}>₹{item.price * item.qty}</Typography>
            </Box>
          ))}
        </Stack>
        <Divider sx={{ borderStyle: 'dashed', borderColor: 'rgba(212,163,115,0.4)', my: 1.5 }} />
        <Stack spacing={0.8}>
          {[
            { label: 'Subtotal', value: `₹${subtotal}` },
            { label: 'GST (5%)', value: `₹${tax}` },
          ].map(row => (
            <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 14, color: '#5C3D2E' }}>{row.label}</Typography>
              <Typography sx={{ fontSize: 14, color: '#5C3D2E' }}>{row.value}</Typography>
            </Box>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Total</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#8B4513', fontFamily: "'Playfair Display', serif" }}>
              ₹{total}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Table & Notes */}
      <Paper elevation={0} sx={{ border: '1px solid rgba(212,163,115,0.25)', borderRadius: 4, p: 3, mb: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Table & Details</Typography>
        <Stack spacing={2}>
          <TextField
            label="Table Number"
            value={table}
            onChange={e => setTable(e.target.value)}
            size="small" type="number"
            InputProps={{ sx: { borderRadius: 2.5 } }}
          />
          <TextField
            label="Special Instructions"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            size="small" multiline rows={2}
            placeholder="Spice level, allergies, preferences..."
            InputProps={{ sx: { borderRadius: 2.5 } }}
          />
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      {/* Razorpay Button */}
      <Button
        fullWidth
        onClick={handlePayment}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <LockIcon />}
        sx={{
          bgcolor: '#072654', color: 'white', py: 1.8, fontSize: 15, fontWeight: 700, borderRadius: 3,
          '&:hover': { bgcolor: '#0D3875' }, '&:disabled': { bgcolor: '#555' }
        }}
      >
        {loading ? 'Processing...' : `Pay ₹${total} via Razorpay`}
      </Button>
      <Typography sx={{ textAlign: 'center', mt: 1, fontSize: 12, color: '#8B6A5A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <LockIcon sx={{ fontSize: 13 }} /> Secure payment · Test Mode
      </Typography>
    </Box>
  )
}

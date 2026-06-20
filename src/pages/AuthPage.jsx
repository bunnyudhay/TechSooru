import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, TextField, Button, Stack, Divider,
  Alert, CircularProgress, Paper
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

const ROLES = [
  { value: 'customer', icon: '👤', label: 'Customer' },
  { value: 'kitchen',  icon: '🧑‍🍳', label: 'Kitchen Staff' },
  { value: 'admin',    icon: '🛡️', label: 'Admin' },
]

export default function AuthPage() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin')
  const [role, setRole] = useState('customer')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signIn(form.email, form.password)
      } else {
        await signUp(form.email, form.password, form.name, role)
      }
      navigate('/')
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  function handleDemo(demoRole) {
    // Demo login bypass — no real Supabase call needed
    navigate(demoRole === 'kitchen' ? '/kitchen' : demoRole === 'admin' ? '/admin' : '/')
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', pt: 6, px: 2 }}>
      <Paper elevation={0} sx={{
        width: '100%', maxWidth: 420, border: '1px solid rgba(212,163,115,0.25)',
        borderRadius: 5, p: { xs: 3, md: 4.5 }, boxShadow: '0 8px 32px rgba(139,69,19,0.12)'
      }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 3.5 }}>
          <Box sx={{ fontSize: 48, mb: 1 }}>🍛</Box>
          <Typography variant="h3" sx={{ fontSize: 28, color: '#8B4513' }}>TechSooru</Typography>
          <Typography sx={{ color: '#8B6A5A', fontSize: 14 }}>
            {mode === 'signin' ? 'Welcome back! Sign in to continue' : 'Create your account'}
          </Typography>
        </Box>

        {/* Role Selection (signup only) */}
        {mode === 'signup' && (
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#5C3D2E', mb: 1 }}>Select Role</Typography>
            <Stack direction="row" spacing={1}>
              {ROLES.map(r => (
                <Box key={r.value} onClick={() => setRole(r.value)} sx={{
                  flex: 1, p: 1.5, border: `1.5px solid`,
                  borderColor: role === r.value ? '#8B4513' : 'rgba(212,163,115,0.35)',
                  borderRadius: 3, cursor: 'pointer', textAlign: 'center',
                  bgcolor: role === r.value ? 'rgba(139,69,19,0.06)' : 'white',
                  transition: 'all 0.2s',
                }}>
                  <Typography sx={{ fontSize: 22 }}>{r.icon}</Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 500, color: role === r.value ? '#8B4513' : '#5C3D2E', mt: 0.3 }}>
                    {r.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Form */}
        <Stack spacing={2}>
          {mode === 'signup' && (
            <TextField label="Full Name" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              size="small" fullWidth InputProps={{ sx: { borderRadius: 2.5 } }} />
          )}
          <TextField label="Email Address" type="email" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            size="small" fullWidth InputProps={{ sx: { borderRadius: 2.5 } }} />
          <TextField label="Password" type="password" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            size="small" fullWidth InputProps={{ sx: { borderRadius: 2.5 } }} />
        </Stack>

        {error && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>}

        <Button fullWidth variant="contained" onClick={handleSubmit} disabled={loading}
          sx={{ mt: 2.5, py: 1.5, bgcolor: '#8B4513', '&:hover': { bgcolor: '#A0522D' }, fontSize: 15 }}>
          {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> :
            mode === 'signin' ? 'Sign In' : 'Create Account'}
        </Button>

        <Divider sx={{ my: 2.5, color: '#8B6A5A', fontSize: 12 }}>or continue with demo</Divider>

        {/* Demo Buttons */}
        <Stack spacing={1}>
          {ROLES.map(r => (
            <Button key={r.value} onClick={() => handleDemo(r.value)} variant="outlined"
              sx={{ color: '#5C3D2E', borderColor: 'rgba(212,163,115,0.4)', '&:hover': { bgcolor: 'rgba(139,69,19,0.04)', borderColor: '#D4A373' }, justifyContent: 'flex-start', px: 2 }}>
              <Typography sx={{ fontSize: 18, mr: 1.5 }}>{r.icon}</Typography>
              Continue as {r.label} (Demo)
            </Button>
          ))}
        </Stack>

        <Box sx={{ textAlign: 'center', mt: 2.5 }}>
          <Typography sx={{ fontSize: 14, color: '#8B6A5A' }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <Box component="span" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              sx={{ color: '#8B4513', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </Box>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

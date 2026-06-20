import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar, Toolbar, Box, Button, IconButton, Badge, Drawer,
  Typography, Tooltip, Avatar, Menu, MenuItem, Divider
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import CartDrawer from '../cart/CartDrawer'

const NAV_LINKS = [
  { label: 'Menu', path: '/menu' },
  { label: 'My Orders', path: '/orders' },
  { label: 'Kitchen', path: '/kitchen' },
  { label: 'Admin', path: '/admin' },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { itemCount } = useCart()
  const { user, profile, signOut } = useAuth()
  const [cartOpen, setCartOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* TOP BAR */}
      <AppBar position="sticky" sx={{ bgcolor: '#2C1810', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
        <Toolbar sx={{ px: { xs: 2, md: 3 }, gap: 1 }}>
          {/* Logo */}
          <Box
            onClick={() => navigate('/')}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer', mr: 3 }}
          >
            <Box sx={{
              width: 38, height: 38, borderRadius: '10px',
              background: 'linear-gradient(135deg, #FF6B35, #D4A373)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
            }}>🍛</Box>
            <Box>
              <Typography sx={{ fontFamily: "'Playfair Display', serif", color: 'white', fontSize: 20, fontWeight: 700, lineHeight: 1.1 }}>
                TechSooru
              </Typography>
              <Typography sx={{ fontSize: 9, color: '#D4A373', letterSpacing: 2, textTransform: 'uppercase' }}>
                Restaurant OS
              </Typography>
            </Box>
          </Box>

          {/* Nav Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flex: 1 }}>
            {NAV_LINKS.map(link => (
              <Button
                key={link.path}
                onClick={() => navigate(link.path)}
                sx={{
                  color: location.pathname === link.path ? 'white' : 'rgba(255,255,255,0.6)',
                  bgcolor: location.pathname === link.path ? 'rgba(255,107,53,0.2)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                  fontSize: 13, fontWeight: 500,
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Cart Button */}
            <IconButton
              onClick={() => setCartOpen(true)}
              sx={{ bgcolor: '#FF6B35', color: 'white', '&:hover': { bgcolor: '#FF8C5A' }, borderRadius: '10px', px: 1.5, py: 0.8 }}
            >
              <Badge badgeContent={itemCount} sx={{ '& .MuiBadge-badge': { bgcolor: 'white', color: '#FF6B35', fontWeight: 700 } }}>
                <ShoppingCartIcon fontSize="small" />
              </Badge>
              <Typography sx={{ ml: 0.8, fontSize: 13, fontWeight: 600 }}>Cart</Typography>
            </IconButton>

            {/* User Avatar */}
            <Avatar
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ width: 34, height: 34, bgcolor: '#D4A373', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#2C1810' }}
            >
              {profile?.name?.[0] || 'G'}
            </Avatar>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem disabled><Typography variant="caption">{profile?.email || 'Guest'}</Typography></MenuItem>
              <Divider />
              <MenuItem onClick={() => { navigate('/auth'); setAnchorEl(null) }}>Sign In / Sign Up</MenuItem>
              {user && <MenuItem onClick={() => { signOut(); setAnchorEl(null) }}>Sign Out</MenuItem>}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* MAIN */}
      <Box component="main" sx={{ p: { xs: 2, md: 3 } }}>
        <Outlet />
      </Box>

      {/* CART DRAWER */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </Box>
  )
}

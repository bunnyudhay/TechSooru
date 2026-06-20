import { useState, memo, useCallback } from 'react'
import { Box, Typography, IconButton, Button, Chip, Stack, Collapse } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import { motion } from 'framer-motion'
import { useCart } from '../../contexts/CartContext'

const MotionBox = motion.create(Box)

function MenuCard({ item, featured = false }) {
  const { addItem, removeItem, getQty } = useCart()
  const qty = getQty(item.id)
  const [hovered, setHovered] = useState(false)
  const [tapped, setTapped] = useState(false)

  const showPreview = hovered || tapped

  const handleTap = useCallback(() => {
    setTapped(prev => !prev)
  }, [])

  const spicyDots = item.spicy_level || 0

  return (
    <MotionBox
      layout
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      sx={{
        bgcolor: '#FFFCF8',
        borderRadius: 4,
        border: featured
          ? '2px solid rgba(255,107,53,0.35)'
          : '1px solid rgba(212,163,115,0.25)',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s, border-color 0.3s',
        boxShadow: showPreview
          ? '0 12px 40px rgba(139,69,19,0.18)'
          : '0 2px 8px rgba(139,69,19,0.06)',
        '&:hover': {
          borderColor: featured ? '#FF6B35' : '#D4A373',
        },
      }}
    >
      {/* Image area */}
      <Box
        onClick={handleTap}
        sx={{
          height: 160,
          background: featured
            ? 'linear-gradient(135deg, #FF6B35, #FFB347)'
            : 'linear-gradient(135deg, #E8C9A0, #D4A373)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 58,
          position: 'relative',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
      >
        {/* Veg/NonVeg indicator */}
        <Box sx={{
          position: 'absolute', top: 10, left: 10,
          width: 18, height: 18,
          border: `2px solid ${item.type === 'veg' ? '#2E7D32' : '#C62828'}`,
          borderRadius: '4px', bgcolor: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Box sx={{
            width: 8, height: 8, borderRadius: '50%',
            bgcolor: item.type === 'veg' ? '#2E7D32' : '#C62828',
          }} />
        </Box>

        {/* Badges */}
        <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 10, right: 10 }}>
          {item.rating && (
            <Chip label={`★ ${item.rating}`} size="small" sx={{
              bgcolor: 'white', color: '#CC7A00', fontSize: 10, fontWeight: 700, height: 22,
              border: '1px solid #CC7A00', boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
            }} />
          )}
          {item.is_popular && (
            <Chip label="★ Popular" size="small" sx={{
              bgcolor: '#FF6B35', color: 'white', fontSize: 10, fontWeight: 700, height: 22,
            }} />
          )}
          {featured && (
            <Chip label="🔥 Chef's Pick" size="small" sx={{
              bgcolor: '#2C1810', color: '#FFB347', fontSize: 10, fontWeight: 700, height: 22,
            }} />
          )}
        </Stack>

        {/* Tap hint on mobile */}
        <Box sx={{
          position: 'absolute', bottom: 8, right: 8,
          display: { xs: 'block', md: 'none' },
          fontSize: 10, color: 'rgba(255,255,255,0.7)',
          bgcolor: 'rgba(0,0,0,0.25)', px: 1, py: 0.3, borderRadius: 1,
        }}>
          Tap for details
        </Box>

        <motion.span
          animate={showPreview ? { scale: 1.15 } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'inline-block' }}
        >
          {item.emoji}
        </motion.span>
      </Box>

      {/* Info */}
      <Box sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 15, mb: 0.5 }}>
          {item.name}
        </Typography>
        <Typography sx={{
          fontSize: 12, color: '#8B6A5A', lineHeight: 1.5, mb: 1.5,
          height: 36, overflow: 'hidden',
        }}>
          {item.description}
        </Typography>

        {/* Hover Preview — Ingredients, Calories, Prep Time */}
        <Collapse in={showPreview} timeout={250}>
          <Box sx={{
            mb: 1.5, p: 1.5, borderRadius: 2,
            bgcolor: 'rgba(212,163,115,0.08)',
            border: '1px solid rgba(212,163,115,0.15)',
          }}>
            {/* Quick stats */}
            <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocalFireDepartmentIcon sx={{ fontSize: 14, color: '#FF6B35' }} />
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#5C3D2E' }}>
                  {item.calories || '—'} cal
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 14, color: '#8B4513' }} />
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#5C3D2E' }}>
                  {item.prep_time || '—'} min
                </Typography>
              </Box>
              {spicyDots > 0 && (
                <Typography sx={{ fontSize: 12 }}>
                  {'🌶️'.repeat(Math.min(spicyDots, 3))}
                </Typography>
              )}
            </Stack>

            {/* Ingredients */}
            {item.ingredients && (
              <Box>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#8B6A5A', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
                  Ingredients
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {item.ingredients.slice(0, 5).map(ing => (
                    <Chip key={ing} label={ing} size="small" sx={{
                      fontSize: 10, height: 22, bgcolor: 'white',
                      border: '1px solid rgba(212,163,115,0.25)',
                      color: '#5C3D2E',
                    }} />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Collapse>

        {/* Price + Cart */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20, fontWeight: 700, color: '#8B4513',
          }}>
            ₹{item.price}
          </Typography>

          {qty === 0 ? (
            <Button
              size="small" variant="contained" startIcon={<AddIcon />}
              onClick={() => addItem(item)}
              sx={{ bgcolor: '#8B4513', '&:hover': { bgcolor: '#A0522D' }, fontSize: 13 }}
            >
              Add
            </Button>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small" onClick={() => removeItem(item.id)}
                sx={{ bgcolor: 'rgba(139,69,19,0.1)', color: '#8B4513', width: 30, height: 30 }}>
                <RemoveIcon sx={{ fontSize: 15 }} />
              </IconButton>
              <Typography sx={{ fontWeight: 700, fontSize: 15, minWidth: 22, textAlign: 'center' }}>
                {qty}
              </Typography>
              <IconButton size="small" onClick={() => addItem(item)}
                sx={{ bgcolor: '#8B4513', color: 'white', width: 30, height: 30, '&:hover': { bgcolor: '#A0522D' } }}>
                <AddIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>
    </MotionBox>
  )
}

export default memo(MenuCard)

import { useState, memo, useCallback } from 'react'
import { Box, Typography, Button, IconButton, Dialog, Chip, Stack } from '@mui/material'
import CasinoIcon from '@mui/icons-material/Casino'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import { motion, AnimatePresence } from 'framer-motion'
import { useMenu } from '../../contexts/MenuContext'
import { useCart } from '../../contexts/CartContext'

function SurpriseMe() {
  const { getRandomDish } = useMenu()
  const { addItem } = useCart()
  const [dish, setDish] = useState(null)
  const [open, setOpen] = useState(false)
  const [spinning, setSpinning] = useState(false)

  const handleSurprise = useCallback(() => {
    setSpinning(true)
    // Brief spin animation before reveal
    setTimeout(() => {
      setDish(getRandomDish())
      setOpen(true)
      setSpinning(false)
    }, 600)
  }, [getRandomDish])

  const handleReroll = useCallback(() => {
    setDish(null)
    setTimeout(() => setDish(getRandomDish()), 200)
  }, [getRandomDish])

  return (
    <>
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
        <Button
          variant="contained"
          startIcon={
            <motion.div animate={spinning ? { rotate: 360 } : {}} transition={{ duration: 0.6, ease: 'easeInOut' }}>
              <CasinoIcon />
            </motion.div>
          }
          onClick={handleSurprise}
          sx={{
            background: 'linear-gradient(135deg, #FF6B35, #FFB347)',
            color: 'white', fontWeight: 700, fontSize: 14, px: 3, py: 1.2,
            borderRadius: 3, boxShadow: '0 4px 16px rgba(255,107,53,0.35)',
            '&:hover': { background: 'linear-gradient(135deg, #FF8C5A, #FFCC70)' },
          }}
        >
          Surprise Me! 🎲
        </Button>
      </motion.div>

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden', bgcolor: '#FFFCF8' } }}>
        <AnimatePresence mode="wait">
          {dish && (
            <motion.div key={dish.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}>
              {/* Header gradient */}
              <Box sx={{
                height: 180, background: 'linear-gradient(135deg, #2C1810 0%, #4A2010 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
              }}>
                <IconButton onClick={() => setOpen(false)} sx={{ position: 'absolute', top: 8, right: 8, color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>
                  <CloseIcon />
                </IconButton>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}>
                  <Typography sx={{ fontSize: 80, lineHeight: 1 }}>{dish.emoji}</Typography>
                </motion.div>
                <Box sx={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 30, bgcolor: '#FFFCF8', borderRadius: '20px 20px 0 0' }} />
              </Box>

              {/* Content */}
              <Box sx={{ px: 3, pb: 3, pt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip label="🎲 Surprise Pick" size="small" sx={{ bgcolor: 'rgba(255,107,53,0.12)', color: '#FF6B35', fontWeight: 600, fontSize: 11 }} />
                  <Chip label={`★ ${dish.rating}`} size="small" sx={{ bgcolor: 'rgba(255,179,71,0.15)', color: '#CC7A00', fontWeight: 600, fontSize: 11 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, fontSize: 24 }}>{dish.name}</Typography>
                <Typography sx={{ color: '#8B6A5A', fontSize: 14, mb: 2 }}>{dish.description}</Typography>

                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#8B4513' }}>{dish.calories}</Typography>
                    <Typography sx={{ fontSize: 11, color: '#8B6A5A' }}>Calories</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#8B4513' }}>{dish.prep_time}m</Typography>
                    <Typography sx={{ fontSize: 11, color: '#8B6A5A' }}>Prep Time</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#8B4513' }}>₹{dish.price}</Typography>
                    <Typography sx={{ fontSize: 11, color: '#8B6A5A' }}>Price</Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button fullWidth variant="contained" startIcon={<AddIcon />}
                    onClick={() => { addItem(dish); setOpen(false) }}
                    sx={{ bgcolor: '#8B4513', '&:hover': { bgcolor: '#A0522D' }, py: 1.3, fontSize: 14 }}>
                    Add to Cart
                  </Button>
                  <Button variant="outlined" onClick={handleReroll}
                    sx={{ minWidth: 50, borderColor: '#FF6B35', color: '#FF6B35', '&:hover': { borderColor: '#FF8C5A', bgcolor: 'rgba(255,107,53,0.04)' } }}>
                    🎲
                  </Button>
                </Stack>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Dialog>
    </>
  )
}

export default memo(SurpriseMe)

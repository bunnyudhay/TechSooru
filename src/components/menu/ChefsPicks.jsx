import { memo } from 'react'
import { Box, Typography, Grid, Chip } from '@mui/material'
import { motion } from 'framer-motion'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { useMenu } from '../../contexts/MenuContext'
import MenuCard from './MenuCard'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
}
const child = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
}

const SLOT_LABELS = {
  breakfast: '☀️ Good Morning',
  lunch: '🌤️ Afternoon Favourites',
  snack: '🍿 Evening Cravings',
  dinner: '🌙 Tonight\'s Best',
}

function ChefsPicks() {
  const { chefsPicks, mealTimeSlot } = useMenu()

  if (!chefsPicks.length) return null

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, mb: 2,
      }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: '12px',
          background: 'linear-gradient(135deg, #FF6B35, #FFB347)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(255,107,53,0.3)',
        }}>
          <AutoAwesomeIcon sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>
            Chef's Picks
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#8B6A5A' }}>
            {SLOT_LABELS[mealTimeSlot] || 'Featured for you'}
          </Typography>
        </Box>
        <Chip
          label={mealTimeSlot.charAt(0).toUpperCase() + mealTimeSlot.slice(1)}
          size="small"
          sx={{
            ml: 'auto', bgcolor: 'rgba(255,107,53,0.1)', color: '#FF6B35',
            fontWeight: 600, fontSize: 11, border: '1px solid rgba(255,107,53,0.2)',
          }}
        />
      </Box>

      {/* Grid */}
      <motion.div variants={container} initial="hidden" animate="show">
        <Grid container spacing={2.5}>
          {chefsPicks.map(item => (
            <Grid item xs={12} sm={6} md={3} key={item.id}>
              <motion.div variants={child}>
                <MenuCard item={item} featured />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Box>
  )
}

export default memo(ChefsPicks)

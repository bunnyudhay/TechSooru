import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, Grid, Chip, Stack } from '@mui/material'
import { motion } from 'framer-motion'
import { useMenu } from '../contexts/MenuContext'
import MenuCard from '../components/menu/MenuCard'
import SurpriseMe from '../components/menu/SurpriseMe'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.35 } }),
}

export default function HomePage() {
  const navigate = useNavigate()
  const { chefsPicks, items, mealTimeSlot } = useMenu()
  const popular = items.filter(i => i.is_popular).slice(0, 4)

  const SLOT_GREETINGS = {
    breakfast: '☀️ Good Morning!',
    lunch: '🌤️ Good Afternoon!',
    snack: '🍿 Evening Snack Time!',
    dinner: '🌙 Good Evening!',
  }

  return (
    <Box className="fade-in">
      {/* HERO */}
      <Box sx={{
        background: 'linear-gradient(135deg, #2C1810 0%, #4A2010 100%)',
        borderRadius: 6, p: { xs: 3, md: 6 }, mb: 4,
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3,
      }}>
        {/* Pattern overlay */}
        <Box className="pattern-bg" sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320,
          background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)',
          pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 520 }}>
          <Chip label="📍 Table 4 — QR Active" size="small" sx={{
            bgcolor: 'rgba(255,107,53,0.15)', color: '#FF6B35',
            border: '1px solid rgba(255,107,53,0.3)', mb: 2, fontSize: 13
          }} />
          <Typography variant="h2" sx={{ color: 'white', fontSize: { xs: 28, md: 44 }, lineHeight: 1.15, mb: 1.5 }}>
            Taste of <Box component="span" sx={{ color: '#FF6B35' }}>Tamil Nadu</Box>
            <br />Served with Tech
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, mb: 3, lineHeight: 1.7 }}>
            Authentic South Indian flavors crafted with tradition, ordered with modern ease. From crispy dosas to fragrant biryanis.
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button variant="contained" onClick={() => navigate('/menu')}
              sx={{ bgcolor: '#FF6B35', '&:hover': { bgcolor: '#FF8C5A' }, px: 3, py: 1.3, fontSize: 14 }}>
              View Full Menu 🍽️
            </Button>
            <Button variant="outlined" onClick={() => navigate('/orders')}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.35)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' }, px: 3, py: 1.3 }}>
              Track My Order
            </Button>
            <SurpriseMe />
          </Stack>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, fontSize: 96, position: 'relative', zIndex: 1, opacity: 0.88 }}>
          🍛
        </Box>
      </Box>

      {/* CHEF'S PICKS */}
      {chefsPicks.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" sx={{ fontSize: 26 }}>
                {SLOT_GREETINGS[mealTimeSlot]} Chef's Picks
              </Typography>
              <Typography sx={{ color: '#8B6A5A', fontSize: 14 }}>
                Curated for this time of day
              </Typography>
            </Box>
            <Button onClick={() => navigate('/menu')} sx={{ color: '#8B4513', fontWeight: 600 }}>
              See All →
            </Button>
          </Box>
          <Grid container spacing={2.5}>
            {chefsPicks.map((item, i) => (
              <Grid item xs={12} sm={6} md={3} key={item.id}>
                <motion.div custom={i} variants={fadeUp} initial="hidden" animate="show">
                  <MenuCard item={item} featured />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* POPULAR ITEMS */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: 26 }}>Popular Today</Typography>
          <Typography sx={{ color: '#8B6A5A', fontSize: 14 }}>Our most loved dishes</Typography>
        </Box>
        <Button onClick={() => navigate('/menu')} sx={{ color: '#8B4513', fontWeight: 600 }}>
          See All →
        </Button>
      </Box>

      <Grid container spacing={2.5}>
        {popular.map((item, i) => (
          <Grid item xs={12} sm={6} md={3} key={item.id}>
            <motion.div custom={i} variants={fadeUp} initial="hidden" animate="show">
              <MenuCard item={item} />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* WHY TECHSOORU */}
      <Grid container spacing={2} sx={{ mt: 4 }}>
        {[
          { icon: '⚡', title: 'Instant Ordering', desc: 'QR scan → order in seconds' },
          { icon: '🔥', title: 'Live Kitchen', desc: 'Real-time order tracking' },
          { icon: '💳', title: 'Easy Payments', desc: 'Pay securely via Razorpay' },
          { icon: '🌿', title: 'Fresh Daily', desc: 'Made fresh every morning' },
        ].map((f, i) => (
          <Grid item xs={6} md={3} key={f.title}>
            <motion.div custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <Box sx={{
                p: 2.5, borderRadius: 4, bgcolor: 'white',
                border: '1px solid rgba(212,163,115,0.2)',
                textAlign: 'center', transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 4px 20px rgba(139,69,19,0.1)', transform: 'translateY(-2px)' }
              }}>
                <Box sx={{ fontSize: 32, mb: 1 }}>{f.icon}</Box>
                <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.5 }}>{f.title}</Typography>
                <Typography sx={{ fontSize: 12, color: '#8B6A5A' }}>{f.desc}</Typography>
              </Box>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

import { Box, Typography, Grid, Stack, Button, Divider } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { useMenu } from '../contexts/MenuContext'
import MenuCard from '../components/menu/MenuCard'
import SmartSearch from '../components/menu/SmartSearch'
import FilterChips from '../components/menu/FilterChips'
import MoodBrowser from '../components/menu/MoodBrowser'
import CategoryTabs from '../components/menu/CategoryTabs'
import ChefsPicks from '../components/menu/ChefsPicks'
import SurpriseMe from '../components/menu/SurpriseMe'
import SummaryBar from '../components/menu/SummaryBar'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
}

export default function MenuPage() {
  const [searchParams] = useSearchParams()
  const tableId = searchParams.get('table')
  const { items, filtered, activeCategory, hasAnyFilter, clearAllFilters } = useMenu()

  return (
    <Box className="fade-in" sx={{ pb: hasAnyFilter ? 8 : 0 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: 28, mb: 0.5 }}>
            {tableId ? `Table ${tableId} — Order Menu` : 'Our Menu'}
          </Typography>
          <Typography sx={{ color: '#8B6A5A', fontSize: 14 }}>
            Fresh, authentic & made to order · {items.length} items
          </Typography>
        </Box>
        <SurpriseMe />
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2.5 }}>
        <SmartSearch />
      </Box>

      {/* Mood Browser */}
      <Box sx={{ mb: 2 }}>
        <MoodBrowser />
      </Box>

      <Divider sx={{ my: 2.5, borderColor: 'rgba(212,163,115,0.2)' }} />

      {/* Filter Chips */}
      <Box sx={{ mb: 2 }}>
        <FilterChips />
      </Box>

      {/* Category Tabs */}
      <Box sx={{ mb: 3 }}>
        <CategoryTabs />
      </Box>

      {/* Chef's Picks (only when no filters active and on All) */}
      {!hasAnyFilter && activeCategory === 'All' && (
        <ChefsPicks />
      )}

      {/* Menu Grid with animated transitions */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ fontSize: 48, mb: 2 }}>🔍</Typography>
            <Typography variant="h5" sx={{ mb: 1 }}>No items found</Typography>
            <Typography sx={{ color: '#8B6A5A' }}>
              Try a different search, category, or filter combination
            </Typography>
            {hasAnyFilter && (
              <Button
                variant="outlined"
                onClick={clearAllFilters}
                sx={{ mt: 3, borderColor: '#FF6B35', color: '#FF6B35', '&:hover': { borderColor: '#FF8C5A', bgcolor: 'rgba(255,107,53,0.04)' } }}
              >
                Clear All Filters
              </Button>
            )}
          </Box>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory}-${filtered.length}`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <Grid container spacing={2.5}>
              {filtered.map(item => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                  <motion.div variants={cardVariants}>
                    <MenuCard item={item} />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Sticky Summary Bar */}
      <SummaryBar />
    </Box>
  )
}

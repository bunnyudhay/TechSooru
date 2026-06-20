import { memo } from 'react'
import { Box, Chip, Stack, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { useMenu } from '../../contexts/MenuContext'

const MotionChip = motion.create(Chip)

function FilterChips() {
  const { filterChips, activeFilters, toggleFilter } = useMenu()

  return (
    <Box>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#8B6A5A', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
        Quick Filters
      </Typography>
      <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
        {filterChips.map(chip => {
          const isActive = activeFilters.includes(chip.key)
          return (
            <MotionChip
              key={chip.key}
              label={chip.label}
              onClick={() => toggleFilter(chip.key)}
              whileTap={{ scale: 0.93 }}
              sx={{
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: 13,
                height: 36,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                bgcolor: isActive ? '#8B4513' : 'white',
                color: isActive ? 'white' : '#5C3D2E',
                border: `1.5px solid ${isActive ? '#8B4513' : 'rgba(212,163,115,0.4)'}`,
                boxShadow: isActive ? '0 2px 8px rgba(139,69,19,0.25)' : 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: isActive ? '#6B3410' : 'rgba(139,69,19,0.06)',
                  transform: 'translateY(-1px)',
                },
              }}
            />
          )
        })}
      </Stack>
    </Box>
  )
}

export default memo(FilterChips)

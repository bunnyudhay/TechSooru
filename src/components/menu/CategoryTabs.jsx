import { memo } from 'react'
import { Chip, Stack } from '@mui/material'
import { motion } from 'framer-motion'
import { useMenu } from '../../contexts/MenuContext'

const MotionChip = motion.create(Chip)

function CategoryTabs() {
  const { categories, activeCategory, setActiveCategory } = useMenu()

  return (
    <Stack direction="row" spacing={1} sx={{
      overflowX: 'auto', pb: 0.5,
      '&::-webkit-scrollbar': { display: 'none' },
    }}>
      {categories.map(cat => {
        const isActive = activeCategory === cat
        return (
          <MotionChip
            key={cat}
            label={cat}
            onClick={() => setActiveCategory(cat)}
            layout
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            sx={{
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              height: 36,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              bgcolor: isActive ? '#8B4513' : 'white',
              color: isActive ? 'white' : '#5C3D2E',
              border: `1.5px solid ${isActive ? '#8B4513' : 'rgba(212,163,115,0.4)'}`,
              boxShadow: isActive ? '0 3px 12px rgba(139,69,19,0.25)' : 'none',
              transition: 'background-color 0.25s, color 0.25s, border-color 0.25s, box-shadow 0.25s',
              '&:hover': {
                bgcolor: isActive ? '#8B4513' : 'rgba(139,69,19,0.06)',
              },
            }}
          />
        )
      })}
    </Stack>
  )
}

export default memo(CategoryTabs)

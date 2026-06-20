import { memo } from 'react'
import { Box, Typography, Stack } from '@mui/material'
import { motion } from 'framer-motion'
import { useMenu } from '../../contexts/MenuContext'

const MotionBox = motion.create(Box)

function MoodBrowser() {
  const { moodOptions, activeMood, toggleMood } = useMenu()

  return (
    <Box>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#8B6A5A', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
        Browse by Mood
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
        {moodOptions.map(mood => {
          const isActive = activeMood === mood.key
          return (
            <MotionBox
              key={mood.key}
              onClick={() => toggleMood(mood.key)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                p: 1.5,
                px: 2,
                borderRadius: 3,
                minWidth: 80,
                flexShrink: 0,
                bgcolor: isActive ? mood.color : 'white',
                border: `2px solid ${isActive ? mood.color : 'rgba(212,163,115,0.25)'}`,
                boxShadow: isActive
                  ? `0 4px 16px ${mood.color}40`
                  : '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'background-color 0.2s, border-color 0.2s, box-shadow 0.2s',
              }}
            >
              <Box sx={{ fontSize: 28, lineHeight: 1 }}>{mood.emoji}</Box>
              <Typography sx={{
                fontSize: 12,
                fontWeight: 600,
                color: isActive ? 'white' : '#5C3D2E',
                transition: 'color 0.2s',
              }}>
                {mood.label}
              </Typography>
            </MotionBox>
          )
        })}
      </Stack>
    </Box>
  )
}

export default memo(MoodBrowser)

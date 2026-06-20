import { memo } from 'react'
import { Box, Typography, Chip, IconButton, Stack } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import { motion, AnimatePresence } from 'framer-motion'
import { useMenu } from '../../contexts/MenuContext'

function SummaryBar() {
  const { activeFilterLabels, hasAnyFilter, filtered, clearAllFilters } = useMenu()

  return (
    <AnimatePresence>
      {hasAnyFilter && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
          }}
        >
          <Box sx={{
            mx: { xs: 1, md: 3 },
            mb: { xs: 1, md: 2 },
            p: { xs: 1.5, md: 2 },
            bgcolor: '#2C1810',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            boxShadow: '0 -4px 24px rgba(44,24,16,0.35)',
            backdropFilter: 'blur(10px)',
          }}>
            <FilterAltIcon sx={{ color: '#FF6B35', fontSize: 20, flexShrink: 0 }} />

            <Stack direction="row" spacing={0.8} sx={{
              flex: 1,
              overflowX: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
            }}>
              {activeFilterLabels.map(label => (
                <Chip
                  key={label}
                  label={label}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,107,53,0.2)',
                    color: '#FFB380',
                    fontSize: 12,
                    fontWeight: 500,
                    height: 28,
                    flexShrink: 0,
                    border: '1px solid rgba(255,107,53,0.2)',
                  }}
                />
              ))}
            </Stack>

            <Typography sx={{
              fontSize: 13,
              fontWeight: 600,
              color: '#FF6B35',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            </Typography>

            <IconButton
              size="small"
              onClick={clearAllFilters}
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                flexShrink: 0,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default memo(SummaryBar)

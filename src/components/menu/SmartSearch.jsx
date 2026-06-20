import { useState, useRef, useEffect, memo } from 'react'
import { Box, TextField, InputAdornment, Typography, Paper, List, ListItem, ListItemText, Divider, IconButton } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import MicIcon from '@mui/icons-material/Mic'
import CloseIcon from '@mui/icons-material/Close'
import { motion, AnimatePresence } from 'framer-motion'
import { useMenu } from '../../contexts/MenuContext'

function SmartSearch() {
  const { search, setSearch, suggestions } = useMenu()
  const [open, setOpen] = useState(false)
  const [micPulse, setMicPulse] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleChange = (e) => { setSearch(e.target.value); setOpen(true) }
  const handleSelect = (label) => { setSearch(label); setOpen(false) }
  const handleMic = () => { setMicPulse(true); setTimeout(() => setMicPulse(false), 2000) }
  const handleClear = () => { setSearch(''); setOpen(false) }

  return (
    <Box ref={wrapperRef} sx={{ position: 'relative', maxWidth: 480, width: '100%' }}>
      <TextField fullWidth placeholder="Search dishes, ingredients..." value={search}
        onChange={handleChange} onFocus={() => suggestions.length > 0 && setOpen(true)} size="small"
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#D4A373' }} /></InputAdornment>,
          endAdornment: (
            <InputAdornment position="end" sx={{ gap: 0.5 }}>
              {search && <IconButton size="small" onClick={handleClear} sx={{ color: '#8B6A5A' }}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>}
              <IconButton size="small" onClick={handleMic} sx={{ color: micPulse ? '#FF6B35' : '#D4A373', animation: micPulse ? 'pulse 1s ease-in-out infinite' : 'none' }}>
                <MicIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </InputAdornment>
          ),
          sx: { borderRadius: 3, bgcolor: 'white', '& fieldset': { borderColor: 'rgba(212,163,115,0.4)' }, '&:hover fieldset': { borderColor: '#D4A373 !important' }, '&.Mui-focused fieldset': { borderColor: '#8B4513 !important' } },
        }}
      />
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}
            style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100 }}>
            <Paper sx={{ mt: 0.5, borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(212,163,115,0.3)', boxShadow: '0 8px 32px rgba(139,69,19,0.12)', maxHeight: 300, overflowY: 'auto' }}>
              <List disablePadding>
                {suggestions.map((s, idx) => (
                  <Box key={s.id}>
                    <ListItem component="div" onClick={() => handleSelect(s.label)} sx={{ cursor: 'pointer', py: 1, px: 2, '&:hover': { bgcolor: 'rgba(139,69,19,0.04)' } }}>
                      <Typography sx={{ fontSize: 18, mr: 1.5 }}>{s.emoji}</Typography>
                      <ListItemText primary={s.label} secondary={s.type === 'ingredient' ? 'Ingredient' : 'Dish'}
                        primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} secondaryTypographyProps={{ fontSize: 11, color: '#8B6A5A' }} />
                    </ListItem>
                    {idx < suggestions.length - 1 && <Divider sx={{ borderColor: 'rgba(212,163,115,0.15)' }} />}
                  </Box>
                ))}
              </List>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}

export default memo(SmartSearch)

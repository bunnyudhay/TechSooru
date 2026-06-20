import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#8B4513',
      light: '#A0522D',
      dark: '#6B3410',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#D4A373',
      light: '#E8C9A0',
      dark: '#B8875A',
      contrastText: '#1A0A00',
    },
    error: { main: '#C62828' },
    warning: { main: '#F57F17' },
    success: { main: '#2E7D32' },
    background: {
      default: '#FFF8F0',
      paper: '#FFFCF8',
    },
    text: {
      primary: '#1A0A00',
      secondary: '#5C3D2E',
    },
    accent: {
      main: '#FF6B35',
      light: '#FF8C5A',
    },
  },
  typography: {
    fontFamily: "'DM Sans', sans-serif",
    h1: { fontFamily: "'Playfair Display', serif" },
    h2: { fontFamily: "'Playfair Display', serif" },
    h3: { fontFamily: "'Playfair Display', serif" },
    h4: { fontFamily: "'Playfair Display', serif" },
    h5: { fontFamily: "'Playfair Display', serif" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          borderRadius: 10,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(212,163,115,0.25)',
          boxShadow: '0 2px 16px rgba(139,69,19,0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
  },
})

// client/src/theme.js
import { createTheme } from '@mui/material/styles';
import { green, amber, grey } from '@mui/material/colors';

// This function creates our theme
const getTheme = (mode) => createTheme({
  palette: {
    mode, // This is the magic part: 'light' or 'dark'
    
    ...(mode === 'light'
      ? {
          // --- LIGHT MODE PALETTE ---
          primary: {
            main: '#2E7D32', // Green
          },
          secondary: {
            main: '#FFAB00', // Amber
          },
          background: {
            default: '#f4f6f8', // Light grey page
            paper: '#ffffff',   // White cards
          },
        }
      : {
          // --- DARK MODE PALETTE ---
          primary: {
            main: green[300], // A lighter green for dark mode
          },
          secondary: {
            main: amber[300], // A lighter amber
          },
          background: {
            default: '#121212', // Standard dark background
            paper: '#1e1e1e',   // Darker cards
          },
        }
    ),
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
  },
  // --- THIS IS THE UPDATED PART ---
  // We move 'components' inside the function
  // so we can use the 'mode' variable
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { 
          borderRadius: 8,
          // Use the theme's paper background
          backgroundImage: 'none', // Fixes a dark mode paper bug
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          // In dark mode, AppBar should be dark
          backgroundColor: mode === 'light' ? '#0e4dd4ff' : grey[900],
        },
      },
    },
    // --- THIS IS THE FIX FOR TEXT FIELDS ---
    MuiTextField: {
      styleOverrides: {
        root: {
          // Use a different background color for light vs dark
          backgroundColor: mode === 'light' ? grey[50] : grey[900],
          borderRadius: 8,
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

export default getTheme;
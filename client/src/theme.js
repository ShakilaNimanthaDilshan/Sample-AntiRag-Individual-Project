// client/src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    // You can change these colors
    primary: {
      main: '#1976d2', // A standard professional blue
    },
    secondary: {
      main: '#dc004e', // A standard accent color
    },
    // This sets the background for components like Paper and Card
    background: {
      default: '#f4f6f8', // The light grey page background
      paper: '#ffffff',   // The white for all cards/papers
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    // Default styles for all Paper components
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Softer edges for all cards
        },
      },
    },
    // Default styles for all Buttons
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Softer edges for buttons
          textTransform: 'none', // Buttons will have "Login" instead of "LOGIN"
        },
      },
    },
  },
});

export default theme;
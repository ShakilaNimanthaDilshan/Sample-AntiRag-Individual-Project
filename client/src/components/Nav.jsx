// client/src/components/Nav.jsx
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Link as MuiLink, 
  IconButton,
  // We removed Avatar
} from "@mui/material";

// --- Import Icons ---
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Dark mode (moon)
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Light mode (sun)
// --- End Import Icons ---


export default function Nav({ toggleTheme, currentMode }) {
  const { user, logout } = useAuth();

  // Helper function to create a Nav Link
  const NavLink = ({ to, children, style }) => (
    <MuiLink
      component={RouterLink}
      to={to}
      sx={{
        color: 'white',
        textDecoration: 'none',
        '&:hover': { textDecoration: 'underline' },
        ...style
      }}
    >
      {children}
    </MuiLink>
  );

  return (
    <AppBar position="static">
      <Toolbar>
        
        {/* --- THIS IS THE FIX --- */}
        <MuiLink 
          component={RouterLink} 
          to="/" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none', 
            color: 'inherit' 
          }}
        >
          {/* PUT YOUR LOGO IN THE /public FOLDER 
            AND CHANGE '/logo.png' TO YOUR FILENAME 
          */}
          <Box
            component="img"
            src="/logo.png" // <-- CHANGE THIS TO YOUR LOGO FILE
            alt="Uni In Logo"
            sx={{ 
              height: 32, // Set logo height
              width: 32,  // Set logo width
              mr: 1,      // Margin-right
            }}
          />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Uni In
          </Typography>
        </MuiLink>
        {/* --- END OF FIX --- */}

        <Box sx={{ flexGrow: 1, ml: 2 }}>
          <NavLink to="/analytics">Analytics</NavLink>
          <NavLink to="/documented-cases" style={{ marginLeft: '15px' }}>
            Historic Incidents
          </NavLink>
          <NavLink to="/help-resources" style={{ marginLeft: '15px', color: '#ffeb3b', fontWeight: 'bold' }}>
            Get Help
          </NavLink>
        </Box>

        <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
          {currentMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>

        {user ? (
          <>
            {(user.role === "admin" || user.role === "moderator") && (
              <NavLink to="/moderation" style={{ color: "orange", fontWeight: "bold" }}>
                Moderation
              </NavLink>
            )}
            {user.role === "admin" && (
              <NavLink to="/admin" style={{ color: "red", fontWeight: "bold", marginLeft: '15px' }}>
                Admin
              </NavLink>
            )}
            <Button component={RouterLink} to="/profile" color="inherit">
              Profile ({user.name})
            </Button>
            <Button onClick={logout} color="inherit">
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button component={RouterLink} to="/login" color="inherit">
              Login
            </Button>
            <Button component={RouterLink} to="/register" color="inherit">
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
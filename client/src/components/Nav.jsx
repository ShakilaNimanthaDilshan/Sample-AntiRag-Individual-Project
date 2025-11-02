// client/src/components/Nav.jsx
import React from "react";
import { Link as RouterLink } from "react-router-dom"; // Renamed to avoid conflict
import { useAuth } from "../contexts/AuthContext";
import { AppBar, Toolbar, Typography, Button, Box, Link as MuiLink } from "@mui/material";

export default function Nav() {
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
        ...style // Allows custom styles
      }}
    >
      {children}
    </MuiLink>
  );

  return (
    // AppBar is the main container (the header bar)
    <AppBar position="static">
      {/* Toolbar handles the padding and alignment */}
      <Toolbar>
        {/* Typography is for text. 'h6' is a good size for a brand */}
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          <NavLink to="/">Uni In</NavLink>
        </Typography>

        {/* This Box is a spacer, it pushes everything else to the right */}
        <Box sx={{ flexGrow: 1, ml: 2 }}>
          <NavLink to="/analytics">Analytics</NavLink>
          <NavLink to="/documented-cases" style={{ marginLeft: '15px' }}>Historic Incidents</NavLink>
          <NavLink to="/help-resources" style={{ marginLeft: '15px', color: '#ffeb3b', fontWeight: 'bold' }}>
            Get Help
          </NavLink>
        </Box>

        {/* Right-side links */}
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
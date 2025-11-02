// client/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Link as MuiLink,
  Alert, // For showing a nice success message
  Divider
} from '@mui/material';

export default function Profile() {
  const { user, setUser } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState(''); // For success
  const [error, setError] = useState('');     // For errors
  const [loading, setLoading] = useState(false);

  // When user object changes, update the name field
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const payload = { name };
      if (password) {
        payload.password = password;
      }

      const res = await api('/api/users/me', {
        method: 'PUT',
        body: payload
      });

      if (res._id) {
        // Update context and local storage
        setUser(res); 
        localStorage.setItem('user', JSON.stringify(res));
        
        setMessage('Profile updated successfully!');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(res.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper 
        elevation={3} 
        sx={{
          mt: 8,
          p: { xs: 2, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Your Profile
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            
            {message && <Alert severity="success">{message}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Email (cannot be changed)"
              value={email}
              disabled
              fullWidth
              variant="filled" // Use filled for disabled fields
            />
            
            <TextField
              required
              fullWidth
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            
            <Divider sx={{ my: 2 }}>Update Password (Optional)</Divider>
            
            <TextField
              fullWidth
              label="New Password (min 6 characters)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 2, p: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Update Profile'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                By using this service, you agree to our 
                <MuiLink component={RouterLink} to="/terms" target="_blank" rel="noopener noreferrer"> Terms and Conditions</MuiLink>.
              </Typography>
            </Box>

          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
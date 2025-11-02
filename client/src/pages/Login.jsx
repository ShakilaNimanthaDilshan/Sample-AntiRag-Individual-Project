// client/src/pages/Login.jsx
import React, { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../contexts/AuthContext'
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Link as MuiLink 
} from '@mui/material'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()
  const { login } = useAuth()

  const submit = async (e) =>{
    e.preventDefault()
    setError('')
    try{
      const res = await api('/api/auth/login', { method: 'POST', body: { email, password } })
      
      if (res.token) {
        login(res.token, res.user) // This now comes from AuthContext
        nav('/') // Redirect to home page
      } else {
        setError(res.message || 'Login failed')
      }
    }catch(err){ 
      let errorMsg = 'Login failed. Please try again.';
      if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        errorMsg = err.errors[0].msg; 
      } else if (err.message) {
        errorMsg = err.message; // e.g., "Invalid credentials"
      }
      setError(errorMsg);
    }
  }

  return (
    // Container component centers the content
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} // Adds a subtle shadow
        sx={{
          mt: 8, // margin-top: 64px
          p: 4, // padding: 32px
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        
        <Box component="form" onSubmit={submit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {error && (
            <Typography color="error" align="center" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }} // margin-top & margin-bottom
          >
            Sign In
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <MuiLink component={RouterLink} to="/register" variant="body2">
              {"Don't have an account? Register"}
            </MuiLink>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}
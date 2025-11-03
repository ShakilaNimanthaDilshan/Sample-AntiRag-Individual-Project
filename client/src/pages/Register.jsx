// client/src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../api';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Link as MuiLink,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormControlLabel,
  Checkbox,
  Divider
} from '@mui/material';

export default function Register() {
  // ... (all your state and functions remain the same) ...
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [isStudent, setIsStudent] = useState(true);
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [profession, setProfession] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [universities, setUniversities] = useState([]);
  const [otherUniversityName, setOtherUniversityName] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const u = await api('/api/universities');
        if (Array.isArray(u)) {
          setUniversities(u.filter(uni => uni.status !== 'pending'));
        }
      } catch (err) {
        console.error("Failed to fetch universities", err);
      }
    };
    fetchUniversities();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!terms) {
      setError('You must accept the terms and conditions to register.');
      return;
    }
    if (isStudent) {
      if (!universityId) return setError('Please select a university.');
      if (universityId === 'OTHER' && !otherUniversityName.trim()) {
        return setError('Please enter your university name.');
      }
      if (!yearOfStudy) return setError('Please select your year of study.');
    } else {
      if (!profession.trim()) return setError('Please enter your profession.');
    }

    try {
      const payload = {
        name, email, password, city, isStudent,
        universityId, otherUniversityName, yearOfStudy, profession, terms
      };
      
      const res = await api('/api/auth/register', { method: 'POST', body: payload });

      if (res.message === 'User registered successfully') {
        alert('Registration successful! Please log in.');
        nav('/login');
      } else {
        let errorMsg = res.message || 'Registration failed.';
        if (res.errors && Array.isArray(res.errors) && res.errors.length > 0) {
          errorMsg = res.errors[0].msg;
        }
        setError(errorMsg);
      }
    } catch (err) {
      let errorMsg = 'Registration failed. Please try again.';
      if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        errorMsg = err.errors[0].msg;
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    }
  };


  return (
    // --- THIS IS THE NEW WRAPPER ---
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)', // Full height minus AppBar
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Same gradient as the login page
        background: 'linear-gradient(45deg, #1130e2ff 30%, #00dcf9ff 90%)',
        p: { xs: 2, sm: 4 } // Padding for small screens
      }}
    >
      <Container component="main" maxWidth="sm" sx={{ p: 0 }}>
        <Paper 
          elevation={6} 
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          <Typography component="h1" variant="h5">
            Register
          </Typography>
          
          <Box component="form" onSubmit={submit} sx={{ mt: 3, width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                required
                fullWidth
                label="Full name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
              <TextField
                required
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <TextField
                required
                fullWidth
                label="Password (min 6 characters)"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <TextField
                required
                fullWidth
                label="City"
                value={city}
                onChange={e => setCity(e.target.value)}
              />

              <Divider sx={{ my: 2 }} />

              <FormControlLabel
                control={
                  <Checkbox 
                    checked={isStudent} 
                    onChange={e => setIsStudent(e.target.checked)} 
                  />
                }
                label="I am a university student"
              />

              {isStudent ? (
                <>
                  <FormControl fullWidth required>
                    <InputLabel id="uni-select-label">Select your University</InputLabel>
                    <Select
                      labelId="uni-select-label"
                      label="Select your University"
                      value={universityId}
                      onChange={e => setUniversityId(e.target.value)}
                    >
                      <MenuItem value="" disabled>-- Select your University --</MenuItem>
                      {universities.map(u => (
                        <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
                      ))}
                      <MenuItem value="OTHER">Other (Please specify)</MenuItem>
                    </Select>
                  </FormControl>

                  {universityId === 'OTHER' && (
                    <TextField
                      required
                      fullWidth
                      label="Please enter university name"
                      value={otherUniversityName}
                      onChange={e => setOtherUniversityName(e.target.value)}
                    />
                  )}

                  <FormControl fullWidth required>
                    <InputLabel id="year-select-label">Year of Study</InputLabel>
                    <Select
                      labelId="year-select-label"
                      label="Year of Study"
                      value={yearOfStudy}
                      onChange={e => setYearOfStudy(e.target.value)}
                    >
                      <MenuItem value="" disabled>-- Select Year of Study --</MenuItem>
                      <MenuItem value="1st Year">1st Year</MenuItem>
                      <MenuItem value="2nd Year">2nd Year</MenuItem>
                      <MenuItem value="3rd Year">3rd Year</MenuItem>
                      <MenuItem value="4th Year">4th Year</MenuItem>
                      <MenuItem value="Postgraduate">Postgraduate</MenuItem>
                    </Select>
                  </FormControl>
                </>
              ) : (
                <TextField
                  required
                  fullWidth
                  label="Your Profession (e.g., Lecturer, Journalist)"
                  value={profession}
                  onChange={e => setProfession(e.target.value)}
                />
              )}

              <Divider sx={{ my: 2 }} />
              
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={terms} 
                    onChange={e => setTerms(e.target.checked)} 
                  />
                }
                label={
                  <span>
                    I agree to the <MuiLink component={RouterLink} to="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</MuiLink>
                  </span>
                }
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
                sx={{ mt: 2 }}
              >
                Register
              </Button>
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <MuiLink component={RouterLink} to="/login" variant="body2">
                  {"Already have an account? Login"}
                </MuiLink>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
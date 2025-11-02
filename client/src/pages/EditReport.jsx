// client/src/pages/EditReport.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container, Paper, Typography, Box, TextField, Button,
  CircularProgress, FormControlLabel, Checkbox, Divider, Alert
} from '@mui/material';

export default function EditReport() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { id } = useParams(); // Get the report ID from the URL

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(true); // Set loading to true on start
  const [error, setError] = useState('');
  const [reportUniversityName, setReportUniversityName] = useState('');

  // Fetch the existing report data
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api(`/api/reports/${id}`);
        if (res._id) {
          setTitle(res.title || '');
          setBody(res.body);
          setAnonymous(res.anonymous);
          setIsPublic(res.isPublic);
          setReportUniversityName(res.university.name);
        } else {
          setError(res.message || 'Could not load report.');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch report.');
      }
      setLoading(false); // Set loading to false after fetch
    };
    fetchReport();
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // We only send the fields that can be changed.
    // The university and files cannot be changed.
    const payload = { title, body, anonymous, isPublic };

    try {
      // NOTE: Your backend PUT /api/reports/:id does not handle file updates.
      // This form correctly only sends text data.
      const res = await api(`/api/reports/${id}`, { method: 'PUT', body: payload });
      
      if (res.report) {
        alert('Report updated successfully!');
        nav(`/report/${id}`); // Go back to the report page
      } else {
        setError(res.message || 'Something went wrong');
      }
    } catch (err) {
      setError(err.message || 'Server error');
    }
    setLoading(false);
  };

  if (loading) { // This now correctly shows the spinner
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        <CircularProgress />
        <Typography>Loading Report...</Typography>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ mt: 8, p: { xs: 2, sm: 4 } }}>
        <Typography component="h1" variant="h5" align="center">
          Edit Report
        </Typography>
        
        <Box component="form" onSubmit={submit} sx={{ mt: 3, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            
            <TextField
              fullWidth
              label="University"
              value={reportUniversityName}
              disabled
              variant="filled" // Matches the style from NewReport.jsx
            />

            <TextField
              fullWidth
              label="Title (Optional)"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />

            <TextField
              required
              fullWidth
              label="Describe your experience"
              multiline
              rows={6}
              value={body}
              onChange={e => setBody(e.target.value)}
            />

            <Divider sx={{ my: 1 }} />
            
            <FormControlLabel
              control={<Checkbox checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />}
              label="Make this report visible on the public feed"
            />
            
            <FormControlLabel
              control={<Checkbox checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />}
              label="Post anonymously"
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 2, p: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
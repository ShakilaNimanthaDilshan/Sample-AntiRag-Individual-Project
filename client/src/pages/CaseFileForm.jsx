// client/src/pages/CaseFileForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

export default function CaseFileForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateOfIncident, setDateOfIncident] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  // We removed the 'category' state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const nav = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  // If editing, fetch the existing case data
  useEffect(() => {
    if (isEditing) {
      const fetchCase = async () => {
        setLoading(true);
        try {
          const res = await api(`/api/case-files/${id}`);
          if (res._id) {
            setTitle(res.title);
            setDescription(res.description);
            setImageUrl(res.imageUrl || '');
            setSourceUrl(res.sourceUrl || '');
            
            if (res.dateOfIncident) {
              const formattedDate = new Date(res.dateOfIncident).toISOString().split('T')[0];
              setDateOfIncident(formattedDate);
            }
          } else {
            setError('Could not find case file.');
          }
        } catch (err) {
          setError('Failed to load data.');
          console.error(err);
        }
        setLoading(false);
      };
      fetchCase();
    }
  }, [isEditing, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // We removed 'category' from the payload
    const payload = { title, description, dateOfIncident, imageUrl, sourceUrl };

    try {
      if (isEditing) {
        await api(`/api/case-files/${id}`, { method: 'PUT', body: payload });
      } else {
        await api('/api/case-files', { method: 'POST', body: payload });
      }
      setLoading(false);
      alert('Case file saved successfully!');
      nav('/moderation'); // Go back to moderation page
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to save case file.');
    }
  };

  if (loading && isEditing) {
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        <CircularProgress />
        <Typography>Loading Case File...</Typography>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md">
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
          {isEditing ? 'Edit Case File' : 'Create New Case File'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              fullWidth
              label="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
            
            <TextField
              required
              fullWidth
              label="Description (The full story)"
              multiline
              rows={8}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            
            <TextField
              fullWidth
              label="Date of Incident (Optional)"
              type="date"
              value={dateOfIncident}
              onChange={e => setDateOfIncident(e.target.value)}
              InputLabelProps={{ shrink: true }} // Keeps the label from overlapping the date
            />
            
            <TextField
              fullWidth
              label="Image URL (Optional)"
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
            />
            
            <TextField
              fullWidth
              label="Source URL (e.g., news article link) (Optional)"
              type="url"
              value={sourceUrl}
              onChange={e => setSourceUrl(e.target.value)}
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
              disabled={loading}
              sx={{ mt: 2, p: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Case File'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
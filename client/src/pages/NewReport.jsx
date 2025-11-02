// client/src/pages/NewReport.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera'; // For a nice upload button

export default function NewReport() {
  const { user } = useAuth();
  const nav = useNavigate();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [universityId, setUniversityId] = useState(user?.isStudent ? user.university : '');
  const [universities, setUniversities] = useState([]);
  const [otherUniversityName, setOtherUniversityName] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load universities list
  useEffect(() => {
    (async () => {
      try {
        const u = await api('/api/universities');
        if (Array.isArray(u)) {
          setUniversities(u.filter(uni => uni.status !== 'pending'));
        }
      } catch (err) {
        console.error("Failed to fetch universities", err);
      }
    })();
  }, []);

  // Generate previews when files change
  useEffect(() => {
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [files]);

  const onFileChange = (e) => {
    const selected = Array.from(e.target.files).slice(0, 5);
    setFiles(selected);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!universityId) {
      setError('Please select a university.');
      setLoading(false);
      return;
    }
    if (universityId === 'OTHER' && !otherUniversityName.trim()) {
      setError('Please enter the name of the university.');
      setLoading(false);
      return;
    }

    const fd = new FormData();
    fd.append('title', title);
    fd.append('body', body);
    fd.append('anonymous', anonymous);
    fd.append('isPublic', isPublic);
    fd.append('universityId', universityId);
    if (universityId === 'OTHER') {
      fd.append('otherUniversityName', otherUniversityName);
    }
    files.forEach(f => fd.append('media', f));

    try {
      const res = await api('/api/reports', { method: 'POST', body: fd });
      if (res.report) {
        alert('Report submitted successfully!');
        nav('/');
      } else {
        setError(res.message || 'Something went wrong');
      }
    } catch (err) {
      setError(err.message || 'Server error');
    }
    setLoading(false);
  };

  // Helper to find the student's university name
  const getStudentUniversityName = () => {
    if (!user || !user.isStudent) return '';
    const uni = universities.find(u => u._id === user.university);
    return uni ? uni.name : '(Your University)';
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper 
        elevation={3} 
        sx={{
          mt: 8,
          p: { xs: 2, sm: 4 }, // Smaller padding on extra-small screens
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Create a Report
        </Typography>
        
        <Box component="form" onSubmit={submit} sx={{ mt: 3, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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

            {/* --- CONDITIONAL UNIVERSITY FIELDS --- */}
            {!user ? (
              <p>Loading user info...</p>
            ) : user.isStudent ? (
              // --- IF USER IS A STUDENT ---
              <TextField
                fullWidth
                label="University (Locked to your profile)"
                value={getStudentUniversityName()}
                disabled
                variant="filled" // Filled variant looks better when disabled
              />
            ) : (
              // --- IF USER IS A NON-STUDENT (Show dropdown) ---
              <>
                <FormControl fullWidth required>
                  <InputLabel id="uni-select-label">Which university is this report about?</InputLabel>
                  <Select
                    labelId="uni-select-label"
                    label="Which university is this report about?"
                    value={universityId}
                    onChange={e => setUniversityId(e.target.value)}
                  >
                    <MenuItem value="" disabled>-- Select a University --</MenuItem>
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
              </>
            )}
            {/* --- END OF CONDITIONAL FIELDS --- */}

            <Divider sx={{ my: 1 }} />

            <Button
              variant="outlined"
              component="label" // This makes the button act as a file input label
              startIcon={<PhotoCamera />}
            >
              Upload Images (Max 5)
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                hidden // Hide the ugly default input
                onChange={onFileChange} 
              />
            </Button>

            {/* Image previews */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {previews.map((p, i) => (
                <Box
                  key={i}
                  component="img"
                  src={p}
                  alt="preview"
                  sx={{ width: 120, height: 90, objectFit: 'cover', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              ))}
            </Box>

            <FormControlLabel
              control={
                <Checkbox 
                  checked={isPublic} 
                  onChange={e => setIsPublic(e.target.checked)} 
                />
              }
              label="Make this report visible on the public feed"
            />
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={anonymous} 
                  onChange={e => setAnonymous(e.target.checked)} 
                />
              }
              label="Post anonymously"
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
              sx={{ mt: 2, p: 1.5 }} // p: padding
            >
              {loading ? <CircularProgress size={24} /> : "Submit Report"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
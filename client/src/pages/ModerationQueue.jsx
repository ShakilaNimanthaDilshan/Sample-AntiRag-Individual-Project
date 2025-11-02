// client/src/pages/ModerationQueue.jsx
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../api';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  Card,
  CardActionArea,
  CardContent,
  Divider,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ModerationQueue() {
  const [reports, setReports] = useState([]);
  const [caseFiles, setCaseFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [reportRes, caseRes] = await Promise.all([
        api('/api/reports/moderation'),
        api('/api/case-files') // Get all case files for management
      ]);
      
      if (Array.isArray(reportRes)) setReports(reportRes);
      else setReports([]);
      
      if (Array.isArray(caseRes)) setCaseFiles(caseRes);
      else setCaseFiles([]);

    } catch (err) {
      console.error('Error fetching data:', err);
      setReports([]);
      setCaseFiles([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleDeleteCaseFile = async (id) => {
    if (!window.confirm('Are you sure you want to delete this case file?')) return;
    try {
      await api(`/api/case-files/${id}`, { method: 'DELETE' });
      alert('Case file deleted');
      fetchAllData(); // Refresh the list
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  if (isLoading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        <CircularProgress />
        <Typography>Loading Moderation Queue...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      
      {/* --- Case File Management --- */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manage Documented Cases
        </Typography>
        <Button 
          variant="contained" 
          color="success" 
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => nav('/admin/case-files/new')}
          sx={{ mb: 2 }}
        >
          Create New Case File
        </Button>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {caseFiles.length === 0 && <Typography>No case files created yet.</Typography>}
          {caseFiles.map(item => (
            <Paper 
              key={item._id} 
              variant="outlined" 
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5 }}
            >
              <Typography>{item.title}</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  size="small" 
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => nav(`/admin/case-files/edit/${item._id}`)}
                >
                  Edit
                </Button>
                <Button 
                  size="small" 
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteCaseFile(item._id)}
                >
                  Delete
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      </Paper>
      
      <Divider sx={{ my: 4 }} /> {/* my: 4 means margin-top and margin-bottom */}

      {/* --- Private Report Queue --- */}
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Private Report Queue
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          This page shows all non-public reports submitted for your review.
        </Typography>
        
        {reports.length === 0 ? (
          <Typography>The moderation queue is empty.</Typography>
        ) : (
          reports.map(r => (
            // We re-use the same Card component from the Feed for consistency
            <CardActionArea 
              key={r._id} 
              component={RouterLink} 
              to={`/report/${r._id}`}
              sx={{ display: 'block' }}
            >
              <Card sx={{ mb: 2, border: '1px solid orange', background: '#fffbeb' }}>
                <CardContent>
                  <Typography variant="h5" component="h3">
                    {r.title || 'Experience'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {r.university?.name} • {new Date(r.createdAt).toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#555' }}>
                    {r.anonymous ? 'Posted anonymously' : (r.author?.name || 'Unknown')}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {r.body}
                  </Typography>
                </CardContent>
              </Card>
            </CardActionArea>
          ))
        )}
      </Box>
    </Container>
  );
}
// client/src/pages/Feed.jsx
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Import useNavigate
import api from '../api';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  TextField, 
  Card, 
  CardContent, 
  CardActionArea,
  CircularProgress, 
  Link
} from '@mui/material'; // Import MUI components

export default function Feed() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate(); // Use navigate for the "Create Report" button

  // Fetch all reports when the page first loads
  useEffect(() => {
    fetchReports();
  }, []);

  // Updated function to handle both all reports AND searches
  const fetchReports = async (searchTerm = '') => {
    setIsLoading(true);
    let url = '/api/reports';

    if (searchTerm) {
      url = `/api/reports?q=${encodeURIComponent(searchTerm)}`;
    }
    
    try {
      const res = await api(url);
      
      if (Array.isArray(res)) {
        setReports(res);
      } else {
        console.error('Failed to fetch reports:', res.message);
        setReports([]);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setReports([]);
    }
    setIsLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault(); 
    fetchReports(search);
  };

  const handleClearSearch = () => {
    setSearch('');
    fetchReports(''); 
  };

  return (
    // Container centers your content and adds padding
    <Container maxWidth="md" sx={{ mt: 4 }}> {/* mt: 4 means "margin-top: 32px" */}
      
      {/* Header and "Create Report" button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Recent Reports
        </Typography>
        <Button variant="contained" color="primary" onClick={() => nav('/new')}>
          Create Report
        </Button>
      </Box>

      {/* Search Bar */}
      <Box 
        component="form" 
        onSubmit={handleSearchSubmit} 
        sx={{ display: 'flex', gap: '8px', mb: 4 }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search report titles and content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit" variant="contained">Search</Button>
        <Button type="button" variant="outlined" onClick={handleClearSearch}>Clear</Button>
      </Box>

      {/* Reports List */}
      <Box>
        {isLoading ? (
          // Show a nice loading spinner in the center
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {reports.length === 0 && <Typography>No reports found.</Typography>}

            {/* Map over reports and create a Card for each */}
            {reports.map(r => (
              // CardActionArea makes the whole card clickable
              <CardActionArea 
                key={r._id} 
                component={RouterLink} 
                to={`/report/${r._id}`}
                sx={{ display: 'block' }}
              >
                <Card sx={{ mb: 2 }}> {/* mb: 2 means "margin-bottom: 16px" */}
                  <CardContent>
                    <Typography variant="h5" component="h3">
                      {r.title || 'Experience'}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {r.university?.name} • {new Date(r.createdAt).toLocaleString()}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#555' }}>
                      {r.anonymous
                        ? "Posted anonymously"
                        : r.author
                          ? r.author.isStudent
                            ? r.author.name
                            : `A ${r.author.profession || 'Public Member'}`
                          : "Unknown"}
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
            ))}
          </>
        )}
      </Box>
    </Container>
  );
}
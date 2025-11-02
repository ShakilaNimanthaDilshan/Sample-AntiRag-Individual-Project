// client/src/pages/DocumentedCases.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Link as MuiLink,
} from '@mui/material';

export default function DocumentedCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      try {
        // This is your updated API call (from our previous step)
        const res = await api('/api/case-files');
        if (Array.isArray(res)) {
          setCases(res);
        }
      } catch (err) {
        console.error("Failed to fetch cases", err);
      }
      setLoading(false);
    };
    fetchCases();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Historic Incidents
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        This is an archive of publicly documented incidents and news articles.
        This information is curated by our moderation team to provide historical context.
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress />
        </Box>
      ) : cases.length === 0 ? (
        <Typography>No documented cases have been added yet.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {cases.map(item => (
            <Card key={item._id} elevation={2}>
              {/* CardMedia is used to display the image */}
              {item.imageUrl && (
                <CardMedia
                  component="img"
                  height="250"
                  image={item.imageUrl}
                  alt={item.title}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  {item.title}
                </Typography>
                
                {item.dateOfIncident && (
                  <Typography variant="body2" color="text.secondary">
                    Date of Incident: {new Date(item.dateOfIncident).toLocaleDateString()}
                  </Typography>
                )}
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Posted by: {item.author?.name || 'Admin'} on {new Date(item.createdAt).toLocaleDateString()}
                </Typography>
                
                <Typography variant="body1" sx={{ my: 2, whiteSpace: 'pre-wrap' }}>
                  {item.description}
                </Typography>

                {item.sourceUrl && (
                  <MuiLink href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                    Read source article
                  </MuiLink>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}
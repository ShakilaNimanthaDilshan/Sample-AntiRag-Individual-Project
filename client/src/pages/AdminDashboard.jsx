// client/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Select,
  MenuItem,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme, // <-- 1. IMPORT useTheme
  FormControl,
  InputLabel
} from '@mui/material';

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [flaggedReports, setFlaggedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mergeTargets, setMergeTargets] = useState({});
  const theme = useTheme(); // <-- 2. GET THE THEME

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes, flaggedRes] = await Promise.all([
        api('/api/admin/universities/pending'),
        api('/api/universities'),
        api('/api/admin/flagged-reports')
      ]);

      if (Array.isArray(pendingRes)) setPending(pendingRes);
      else setPending([]);
      
      if (Array.isArray(approvedRes)) setApproved(approvedRes.filter(u => u.status !== 'pending'));
      else setApproved([]);
      
      if (Array.isArray(flaggedRes)) setFlaggedReports(flaggedRes);
      else setFlaggedReports([]);

    } catch (err) {
      console.error("Failed to fetch data", err);
      setPending([]);
      setApproved([]);
      setFlaggedReports([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this university?')) return;
    try {
      await api(`/api/admin/universities/approve/${id}`, { method: 'PUT' });
      alert('Approved!');
      fetchData();
    } catch (err) {
      alert('Failed to approve');
    }
  };

  const handleMerge = async (badId) => {
    const goodId = mergeTargets[badId];
    if (!goodId) return alert('Please select a university to merge into.');

    const goodUni = approved.find(u => u._id === goodId);
    const badUniName = pending.find(p => p._id === badId)?.name || 'the selected university';

    if (!window.confirm(`Are you sure you want to merge "${badUniName}" into "${goodUni.name}"? This cannot be undone.`)) return;

    try {
      await api('/api/admin/universities/merge', {
        method: 'POST',
        body: { badId, goodId }
      });
      alert('Merge successful!');
      fetchData();
    } catch (err) {
      alert('Merge failed. See console.');
      console.error(err);
    }
  };

  const handleMergeTargetChange = (badId, goodId) => {
    setMergeTargets(prev => ({
      ...prev,
      [badId]: goodId
    }));
  };

  const handleDismissFlags = async (reportId) => {
    if (!window.confirm('Are you sure you want to dismiss the flags for this report?')) return;
    try {
      await api(`/api/admin/dismiss-flags/${reportId}`, { method: 'PUT' });
      alert('Flags dismissed!');
      fetchData();
    } catch (err) {
      alert('Failed to dismiss flags');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to permanently DELETE this report?')) return;
    try {
      await api(`/api/reports/${reportId}`, { method: 'DELETE' });
      alert('Report deleted!');
      fetchData();
    } catch (err) {
      alert('Failed to delete report');
    }
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        <CircularProgress />
        <Typography>Loading Dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* --- PENDING UNIVERSITIES --- */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Pending Universities ({pending.length})
        </Typography>
        <TableContainer>
          <Table>
            {/* --- 3. THIS IS THE FIX --- */}
            <TableHead sx={{ backgroundColor: theme.palette.action.hover }}>
              <TableRow>
                <TableCell>Pending Name</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pending.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No pending universities.
                  </TableCell>
                </TableRow>
              )}
              {pending.map(uni => (
                <TableRow key={uni._id}>
                  <TableCell>{uni.name}</TableCell>
                  <TableCell sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Button 
                      variant="contained" 
                      color="success" 
                      size="small"
                      onClick={() => handleApprove(uni._id)}
                    >
                      Approve
                    </Button>
                    <Box sx={{ display: 'flex', gap: '5px' }}>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Merge into...</InputLabel>
                        <Select
                          value={mergeTargets[uni._id] || ''}
                          onChange={(e) => handleMergeTargetChange(uni._id, e.target.value)}
                          label="Merge into..."
                        >
                          {approved.map(aUni => (
                            <MenuItem key={aUni._id} value={aUni._id}>{aUni.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleMerge(uni._id)}
                        disabled={!mergeTargets[uni._id]}
                      >
                        Merge
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* --- FLAGGED CONTENT --- */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Flagged Content ({flaggedReports.length})
        </Typography>
        <TableContainer>
          <Table>
            {/* --- 3. THIS IS THE FIX --- */}
            <TableHead sx={{ backgroundColor: theme.palette.action.hover }}>
              <TableRow>
                <TableCell>Report Content</TableCell>
                <TableCell>Author</TableCell>
                <TableCell align="center">Flags</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flaggedReports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No flagged reports.
                  </TableCell>
                </TableRow>
              )}
              {flaggedReports.map(report => (
                <TableRow key={report._id}>
                  <TableCell>{report.body.substring(0, 150)}...</TableCell>
                  <TableCell>{report.author?.name || 'Unknown'}</TableCell>
                  <TableCell align="center">{report.flags.length}</TableCell>
                  <TableCell sx={{ display: 'flex', gap: '10px' }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => handleDismissFlags(report._id)}
                    >
                      Dismiss Flags
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteReport(report._id)}
                    >
                      Delete Report
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}
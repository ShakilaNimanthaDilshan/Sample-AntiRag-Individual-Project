// client/pages/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import io from 'socket.io-client';
import api from '../api';

// --- MUI Imports ---
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material';
// --- End MUI Imports ---

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const getRandomColor = () => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`;

export default function AnalyticsDashboard() {
  const [pieData, setPieData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const processMonthlyData = (data) => {
    const processed = {};
    const universityNames = {};
    if (!Array.isArray(data)) return { processed: {}, universityNames: {} };
    for (const item of data) {
      if (!processed[item.universityId]) {
        processed[item.universityId] = Array(12).fill(0);
        universityNames[item.universityId] = item.universityName;
      }
      processed[item.universityId][item.month - 1] += item.count;
    }
    const firstUniId = Object.keys(universityNames)[0];
    if (firstUniId) {
      setSelectedUniversity(firstUniId);
    }
    return { processed, universityNames };
  };

  const fetchData = async () => {
    console.log("Fetching analytics data...");
    setLoading(true);
    try {
      const [pieRes, monthRes] = await Promise.all([
        api('/api/analytics/reports-by-university'),
        api('/api/analytics/reports-by-month')
      ]);
      if (Array.isArray(pieRes) && pieRes.length > 0) {
        setPieData({
          labels: pieRes.map(d => d.name),
          datasets: [{
            label: '# of Reports',
            data: pieRes.map(d => d.count),
            backgroundColor: pieRes.map(() => getRandomColor()),
            borderColor: theme.palette.background.paper,
            borderWidth: 1,
          }]
        });
      } else {
        setPieData(null);
      }
      if (Array.isArray(monthRes) && monthRes.length > 0) {
        setMonthlyData(processMonthlyData(monthRes));
      } else {
        setMonthlyData(null);
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
      setPieData(null);
      setMonthlyData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const socket = io('http://localhost:5000');
    socket.on('analytics_updated', () => {
      console.log('Real-time update received!');
      fetchData();
    });
    return () => {
      socket.disconnect();
    };
  }, [theme.palette.text.primary]); 

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: theme.palette.text.primary,
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme.palette.text.primary,
        }
      },
      title: {
        display: true,
        text: monthlyData?.universityNames[selectedUniversity] || 'Monthly Reports',
        color: theme.palette.text.primary,
      },
    },
    scales: {
      y: {
        ticks: { color: theme.palette.text.secondary },
        grid: { color: theme.palette.divider }
      },
      x: {
        ticks: { 
          color: theme.palette.text.secondary,
          // autoSkip: false // <-- 1. REMOVED THIS LINE
        },
        grid: { color: theme.palette.divider }
      }
    }
  };

  const barChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Monthly Reports',
      data: (monthlyData && monthlyData.processed[selectedUniversity]) ? monthlyData.processed[selectedUniversity] : [],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      barPercentage: 0.8,
      categoryPercentage: 0.8
    }]
  };
  
  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        <CircularProgress />
        <Typography>Loading Analytics...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        These charts update in real-time when new reports are submitted.
      </Typography>

      <Grid container spacing={3}>
        {/* PIE CHART */}
        {/* --- 2. CHANGED GRID SIZING --- */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Typography variant="h6" component="h2" align="center" gutterBottom>
              Reports by University
            </Typography>
            <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}> 
              {pieData ? <Pie data={pieData} options={pieChartOptions} /> : <Typography>No data to display.</Typography>}
            </Box>
          </Paper>
        </Grid>

        {/* BAR CHART */}
        {/* --- 2. CHANGED GRID SIZING --- */}
        <Grid item xs={12} md={8} lg={9}>
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Typography variant="h6" component="h2" align="center" gutterBottom>
              Monthly Reports per University
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="uni-select-label">Select a University</InputLabel>
              <Select
                labelId="uni-select-label"
                label="Select a University"
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
              >
                <MenuItem value="" disabled>-- Select a University --</MenuItem>
                {monthlyData && monthlyData.universityNames && Object.entries(monthlyData.universityNames).map(([id, name]) => (
                  <MenuItem key={id} value={id}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}> 
              {selectedUniversity ? <Bar options={barChartOptions} data={barChartData} /> : <Typography>Please select a university.</Typography>}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
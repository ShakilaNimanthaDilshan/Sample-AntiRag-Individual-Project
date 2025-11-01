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

// Register the components we need from Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// Helper to generate random colors for the pie chart
const getRandomColor = () => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`;

export default function AnalyticsDashboard() {
  const [pieData, setPieData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [loading, setLoading] = useState(true);

  // This function processes the raw monthly data from the API
  const processMonthlyData = (data) => {
    const processed = {};
    const universityNames = {};

    // Check if data is an array before iterating
    if (!Array.isArray(data)) {
      console.error("processMonthlyData expected an array, but got:", data);
      return { processed: {}, universityNames: {} };
    }

    for (const item of data) {
      if (!processed[item.universityId]) {
        processed[item.universityId] = Array(12).fill(0); // Create an array for 12 months
        universityNames[item.universityId] = item.universityName;
      }
      // Note: month is 1-indexed (1=Jan), so we subtract 1
      processed[item.universityId][item.month - 1] += item.count;
    }
    
    // Set the first university as the default selection
    const firstUniId = Object.keys(universityNames)[0];
    if (firstUniId) {
      setSelectedUniversity(firstUniId);
    }
    
    return { processed, universityNames };
  };

  // This function fetches all data from our new endpoints
  const fetchData = async () => {
    console.log("Fetching analytics data...");
    setLoading(true);
    try {
      const [pieRes, monthRes] = await Promise.all([
        api('/api/analytics/reports-by-university'),
        api('/api/analytics/reports-by-month')
      ]);

      // --- 1. Set Pie Chart Data (FIXED) ---
      if (Array.isArray(pieRes) && pieRes.length > 0) {
        setPieData({
          labels: pieRes.map(d => d.name),
          datasets: [{
            label: '# of Reports',
            data: pieRes.map(d => d.count),
            backgroundColor: pieRes.map(() => getRandomColor()),
          }]
        });
      } else {
        // Handle error or empty response
        console.warn("No data for pie chart or API error:", pieRes);
        setPieData(null);
      }

      // --- 2. Set Monthly Bar Chart Data (FIXED) ---
      if (Array.isArray(monthRes) && monthRes.length > 0) {
        setMonthlyData(processMonthlyData(monthRes));
      } else {
        // Handle error or empty response
        console.warn("No data for bar chart or API error:", monthRes);
        setMonthlyData(null);
      }

    } catch (err) {
      console.error("Failed to fetch analytics", err);
      // Reset state on a major error
      setPieData(null);
      setMonthlyData(null);
    }
    setLoading(false);
  };

  // --- 3. REAL-TIME LOGIC ---
  useEffect(() => {
    // Fetch data on initial page load
    fetchData();

    // Connect to the WebSocket server
    const socket = io('http://localhost:5000'); // Your backend URL

    // Listen for the 'analytics_updated' event
    socket.on('analytics_updated', () => {
      console.log('Real-time update received!');
      fetchData(); // Re-fetch all data when a new report is posted
    });

    // Disconnect socket on cleanup
    return () => {
      socket.disconnect();
    };
  }, []); // Empty array means this runs once on mount

  // --- 4. Prepare data for the Bar Chart ---
  const barChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Monthly Reports',
      data: (monthlyData && monthlyData.processed[selectedUniversity]) ? monthlyData.processed[selectedUniversity] : [],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    }]
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      <h2>Analytics Dashboard</h2>
      <p style={{ color: '#555' }}>These charts update in real-time when new reports are submitted.</p>

      {loading && <p>Loading charts...</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* PIE CHART */}
        <div style={{ flex: 1, minWidth: '300px', maxWidth: '400px', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
          <h3>Reports by University</h3>
          {pieData ? <Pie data={pieData} /> : <p>No data to display.</p>}
        </div>

        {/* BAR CHART */}
        <div style={{ flex: 2, minWidth: '400px', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
          <h3>Monthly Reports per University</h3>
          
          <select 
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          >
            <option value="" disabled>-- Select a University --</option>
            {monthlyData && monthlyData.universityNames && Object.entries(monthlyData.universityNames).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>

          {selectedUniversity ? <Bar data={barChartData} /> : <p>Please select a university to see monthly data.</p>}
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import api from '../api';

export default function Feed() {
  const [reports, setReports] = useState([]);
  // const navigate = useNavigate() // No longer needed for edit/delete
  // const user = JSON.parse(localStorage.getItem('user')) // No longer needed

  useEffect(() => {
    fetchReports();
  }, []);

  // 🔄 Fetch all reports (This function is now corrected)
  const fetchReports = async () => {
    try {
      const res = await api('/api/reports');
      
      // --- THIS IS THE FIX ---
      // Check if the response is an array before setting state
      if (Array.isArray(res)) {
        setReports(res);
      } else {
        // If it's not an array, it's an error (like 429 Too Many Requests)
        console.error('Failed to fetch reports:', res.message || 'API returned non-array response');
        setReports([]); // Reset to an empty array to prevent crash
      }
      // --- END OF FIX ---

    } catch (err) {
      console.error('Error fetching reports:', err);
      setReports([]); // Also reset to an empty array on catch
    }
  };

  // ... (rest of your commented-out code is fine) ...

  return (
    <div>
      <h2>Recent Reports</h2>
      <Link to="/new">Create report</Link>

      <div>
        {reports.length === 0 && <p>No reports yet</p>}

        {/* Replaced map block */}
        {reports.map(r => (
          <Link to={`/report/${r._id}`} key={r._id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <article style={{ border: '1px solid #ddd', padding: 10, marginTop: 10, cursor: 'pointer' }}>
              <h3>{r.title || 'Experience'}</h3>
              <small>{r.university?.name} • {new Date(r.createdAt).toLocaleString()}</small>
              <p>{r.anonymous ? 'Posted anonymously' : (r.author?.name || 'Unknown')}</p>
              <p style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3, // Show 3 lines
                WebkitBoxOrient: 'vertical'
              }}>
                {r.body}
              </p>
              {/* We'll show media on the detail page, not the feed */}
              {/* You can add comment/like counts here later if you want */}
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
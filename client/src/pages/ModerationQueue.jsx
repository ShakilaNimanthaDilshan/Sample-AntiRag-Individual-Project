// client/src/pages/ModerationQueue.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function ModerationQueue() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      // --- FETCH FROM THE NEW ROUTE ---
      const res = await api('/api/reports/moderation'); 

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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Moderation Queue</h2>
      <p>This page shows all non-public reports submitted for your review.</p>

      <div>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            {reports.length === 0 && <p>The moderation queue is empty.</p>}
            {reports.map(r => (
              <Link to={`/report/${r._id}`} key={r._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <article style={{ border: '1px solid #ddd', padding: 10, marginTop: 10, cursor: 'pointer', background: '#fffbeb' }}>
                  <h3>{r.title || 'Experience'}</h3>
                  <small>{r.university?.name} • {new Date(r.createdAt).toLocaleString()}</small>
                  <p>{r.anonymous ? 'Posted anonymously' : (r.author?.name || 'Unknown')}</p>
                  <p style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {r.body}
                  </p>
                </article>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
// client/src/pages/DocumentedCases.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';

export default function DocumentedCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      try {
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

  const caseStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  };

  return (
    <div style={{ maxWidth: 800, margin: '20px auto' }}>
      <h1>Documented Incidents</h1>
      <p>This is an archive of publicly documented ragging incidents and their outcomes. This information is curated by our moderation team to provide historical context.</p>
      <hr />
      
      {loading ? (
        <p>Loading cases...</p>
      ) : cases.length === 0 ? (
        <p>No documented cases have been added yet.</p>
      ) : (
        <div>
          {cases.map(item => (
            <article key={item._id} style={caseStyle}>
              <h3>{item.title}</h3>
              {item.dateOfIncident && (
                <small>Date of Incident: {new Date(item.dateOfIncident).toLocaleDateString()}</small>
              )}
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', margin: '15px 0' }} />
              )}
              <p style={{ whiteSpace: 'pre-wrap' }}>{item.description}</p>
              {item.sourceUrl && (
                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                  Read source article
                </a>
              )}
              <br/>
              <small style={{ color: '#555', marginTop: '10px' }}>Posted by: {item.author?.name || 'Admin'}</small>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
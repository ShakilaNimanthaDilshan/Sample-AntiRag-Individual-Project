// client/src/pages/ModerationQueue.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // <-- Import useNavigate
import api from '../api';

export default function ModerationQueue() {
  const [reports, setReports] = useState([]);
  const [caseFiles, setCaseFiles] = useState([]); // <-- ADDED
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate(); // <-- ADDED

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [reportRes, caseRes] = await Promise.all([
        api('/api/reports/moderation'),
        api('/api/case-files') // Get all case files for management
      ]);
      
      if (Array.isArray(reportRes)) {
        setReports(reportRes);
      } else {
        setReports([]);
      }
      
      if (Array.isArray(caseRes)) {
        setCaseFiles(caseRes);
      } else {
        setCaseFiles([]);
      }
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

  // --- ADDED: Delete handler for Case Files ---
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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      
      {/* --- NEW SECTION: Case File Management --- */}
      <h2>Manage Documented Cases</h2>
      <Link to="/admin/case-files/new">
        <button style={{ background: 'green', color: 'white', padding: '8px 12px' }}>
          + Create New Case File
        </button>
      </Link>
      <div style={{ marginTop: '15px' }}>
        {isLoading ? <p>Loading cases...</p> : (
          caseFiles.map(item => (
            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', border: '1px solid #eee' }}>
              <span>{item.title}</span>
              <div>
                <button onClick={() => nav(`/admin/case-files/edit/${item._id}`)} style={{ marginRight: '8px' }}>
                  Edit
                </button>
                <button onClick={() => handleDeleteCaseFile(item._id)} style={{ background: 'red', color: 'white' }}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* --- END OF NEW SECTION --- */}

      <hr style={{ margin: '40px 0' }} />

      <h2>Private Report Queue</h2>
      <p>This page shows all non-public reports submitted for your review.</p>

      <div>
        {isLoading ? (
          <p>Loading reports...</p>
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
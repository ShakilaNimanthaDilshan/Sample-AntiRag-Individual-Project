// client/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [flaggedReports, setFlaggedReports] = useState([]); // <-- ADDED THIS
  const [loading, setLoading] = useState(true);
  const [mergeTargets, setMergeTargets] = useState({}); // { badId: 'goodIdToMergeInto' }

  const fetchData = async () => {
    setLoading(true);
    try {
      // --- MODIFIED: Added flaggedRes ---
      const [pendingRes, approvedRes, flaggedRes] = await Promise.all([
        api('/api/admin/universities/pending'),
        api('/api/universities'), // Get all approved unis
        api('/api/admin/flagged-reports') // <-- ADDED THIS
      ]);

      // --- THIS IS THE FIX ---
      if (Array.isArray(pendingRes)) {
        setPending(pendingRes);
      } else {
        console.error("Failed to fetch pending universities:", pendingRes?.message);
        setPending([]); // Set to empty array on error
      }
      
      if (Array.isArray(approvedRes)) {
        // Filter out pending unis from the "approved" list
        setApproved(approvedRes.filter(u => u.status !== 'pending'));
      } else {
        console.error("Failed to fetch universities:", approvedRes?.message);
        setApproved([]); // Set to empty array on error
      }
      // --- END OF FIX ---

      // --- ADDED THIS BLOCK ---
      if (Array.isArray(flaggedRes)) {
        setFlaggedReports(flaggedRes);
      } else {
        console.error("Failed to fetch flagged reports:", flaggedRes?.message);
        setFlaggedReports([]);
      }
      // --- END OF ADDED BLOCK ---

    } catch (err) {
      console.error("Failed to fetch data", err);
      // Reset state on a major error
      setPending([]);
      setApproved([]);
      setFlaggedReports([]); // <-- ADDED THIS
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
      fetchData(); // Refresh lists
    } catch (err) {
      alert('Failed to approve');
    }
  };

  const handleMerge = async (badId) => {
    const goodId = mergeTargets[badId];
    if (!goodId) return alert('Please select a university to merge into.');

    const goodUni = approved.find(u => u._id === goodId);
    // Add a check in case the pending uni name isn't found (it shouldn't happen, but safe)
    const badUniName = pending.find(p => p._id === badId)?.name || 'the selected university';

    if (!window.confirm(`Are you sure you want to merge "${badUniName}" into "${goodUni.name}"? This cannot be undone.`)) return;

    try {
      await api('/api/admin/universities/merge', {
        method: 'POST',
        body: { badId, goodId }
      });
      alert('Merge successful!');
      fetchData(); // Refresh lists
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

  // --- ADDED THESE NEW HANDLERS ---
  const handleDismissFlags = async (reportId) => {
    if (!window.confirm('Are you sure you want to dismiss the flags for this report?')) return;
    try {
      await api(`/api/admin/dismiss-flags/${reportId}`, { method: 'PUT' });
      alert('Flags dismissed!');
      fetchData(); // Refresh all data
    } catch (err) {
      alert('Failed to dismiss flags');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to permanently DELETE this report?')) return;
    try {
      // Use the admin delete route we built before
      await api(`/api/reports/${reportId}`, { method: 'DELETE' });
      alert('Report deleted!');
      fetchData(); // Refresh all data
    } catch (err) {
      alert('Failed to delete report');
    }
  };
  // --- END OF ADDED HANDLERS ---

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h2>Admin Dashboard</h2>
      <h3>Pending Universities ({pending.length})</h3>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>Pending Name</th>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pending.length === 0 && (
            <tr>
              <td colSpan="2" style={{ padding: 8, border: '1px solid #ddd', textAlign: 'center' }}>
                No pending universities.
              </td>
            </tr>
          )}
          {pending.map(uni => (
            <tr key={uni._id}>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>{uni.name}</td>
              <td style={{ padding: 8, border: '1px solid #ddd', display: 'flex', gap: '10px' }}>

                <button onClick={() => handleApprove(uni._id)} style={{ background: 'lightgreen' }}>
                  Approve
                </button>

                <div style={{ display: 'flex', gap: '5px' }}>
                  <select 
                    value={mergeTargets[uni._id] || ''} 
                    onChange={(e) => handleMergeTargetChange(uni._id, e.target.value)}
                  >
                    <option value="" disabled>-- Merge into... --</option>
                    {approved.map(aUni => (
                      <option key={aUni._id} value={aUni._id}>{aUni.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => handleMerge(uni._id)} 
                    disabled={!mergeTargets[uni._id]}
                    style={{ background: 'lightblue' }}
                  >
                    Merge
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- ADDED THIS ENTIRE NEW TABLE --- */}
      <h3 style={{ marginTop: '40px' }}>Flagged Content ({flaggedReports.length})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>Report Content</th>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>Author</th>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>Flags</th>
            <th style={{ padding: 8, border: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flaggedReports.length === 0 && (
            <tr>
              <td colSpan="4" style={{ padding: 8, border: '1px solid #ddd', textAlign: 'center' }}>
                No flagged reports.
              </td>
            </tr>
          )}
          {flaggedReports.map(report => (
            <tr key={report._id}>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>{report.body.substring(0, 150)}...</td>
              <td style={{ padding: 8, border: '1px solid #ddd' }}>{report.author?.name || 'Unknown'}</td>
              <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'center' }}>{report.flags.length}</td>
              <td style={{ padding: 8, border: '1px solid #ddd', display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleDismissFlags(report._id)} 
                  style={{ background: 'lightblue' }}
                >
                  Dismiss Flags
                </button>
                <button 
                  onClick={() => handleDeleteReport(report._id)} 
                  style={{ background: 'red', color: 'white' }}
                >
                  Delete Report
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* --- END OF NEW TABLE --- */}
      
    </div>
  );
}
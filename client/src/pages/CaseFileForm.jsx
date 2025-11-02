// client/src/pages/CaseFileForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

export default function CaseFileForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateOfIncident, setDateOfIncident] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const nav = useNavigate();
  const { id } = useParams(); // Gets the ID from the URL (if we are editing)
  const isEditing = Boolean(id);

  // --- THIS IS THE FIX ---
  // If editing, fetch the existing case data
  useEffect(() => {
    if (isEditing) {
      const fetchCase = async () => {
        setLoading(true);
        try {
          // 1. Call the new API route we just built
          const res = await api(`/api/case-files/${id}`);
          if (res._id) {
            // 2. Fill the form with the existing data
            setTitle(res.title);
            setDescription(res.description);
            setImageUrl(res.imageUrl || '');
            setSourceUrl(res.sourceUrl || '');
            
            // Format the date correctly for the <input type="date">
            if (res.dateOfIncident) {
              const formattedDate = new Date(res.dateOfIncident).toISOString().split('T')[0];
              setDateOfIncident(formattedDate);
            }
          } else {
            setError('Could not find case file.');
          }
        } catch (err) {
          setError('Failed to load data.');
          console.error(err);
        }
        setLoading(false);
      };
      fetchCase();
    }
  }, [isEditing, id]);
  // --- END OF FIX ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const payload = { title, description, dateOfIncident, imageUrl, sourceUrl };

    try {
      if (isEditing) {
        // This is an update
        await api(`/api/case-files/${id}`, { method: 'PUT', body: payload });
      } else {
        // This is a new post
        await api('/api/case-files', { method: 'POST', body: payload });
      }
      setLoading(false);
      alert('Case file saved successfully!');
      nav('/moderation'); // Go back to moderation page
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to save case file.');
    }
  };

  if (loading && isEditing) {
    return <div style={{ maxWidth: 700, margin: '20px auto' }}>Loading data...</div>
  }

  return (
    <div style={{ maxWidth: 700, margin: '20px auto' }}>
      <h2>{isEditing ? 'Edit Case File' : 'Create New Case File'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input placeholder="Title *" value={title} onChange={e => setTitle(e.target.value)} required style={{ padding: 8 }} />
        <textarea placeholder="Description (the full story) *" value={description} onChange={e => setDescription(e.target.value)} required style={{ height: 200, padding: 8 }} />
        <label>Date of Incident (Optional)</label>
        <input type="date" value={dateOfIncident} onChange={e => setDateOfIncident(e.target.value)} style={{ padding: 8 }} />
        <input placeholder="Image URL (Optional)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={{ padding: 8 }} />
        <input placeholder="Source URL (e.g., news article link) (Optional)" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} style={{ padding: 8 }} />
        
        <button type="submit" disabled={loading} style={{ padding: 10, background: 'green', color: 'white' }}>
          {loading ? 'Saving...' : 'Save Case File'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}
// client/src/pages/ReportDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

// Helper to format dates
const formatDate = (dateString) => new Date(dateString).toLocaleString();

export default function ReportDetail() {
  const { id } = useParams(); // Get the report ID from the URL
  const nav = useNavigate();
  const { user } = useAuth(); // Get logged-in user

  const [report, setReport] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comment form state
  const [commentBody, setCommentBody] = useState('');
  const [commentAnon, setCommentAnon] = useState(false);

  // Fetch report and comments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reportRes, commentsRes] = await Promise.all([
          api(`/api/reports/${id}`),
          api(`/api/reports/${id}/comments`)
        ]);

        if (reportRes._id) {
          setReport(reportRes);
        } else {
          setError(reportRes.message || 'Report not found');
        }
        setComments(commentsRes || []);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]); // Re-fetch if ID changes

  // --- Handlers ---

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please log in to comment');
    if (!commentBody.trim()) return;

    const res = await api(`/api/reports/${id}/comments`, {
      method: 'POST',
      body: { body: commentBody, anonymous: commentAnon },
    });

    if (res._id) {
      // 'res' is the new comment, but its 'author' is just an ID.
      // We need to "fake" the populated author object for the UI.
      let newComment = { ...res }; 

      if (newComment.anonymous) {
        newComment.author = null; // Set author to null if anonymous
      } else {
        // It's not anonymous, so use the logged-in user's name
        newComment.author = { name: user.name || 'You' }; 
      }

      setComments([...comments, newComment]); // Add the fixed comment
      setCommentBody(''); // Clear form
      setCommentAnon(false);
    } else {
      alert(res.message || 'Failed to post comment');
    }
  };

  const handleLike = async () => {
    if (!user) return alert('Please log in to like');

    const res = await api(`/api/reports/${id}/like`, { method: 'PUT' });
    if (res.likes !== undefined) {
      // Update the like count on the report
      setReport({ ...report, likeCount: res.likes });
    } else {
      alert(res.message || 'Failed to like');
    }
  };

  const handleFlag = async () => {
    if (!user) return alert('Please log in to flag');
    if (!window.confirm('Are you sure you want to flag this report for review?')) return;

    const res = await api(`/api/reports/${id}/flag`, { method: 'PUT' });
    alert(res.message || 'Failed to flag');
  };

  // --- Render ---

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!report) return <div>Report not found.</div>;

  const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Report Details */}
      <article style={{ borderBottom: '2px solid #ccc', paddingBottom: 20 }}>
        <h2>{report.title || 'Experience'}</h2>
        <small>
          <strong>{report.university?.name}</strong> • {formatDate(report.createdAt)}
        </small>
        <p>
          By: <strong>{report.anonymous ? 'Anonymous' : report.author?.name || 'Unknown'}</strong>
        </p>
        <p style={{ fontSize: '1.1em', whiteSpace: 'pre-wrap' }}>{report.body}</p>

        {/* Media */}
        {report.media && report.media.length > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '15px 0' }}>
            {report.media.map((m, idx) => (
              m.type === 'image' ? (
                <a key={idx} href={m.url.startsWith('http') ? m.url : `${base}${m.url}`} target="_blank" rel="noreferrer">
                  <img
                    src={m.url.startsWith('http') ? m.url : `${base}${m.url}`}
                    alt={`media-${idx}`}
                    style={{ width: 150, height: 100, objectFit: 'cover', border: '1px solid #ccc' }}
                  />
                </a>
              ) : null
            ))}
          </div>
        )}

        {/* Actions: Like & Flag */}
        <div style={{ display: 'flex', gap: 15, marginTop: 15 }}>
          <button onClick={handleLike}>
            👍 Like ({report.likeCount || 0})
          </button>
          <button onClick={handleFlag} style={{ color: 'red' }}>
            🚩 Flag for Review
          </button>
        </div>
      </article>

      {/* Comments Section */}
      <section style={{ marginTop: 20 }}>
        <h3>Comments ({comments.length})</h3>

        {/* --- THIS IS THE FIXED FORM BLOCK --- */}
        {user ? (
          <form onSubmit={handleCommentSubmit} style={{ margin: '15px 0', background: '#f9f9f9', padding: 10, borderRadius: 5 }}>
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Share your advice or thoughts..."
              style={{ width: '100%', minHeight: 70, boxSizing: 'border-box' }} // Added box-sizing
            />

            {/* This container DIV fixes the layout */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between', // Pushes checkbox left, button right
              alignItems: 'center',
              marginTop: '10px'
            }}>
              
              {/* Checkbox and label are grouped together */}
              <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={commentAnon}
                  onChange={(e) => setCommentAnon(e.target.checked)}
                />
                Post anonymously
              </label>

              {/* Submit button is now inside the flex container */}
              <button type="submit">Post Comment</button>
            </div>

          </form>
        ) : (
          <p>Please <button onClick={() => nav('/login')}>log in</button> to comment.</p>
        )}
        {/* --- END OF FIXED FORM BLOCK --- */}


        {/* Comments List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {comments.map(c => (
            <div key={c._id} style={{ border: '1px solid #eee', padding: 10, borderRadius: 5 }}>
              <p>{c.body}</p>
              <small>
                By: <strong>{c.anonymous ? 'Anonymous' : c.author?.name || 'Unknown'}</strong> • {formatDate(c.createdAt)}
              </small>
            </div>
          ))}
          {comments.length === 0 && <p>Be the first to comment.</p>}
        </div>
      </section>
    </div>
  );
}
// client/src/pages/ReportDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";

// --- MUI Imports ---
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Link as MuiLink,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  ThumbUp,
  ThumbUpOutlined,
  Flag,
  FlagOutlined,
  Edit,
  Delete,
  Reply,
  Cancel,
} from "@mui/icons-material";
// --- End MUI Imports ---

// Helper to format dates
const formatDate = (dateString) => new Date(dateString).toLocaleString();

export default function ReportDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for forms
  const [commentBody, setCommentBody] = useState("");
  const [commentAnon, setCommentAnon] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyBody, setReplyBody] = useState("");
  const [replyAnon, setReplyAnon] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingReplyText, setEditingReplyText] = useState("");

  // Fetch report and comments/replies
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reportRes, commentsRes] = await Promise.all([
          api(`/api/reports/${id}`),
          api(`/api/reports/${id}/comments`),
        ]);
        if (reportRes._id) setReport(reportRes);
        else setError(reportRes.message || "Report not found");
        if (Array.isArray(commentsRes)) setComments(commentsRes);
        else setComments([]);
      } catch (err) {
        setError("Failed to fetch data. This report may be private.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // --- All handler functions (no logic changes) ---

  const handleLike = async () => {
    if (!user) return alert("Please log in to like");
    const res = await api(`/api/reports/${id}/like`, { method: "PUT" });
    if (res.likes !== undefined) {
      setReport({ ...report, likeCount: res.likes });
    }
  };

  const handleFlag = async () => {
    if (!user) return alert("Please log in to flag");
    if (!window.confirm("Are you sure you want to flag this report for review?")) return;
    try {
      const res = await api(`/api/reports/${id}/flag`, { method: "PUT" });
      setReport({ ...report, flags: [...report.flags, user.id] });
      alert(res.message || "Flag submitted");
    } catch (err) {
      alert(err.message || "An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await api(`/api/reports/${id}`, { method: "DELETE" });
      alert("Report deleted successfully.");
      nav("/");
    } catch (err) {
      alert(err.message || "An error occurred while deleting.");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    try {
      const res = await api(`/api/reports/${id}/comments`, {
        method: "POST",
        body: { body: commentBody, anonymous: commentAnon },
      });
      if (res._id) {
        let newComment = { ...res };
        newComment.author = { _id: user.id, name: user.name || "You" };
        newComment.replies = [];
        setComments([newComment, ...comments]);
        setCommentBody("");
        setCommentAnon(false);
      }
    } catch (err) { alert("An error occurred."); }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingText.trim()) return;
    try {
      const res = await api(`/api/reports/${id}/comments/${commentId}`, {
        method: "PUT",
        body: { body: editingText },
      });
      if (res._id) {
        setComments(comments.map((c) => (c._id === commentId ? { ...res, replies: c.replies } : c)));
        setEditingCommentId(null);
        setEditingText("");
      }
    } catch (err) { alert("An error occurred."); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await api(`/api/reports/${id}/comments/${commentId}`, { method: "DELETE" });
      if (res.message === "Comment deleted") {
        setComments(comments.filter((c) => c._id !== commentId));
      }
    } catch (err) { alert("An error occurred."); }
  };

  const handleReplySubmit = async (commentId) => {
    if (!replyBody.trim()) return;
    try {
      const res = await api(`/api/reports/${id}/comments/${commentId}/replies`, {
        method: "POST",
        body: { body: replyBody, anonymous: replyAnon },
      });
      if (res._id) {
        let newReply = { ...res };
        newReply.author = { _id: user.id, name: user.name || "You" };
        setComments(comments.map((c) =>
          c._id === commentId
            ? { ...c, replies: [...(c.replies || []), newReply] }
            : c
        ));
        setReplyingToId(null);
        setReplyBody("");
        setReplyAnon(false);
      }
    } catch (err) { alert("An error occurred."); }
  };

  const handleUpdateReply = async (commentId, replyId) => {
    if (!editingReplyText.trim()) return;
    try {
      const res = await api(`/api/reports/${id}/comments/${commentId}/replies/${replyId}`, {
        method: "PUT",
        body: { body: editingReplyText },
      });
      if (res._id) {
        let updatedReply = { ...res };
        updatedReply.author = { _id: user.id, name: user.name || "You" };
        setComments(comments.map((c) =>
          c._id === commentId
            ? { ...c, replies: c.replies.map((r) => r._id === replyId ? updatedReply : r) }
            : c
        ));
        setEditingReplyId(null);
        setEditingReplyText("");
      }
    } catch (err) { alert("An error occurred."); }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;
    try {
      const res = await api(`/api/reports/${id}/comments/${commentId}/replies/${replyId}`, { method: "DELETE" });
      if (res.message === "Reply deleted") {
        setComments(comments.map((c) =>
          c._id === commentId
            ? { ...c, replies: c.replies.filter((r) => r._id !== replyId) }
            : c
        ));
      }
    } catch (err) { alert("An error occurred."); }
  };


  // --- Render Logic ---
  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        <CircularProgress />
        <Typography>Loading report...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h5" color="error">{error}</Typography>
        <MuiLink component={RouterLink} to="/">Go back to the feed</MuiLink>
      </Container>
    );
  }

  if (!report) return null; // Should be caught by error state

  const isOwner = user && report.author && user.id === report.author._id;
  const isAdmin = user && user.role === "admin";
  const hasAlreadyFlagged = user && report.flags && report.flags.includes(user.id);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* --- Report Details --- */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {report.title || "Experience"}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" color="text.secondary">
            <strong>{report.university?.name}</strong>
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {formatDate(report.createdAt)}
          </Typography>
        </Box>
        
        <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
          By: <strong>{report.anonymous ? "Anonymous" : report.author?.name || "Unknown"}</strong>
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* --- Report Media --- */}
        {report.media && report.media.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            {report.media.map((m, idx) => (
              m.type === 'image' ? (
                <MuiLink key={idx} href={m.url} target="_blank" rel="noreferrer">
                  <Box
                    component="img"
                    src={m.url}
                    alt={`media-${idx}`}
                    sx={{
                      width: 150, height: 100, objectFit: 'cover',
                      border: '1px solid #ccc', borderRadius: '4px',
                      '&:hover': { opacity: 0.8 }
                    }}
                  />
                </MuiLink>
              ) : null
            ))}
          </Box>
        )}

        <Typography variant="body1" sx={{ fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
          {report.body}
        </Typography>

        {/* --- Report Actions --- */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 4, alignItems: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ThumbUpOutlined />}
            onClick={handleLike}
            disabled={!user}
          >
            Like ({report.likeCount || 0})
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={hasAlreadyFlagged ? <Flag /> : <FlagOutlined />}
            onClick={handleFlag}
            disabled={hasAlreadyFlagged || !user}
          >
            {hasAlreadyFlagged ? "Flagged" : "Flag"}
          </Button>
          
          <Box sx={{ flexGrow: 1 }} /> {/* Spacer */}

          {(isOwner || isAdmin) && (
            <>
              <Button
                variant="contained"
                size="small"
                color="secondary"
                startIcon={<Edit />}
                onClick={() => nav(`/edit/${id}`)}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                size="small"
                color="error"
                startIcon={<Delete />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </>
          )}
        </Box>
      </Paper>

      {/* --- Comments Section --- */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          Comments ({comments.length})
        </Typography>

        {/* --- New Comment Form (FIXED) --- */}
        {user ? (
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            {/* REMOVED: background: '#f9f9f9' */}
            <Box component="form" onSubmit={handleCommentSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Share your advice or thoughts..."
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox checked={commentAnon} onChange={(e) => setCommentAnon(e.target.checked)} />
                  }
                  label="Post anonymously"
                />
                <Button type="submit" variant="contained">Post Comment</Button>
              </Box>
            </Box>
          </Paper>
        ) : (
          <Typography sx={{ mb: 3 }}>
            Please <MuiLink component={RouterLink} to="/login">log in</MuiLink> to comment.
          </Typography>
        )}
        {/* --- END OF FIX --- */}

        {/* --- Comments List --- */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {comments.map((c) => {
            const isCommentOwner = user && c.author && user.id === c.author._id;
            const isEditingComment = editingCommentId === c._id;
            const isReplying = replyingToId === c._id;

            return (
              <Paper key={c._id} elevation={1} sx={{ p: 2 }}>
                {isEditingComment ? (
                  // --- Comment Edit Form ---
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="contained" onClick={() => handleUpdateComment(c._id)}>Save</Button>
                      <Button size="small" variant="outlined" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                    </Box>
                  </Box>
                ) : (
                  // --- View Comment ---
                  <Typography variant="body1">{c.body}</Typography>
                )}

                {/* --- Comment Actions --- */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    By: <strong>{c.anonymous ? "Anonymous" : c.author?.name || "Unknown"}</strong> • {formatDate(c.createdAt)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {user && !isEditingComment && (
                      <Button size="small" startIcon={<Reply />} onClick={() => setReplyingToId(isReplying ? null : c._id)}>
                        {isReplying ? "Cancel" : "Reply"}
                      </Button>
                    )}
                    {(isCommentOwner || isAdmin) && !isEditingComment && (
                      <>
                        <Button size="small" startIcon={<Edit />} onClick={() => { setEditingCommentId(c._id); setEditingText(c.body); }}>Edit</Button>
                        <Button size="small" color="error" startIcon={<Delete />} onClick={() => handleDeleteComment(c._id)}>Delete</Button>
                      </>
                    )}
                  </Box>
                </Box>

                {/* --- Reply Form (FIXED) --- */}
                {isReplying && (
                  <Box 
                    component="form" 
                    onSubmit={(e) => { e.preventDefault(); handleReplySubmit(c._id); }} 
                    sx={{ 
                      pl: 4, mt: 2, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 1, 
                      // REMOVED: background: '#fdfdfd'
                    }}
                  >
                    <TextField
                      fullWidth
                      multiline
                      size="small"
                      label="Write a reply..."
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <FormControlLabel
                        control={<Checkbox size="small" checked={replyAnon} onChange={(e) => setReplyAnon(e.target.checked)} />}
                        label={<Typography variant="caption">Post anonymously</Typography>}
                      />
                      <Button type="submit" size="small" variant="contained">Post Reply</Button>
                    </Box>
                  </Box>
                )}
                {/* --- END OF FIX --- */}
                
                {/* --- Replies List --- */}
                {c.replies && c.replies.length > 0 && (
                  <Box sx={{ mt: 2, ml: 4, borderLeft: '2px solid #eee', pl: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {c.replies.map((reply) => {
                      const isReplyOwner = user && reply.author && user.id === reply.author._id;
                      const isEditingReply = editingReplyId === reply._id;
                      return (
                        <Box key={reply._id}>
                          {isEditingReply ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <TextField fullWidth multiline size="small" value={editingReplyText} onChange={(e) => setEditingReplyText(e.target.value)} />
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button size="small" variant="contained" onClick={() => handleUpdateReply(c._id, reply._id)}>Save</Button>
                                <Button size="small" variant="outlined" onClick={() => setEditingReplyId(null)}>Cancel</Button>
                              </Box>
                            </Box>
                          ) : (
                            <Typography variant="body2">{reply.body}</Typography>
                          )}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              By: <strong>{reply.anonymous ? "Anonymous" : reply.author?.name || "Unknown"}</strong> • {formatDate(reply.createdAt)}
                            </Typography>
                            {(isReplyOwner || isAdmin) && !isEditingReply && (
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Button size="small" sx={{minWidth: 0, padding: '2px 5px'}} onClick={() => { setEditingReplyId(reply._id); setEditingReplyText(reply.body); }}><Edit sx={{ fontSize: 16 }} /></Button>
                                <Button size="small" color="error" sx={{minWidth: 0, padding: '2px 5px'}} onClick={() => handleDeleteReply(c._id, reply._id)}><Delete sx={{ fontSize: 16 }} /></Button>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Paper>
            );
          })}
          {comments.length === 0 && <Typography sx={{ mt: 3, textAlign: 'center' }}>Be the first to comment.</Typography>}
        </Box>
      </Box>
    </Container>
  );
}
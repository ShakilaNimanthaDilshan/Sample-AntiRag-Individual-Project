// client/src/pages/ReportDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";

// Helper to format dates
const formatDate = (dateString) => new Date(dateString).toLocaleString();

export default function ReportDetail() {
  const { id } = useParams(); // Get the report ID from the URL
  const nav = useNavigate();
  const { user } = useAuth(); // Get logged-in user

  const [report, setReport] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Comment form state
  const [commentBody, setCommentBody] = useState("");
  const [commentAnon, setCommentAnon] = useState(false);

  // --- ADD THESE TWO LINES ---
  const [editingCommentId, setEditingCommentId] = useState(null); // Tracks which comment is being edited
  const [editingText, setEditingText] = useState(""); // Holds the text for the edit textarea

  // Fetch report and comments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reportRes, commentsRes] = await Promise.all([
          api(`/api/reports/${id}`),
          api(`/api/reports/${id}/comments`),
        ]);

        if (reportRes._id) {
          setReport(reportRes);
        } else {
          setError(reportRes.message || "Report not found");
        }
        setComments(commentsRes || []);
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]); // Re-fetch if ID changes

  // --- Handlers ---

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in to comment");
    if (!commentBody.trim()) return;

    const res = await api(`/api/reports/${id}/comments`, {
      method: "POST",
      body: { body: commentBody, anonymous: commentAnon },
    });

    if (res._id) {
      let newComment = { ...res };

      // We MUST create the full author object so the
      // isCommentOwner (user.id === c.author._id) check
      // passes instantly.
      newComment.author = {
        _id: user.id,
        name: user.name || "You",
      };

      setComments([...comments, newComment]); // Add the fixed comment
      setCommentBody(""); // Clear form
      setCommentAnon(false);
      //...// Add the fixed comment
      setCommentBody(""); // Clear form
      setCommentAnon(false);
    } else {
      alert(res.message || "Failed to post comment");
    }
  };

  const handleLike = async () => {
    if (!user) return alert("Please log in to like");

    const res = await api(`/api/reports/${id}/like`, { method: "PUT" });
    if (res.likes !== undefined) {
      // Update the like count on the report
      setReport({ ...report, likeCount: res.likes });
    } else {
      alert(res.message || "Failed to like");
    }
  };

  const handleFlag = async () => {
    if (!user) return alert("Please log in to flag");
    if (
      !window.confirm("Are you sure you want to flag this report for review?")
    )
      return;

    const res = await api(`/api/reports/${id}/flag`, { method: "PUT" });
    alert(res.message || "Failed to flag");
  };

  // --- Added from snippet 2 ---
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this report? This cannot be undone."
      )
    ) {
      return;
    }
    try {
      // Note: The API route from a previous step might return 'Report deleted successfully'
      // This snippet expects 'Report deleted'. Adjust if your API differs.
      const res = await api(`/api/reports/${id}`, { method: "DELETE" });
      if (
        res.message === "Report deleted" ||
        res.message === "Report deleted successfully"
      ) {
        alert("Report deleted successfully.");
        nav("/"); // Navigate to home
      } else {
        alert(res.message || "Failed to delete report.");
      }
    } catch (err) {
      alert("An error occurred while deleting.");
      console.error(err);
    }
  };
  // --- End of added snippet ---

  // --- Added from snippet 1 ---
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }
    try {
      const res = await api(`/api/reports/${id}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (
        res.message === "Comment deleted" ||
        res.message === "Comment deleted successfully"
      ) {
        // Made more robust
        // Update the UI instantly by filtering out the deleted comment
        setComments(comments.filter((c) => c._id !== commentId));
      } else {
        alert(res.message || "Failed to delete comment.");
      }
    } catch (err) {
      alert("An error occurred.");
      console.error(err);
    }
  };
  // --- End of added snippet ---

  // --- Added from snippet 1 (new) ---
  const handleUpdateComment = async (commentId) => {
    if (!editingText.trim()) return; // Don't save if empty

    try {
      const res = await api(`/api/reports/${id}/comments/${commentId}`, {
        method: "PUT",
        body: { body: editingText }, // Send the new text
      });

      if (res._id) {
        // Update the comment in our local state
        setComments(
          comments.map(
            (c) => (c._id === commentId ? res : c) // Replace the old comment with the new one
          )
        );

        // Exit editing mode
        setEditingCommentId(null);
        setEditingText("");
      } else {
        alert(res.message || "Failed to update comment");
      }
    } catch (err) {
      alert("An error occurred.");
      console.error(err);
    }
  };
  // --- End of added snippet ---

  // --- Render ---

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!report) return <div>Report not found.</div>;

  const base = import.meta.env.VITE_API_BASE || "http://localhost:5000";
  // Use user.id or user._id for robustness
  const currentUserId = user?.id || user?._id;
  const isOwner = user && report.author && currentUserId === report.author._id;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* Report Details */}
      <article style={{ borderBottom: "2px solid #ccc", paddingBottom: 20 }}>
        <h2>{report.title || "Experience"}</h2>
        <small>
          <strong>{report.university?.name}</strong> •{" "}
          {formatDate(report.createdAt)}
        </small>
        <p>
          By:{" "}
          <strong>
            {report.anonymous ? "Anonymous" : report.author?.name || "Unknown"}
          </strong>
        </p>
        <p style={{ fontSize: "1.1em", whiteSpace: "pre-wrap" }}>
          {report.body}
        </p>

        {/* Media */}
        {report.media && report.media.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              margin: "15px 0",
            }}
          >
            {report.media.map((m, idx) =>
              m.type === "image" ? (
                <a
                  key={idx}
                  href={m.url.startsWith("http") ? m.url : `${base}${m.url}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={m.url.startsWith("http") ? m.url : `${base}${m.url}`}
                    alt={`media-${idx}`}
                    style={{
                      width: 150,
                      height: 100,
                      objectFit: "cover",
                      border: "1px solid #ccc",
                    }}
                  />
                </a>
              ) : null
            )}
          </div>
        )}

        {/* --- REPLACED ACTIONS BLOCK --- */}
        <div
          style={{
            display: "flex",
            gap: 15,
            marginTop: 15,
            alignItems: "center",
          }}
        >
          <button onClick={handleLike}>
            👍 Like ({report.likeCount || 0})
          </button>
          <button onClick={handleFlag} style={{ color: "red" }}>
            🚩 Flag for Review
          </button>

          {/* --- NEW EDIT/DELETE BUTTONS --- */}
          {/* Show these only if user is logged in AND user.id matches report.author.id */}
          {isOwner && ( // Use the 'isOwner' boolean
            <>
              <div style={{ flexGrow: 1 }} />{" "}
              {/* This pushes buttons to the right */}
              <button
                onClick={() => nav(`/edit/${id}`)} // Added onClick from original code
                style={{ background: "#eee", color: "#333" }}
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                style={{ background: "#ffcccc", color: "red" }}
              >
                Delete
              </button>
            </>
          )}
        </div>
        {/* --- END OF REPLACED BLOCK --- */}
      </article>

      {/* Comments Section */}
      <section style={{ marginTop: 20 }}>
        <h3>Comments ({comments.length})</h3>

        {/* --- THIS IS THE FIXED FORM BLOCK --- */}
        {user ? (
          <form
            onSubmit={handleCommentSubmit}
            style={{
              margin: "15px 0",
              background: "#f9f9f9",
              padding: 10,
              borderRadius: 5,
            }}
          >
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Share your advice or thoughts..."
              style={{ width: "100%", minHeight: 70, boxSizing: "border-box" }} // Added box-sizing
            />

            {/* This container DIV fixes the layout */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between", // Pushes checkbox left, button right
                alignItems: "center",
                marginTop: "10px",
              }}
            >
              {/* Checkbox and label are grouped together */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
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
          <p>
            Please <button onClick={() => nav("/login")}>log in</button> to
            comment.
          </p>
        )}
        {/* --- END OF FIXED FORM BLOCK --- */}

        {/* --- REPLACED COMMENTS LIST BLOCK --- */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {comments.map((c) => {
            // Check if the logged-in user is the author
            const isCommentOwner =
              user && c.author && currentUserId === c.author._id;
            // Check if this specific comment is being edited
            const isEditing = editingCommentId === c._id;

            return (
              <div
                key={c._id}
                style={{
                  border: "1px solid #eee",
                  padding: 10,
                  borderRadius: 5,
                }}
              >
                {/* --- NEW CONDITIONAL EDITING BLOCK --- */}
                {isEditing ? (
                  // --- SHOW TEXTAREA IF EDITING ---
                  <div>
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      style={{
                        width: "100%",
                        minHeight: "60px",
                        boxSizing: "border-box",
                      }}
                    />
                    <div
                      style={{ display: "flex", gap: "8px", marginTop: "5px" }}
                    >
                      <button onClick={() => handleUpdateComment(c._id)}>
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCommentId(null)}
                        style={{ background: "#eee", color: "#333" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // --- SHOW TEXT IF NOT EDITING ---
                  <p>{c.body}</p>
                )}
                {/* --- END OF CONDITIONAL BLOCK --- */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: isEditing ? "0" : "5px",
                  }}
                >
                  <small>
                    By:{" "}
                    <strong>
                      {c.anonymous ? "Anonymous" : c.author?.name || "Unknown"}
                    </strong>{" "}
                    • {formatDate(c.createdAt)}
                  </small>

                  {isCommentOwner &&
                    !isEditing && ( // Only show if owner AND not currently editing
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => {
                            setEditingCommentId(c._id); // Set this comment to editing mode
                            setEditingText(c.body); // Pre-fill textarea with current text
                          }}
                          style={{
                            fontSize: "0.8em",
                            background: "#eee",
                            color: "#333",
                            border: "none",
                            padding: "2px 5px",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(c._id)}
                          style={{
                            fontSize: "0.8em",
                            background: "#ffcccc",
                            color: "red",
                            border: "none",
                            padding: "2px 5px",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                </div>
              </div>
            );
          })}
          {comments.length === 0 && <p>Be the first to comment.</p>}
        </div>
        {/* --- END OF REPLACED BLOCK --- */}
      </section>
    </div>
  );
}

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

  // Comment editing state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // Reply form state
  const [replyingToId, setReplyingToId] = useState(null); // Which comment ID we are replying to
  const [replyBody, setReplyBody] = useState("");
  const [replyAnon, setReplyAnon] = useState(false);

  // Reply editing state
  const [editingReplyId, setEditingReplyId] = useState(null); // Which reply ID we are editing
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

  // --- Handlers for Reports ---
  const handleLike = async () => {
    if (!user) return alert("Please log in to like");
    const res = await api(`/api/reports/${id}/like`, { method: "PUT" });
    if (res.likes !== undefined) {
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

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this report? This cannot be undone."
      )
    ) {
      return;
    }
    try {
      const res = await api(`/api/reports/${id}`, { method: "DELETE" });
      if (res.message === "Report deleted") {
        alert("Report deleted successfully.");
        nav("/"); // Navigate to home
      } else {
        alert(res.message || "Failed to delete report.");
      }
    } catch (err) {
      alert("An error occurred while deleting.");
    }
  };

  // --- Handlers for Comments ---
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in to comment");
    if (!commentBody.trim()) return;
    try {
      const res = await api(`/api/reports/${id}/comments`, {
        method: "POST",
        body: { body: commentBody, anonymous: commentAnon },
      });
      if (res._id) {
        let newComment = { ...res };
        newComment.author = { _id: user.id, name: user.name || "You" };
        newComment.replies = []; // Initialize replies array
        setComments([newComment, ...comments]); // This adds to the beginning
        setCommentBody("");
        setCommentAnon(false);
      } else {
        alert(res.message || "Failed to post comment");
      }
    } catch (err) {
      alert("An error occurred.");
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingText.trim()) return;
    try {
      const res = await api(`/api/reports/${id}/comments/${commentId}`, {
        method: "PUT",
        body: { body: editingText },
      });
      if (res._id) {
        // 'res' is the updated comment, but its 'replies' are not populated.
        // We must merge 'res' with the *old* replies from the state.
        setComments(
          comments.map((c) =>
            c._id === commentId
              ? { ...res, replies: c.replies } // <-- Preserves replies
              : c
          )
        );
        setEditingCommentId(null);
        setEditingText("");
      } else {
        alert(res.message || "Failed to update comment");
      }
    } catch (err) {
      alert("An error occurred.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;
    try {
      const res = await api(`/api/reports/${id}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (res.message === "Comment deleted") {
        setComments(comments.filter((c) => c._id !== commentId));
      } else {
        alert(res.message || "Failed to delete comment.");
      }
    } catch (err) {
      alert("An error occurred.");
    }
  };

  // --- Handlers for Replies ---
  const handleReplySubmit = async (commentId) => {
    if (!replyBody.trim()) return;
    try {
      const res = await api(
        `/api/reports/${id}/comments/${commentId}/replies`,
        {
          method: "POST",
          body: { body: replyBody, anonymous: replyAnon },
        }
      );

      if (res._id) {
        // 'res' is the new reply. We must "fake" its author object
        let newReply = { ...res };
        newReply.author = {
          _id: user.id,
          name: user.name || "You",
        };

        // Find the parent comment and add the new, fixed reply
        setComments(
          comments.map((c) =>
            c._id === commentId
              ? { ...c, replies: [...(c.replies || []), newReply] }
              : c
          )
        );
        setReplyingToId(null);
        setReplyBody("");
        setReplyAnon(false);
      } else {
        alert(res.message || "Failed to post reply");
      }
    } catch (err) {
      alert("An error occurred.");
    }
  };

  const handleUpdateReply = async (commentId, replyId) => {
    if (!editingReplyText.trim()) return;
    try {
      const res = await api(
        `/api/reports/${id}/comments/${commentId}/replies/${replyId}`,
        {
          method: "PUT",
          body: { body: editingReplyText },
        }
      );

      if (res._id) {
        // 'res' is the updated reply, but its author is just an ID.
        // We must "fake" the author object for the UI.
        let updatedReply = { ...res };
        updatedReply.author = {
          _id: user.id,
          name: user.name || "You",
        };

        setComments(
          comments.map((c) =>
            c._id === commentId
              ? {
                  ...c,
                  replies: c.replies.map(
                    (r) => (r._id === replyId ? updatedReply : r) // Use the fixed 'updatedReply'
                  ),
                }
              : c
          )
        );
        setEditingReplyId(null);
        setEditingReplyText("");
      } else {
        alert(res.message || "Failed to update reply");
      }
    } catch (err) {
      alert("An error occurred.");
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;
    try {
      const res = await api(
        `/api/reports/${id}/comments/${commentId}/replies/${replyId}`,
        {
          method: "DELETE",
        }
      );

      if (res.message === "Reply deleted") {
        setComments(
          comments.map((c) =>
            c._id === commentId
              ? { ...c, replies: c.replies.filter((r) => r._id !== replyId) }
              : c
          )
        );
      } else {
        alert(res.message || "Failed to delete reply");
      }
    } catch (err) {
      alert("An error occurred.");
    }
  };

  // --- Render ---
  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!report) return <div>Report not found.</div>;

  const base = import.meta.env.VITE_API_BASE || "http://localhost:5000";
  const isOwner = user && report.author && user.id === report.author._id;

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

        {/* Actions: Like & Flag */}
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

          {isOwner && (
            <>
              <div style={{ flexGrow: 1 }} />
              <button
                onClick={() => nav(`/edit/${id}`)}
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
      </article>

      {/* Comments Section */}
      <section style={{ marginTop: 20 }}>
        <h3>Comments ({comments.length})</h3>

        {/* New Comment Form */}
        {user ? (
          <form
            onSubmit={handleCommentSubmit}
            style={{
              margin: "20px 0",
              background: "#f9f9f9",
              padding: "15px",
              borderRadius: "8px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {/* Comment Textarea */}
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Share your advice or thoughts..."
              style={{
                width: "100%",
                minHeight: "80px",
                boxSizing: "border-box",
                borderRadius: "6px",
                border: "1px solid #ccc",
                padding: "10px",
                fontSize: "14px",
                resize: "vertical",
                outline: "none",
              }}
            />

            {/* Checkbox aligned properly */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#333",
                }}
              >
                <input
                  type="checkbox"
                  checked={commentAnon}
                  onChange={(e) => setCommentAnon(e.target.checked)}
                />
                <span>Post anonymously</span>
              </label>

              {/* Submit button on the right */}
              <button
                type="submit"
                style={{
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "0.3s",
                }}
                onMouseOver={(e) => (e.target.style.background = "#0056b3")}
                onMouseOut={(e) => (e.target.style.background = "#007bff")}
              >
                Post Comment
              </button>
            </div>
          </form>
        ) : (
          <p>
            Please <button onClick={() => nav("/login")}>log in</button> to
            comment.
          </p>
        )}

        {/* Comments List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          {comments.map((c) => {
            const isCommentOwner = user && c.author && user.id === c.author._id;
            const isEditingComment = editingCommentId === c._id;
            const isReplying = replyingToId === c._id;

            return (
              <div
                key={c._id}
                style={{
                  border: "1px solid #eee",
                  padding: "10px 15px",
                  borderRadius: 5,
                }}
              >
                {isEditingComment ? (
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
                  <p>{c.body}</p>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "5px",
                  }}
                >
                  <small>
                    By:{" "}
                    <strong>
                      {c.anonymous ? "Anonymous" : c.author?.name || "Unknown"}
                    </strong>{" "}
                    • {formatDate(c.createdAt)}
                  </small>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {user && !isEditingComment && (
                      <button
                        onClick={() =>
                          setReplyingToId(isReplying ? null : c._id)
                        }
                        style={{
                          fontSize: "0.8em",
                          background: "#e0e0e0",
                          color: "#333",
                          border: "none",
                          padding: "2px 5px",
                          cursor: "pointer",
                        }}
                      >
                        {isReplying ? "Cancel" : "Reply"}
                      </button>
                    )}
                    {isCommentOwner && !isEditingComment && (
                      <>
                        <button
                          onClick={() => {
                            setEditingCommentId(c._id);
                            setEditingText(c.body);
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
                      </>
                    )}
                  </div>
                </div>

                {isReplying && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleReplySubmit(c._id);
                    }}
                    style={{
                      margin: "10px 0 0 20px",
                      background: "#fdfdfd",
                      padding: "10px",
                      border: "1px solid #f0f0f0",
                      borderRadius: "5px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {/* Reply Textarea */}
                    <textarea
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder="Write a reply..."
                      style={{
                        width: "100%",
                        minHeight: "50px",
                        boxSizing: "border-box",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        padding: "8px",
                        fontSize: "14px",
                        resize: "vertical",
                        outline: "none",
                      }}
                    />

                    {/* Checkbox + Button Row */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          cursor: "pointer",
                          fontSize: "14px",
                          color: "#333",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={replyAnon}
                          onChange={(e) => setReplyAnon(e.target.checked)}
                        />
                        <span>Post anonymously</span>
                      </label>

                      <button
                        type="submit"
                        style={{
                          background: "#007bff",
                          color: "#fff",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "600",
                          transition: "0.3s",
                        }}
                        onMouseOver={(e) =>
                          (e.target.style.background = "#0056b3")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.background = "#007bff")
                        }
                      >
                        Post Reply
                      </button>
                    </div>
                  </form>
                )}

                {/* Replies List */}
                {c.replies && c.replies.length > 0 && (
                  <div
                    style={{
                      marginTop: "15px",
                      marginLeft: "20px",
                      borderLeft: "2px solid #e0e0e0",
                      paddingLeft: "10px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {c.replies.map((reply) => {
                      const isReplyOwner =
                        user && reply.author && user.id === reply.author._id;
                      const isEditingReply = editingReplyId === reply._id;

                      return (
                        <div key={reply._id}>
                          {isEditingReply ? (
                            <div>
                              <textarea
                                value={editingReplyText}
                                onChange={(e) =>
                                  setEditingReplyText(e.target.value)
                                }
                                style={{
                                  width: "100%",
                                  minHeight: "50px",
                                  boxSizing: "border-box",
                                }}
                              />
                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  marginTop: "5px",
                                }}
                              >
                                <button
                                  onClick={() =>
                                    handleUpdateReply(c._id, reply._id)
                                  }
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingReplyId(null)}
                                  style={{ background: "#eee", color: "#333" }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p style={{ margin: 0 }}>{reply.body}</p>
                          )}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginTop: "5px",
                            }}
                          >
                            <small>
                              By:{" "}
                              <strong>
                                {reply.anonymous
                                  ? "Anonymous"
                                  : reply.author?.name || "Unknown"}
                              </strong>{" "}
                              • {formatDate(reply.createdAt)}
                            </small>
                            {isReplyOwner && !isEditingReply && (
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                  onClick={() => {
                                    setEditingReplyId(reply._id);
                                    setEditingReplyText(reply.body);
                                  }}
                                  style={{
                                    fontSize: "0.75em",
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
                                  onClick={() =>
                                    handleDeleteReply(c._id, reply._id)
                                  }
                                  style={{
                                    fontSize: "0.75em",
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
                  </div>
                )}
              </div>
            );
          })}
          {comments.length === 0 && <p>Be a hero! Be the first to comment.</p>}
        </div>
      </section>
    </div>
  );
}

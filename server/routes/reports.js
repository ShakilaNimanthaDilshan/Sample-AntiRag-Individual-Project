const express = require("express");
const multer = require("multer");
const path = require("path");
const Report = require("../models/Report");
const University = require("../models/University");
const Comment = require("../models/Comment"); // Added from snippet 1
const auth = require("../middleware/auth");

const router = express.Router();

// ========================
// 📦 Multer setup for uploads
// ========================
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "..", "uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const mimetype = allowed.test(file.mimetype);
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && ext) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  },
});

// ========================
// 📌 Create a new report
// POST /api/reports/
// ========================
// Create a new report (with optional media files)
router.post("/", auth, upload.array("media", 5), async (req, res) => {
  try {
    let { title, body, universityId, anonymous, otherUniversityName } =
      req.body;
    let finalUniversityId;

    if (universityId === "OTHER") {
      if (!otherUniversityName) {
        return res
          .status(400)
          .json({ message: "Please provide a name for the university." });
      }

      const cleanName = otherUniversityName.trim().toLowerCase();

      // Check if this university already exists (regardless of status)
      let existingUni = await University.findOne({ name: cleanName });

      if (existingUni) {
        // It exists, just use its ID.
        finalUniversityId = existingUni._id;
      } else {
        // It's a brand new university, create it as 'pending'
        const newUni = new University({
          name: cleanName,
          location: "",
          status: "pending", // <-- SET AS PENDING
        });
        await newUni.save();
        finalUniversityId = newUni._id;
      }
    } else {
      finalUniversityId = universityId;
    }

    // --- The rest of the function is the same ---

    if (!body || !finalUniversityId) {
      return res
        .status(400)
        .json({ message: "Body and university are required" });
    }

    const uni = await University.findById(finalUniversityId);
    if (!uni) return res.status(400).json({ message: "Invalid university" });

    const base = process.env.SERVER_BASE || "http://localhost:5000";
    const media = (req.files || []).map((f) => ({
      url: `${base}/uploads/${f.filename}`,
      type: f.mimetype.startsWith("image/") ? "image" : "file",
    }));

    const report = new Report({
      title,
      body,
      university: finalUniversityId,
      author: anonymous ? null : req.user.id,
      anonymous: !!anonymous,
      media,
    });

    await report.save();
    const io = req.app.get("socketio");
    io.emit("analytics_updated"); // This sends the signal
    res.status(201).json({ message: "Report created successfully", report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ========================
// 📌 Get all reports (or search reports)
// GET /api/reports/
// ========================
router.get('/', async (req, res) => {
  try {
    const { q } = req.query; // Get search query from URL (e.g., /api/reports?q=test)

    let reports;

    if (q) {
      // --- IF THERE IS A SEARCH QUERY ---
      reports = await Report.find(
        { $text: { $search: q } }, // 1. Use the text index to find matches
        { score: { $meta: 'textScore' } } // 2. Get the "relevance score"
      )
      .populate('university', 'name')
      .populate('author', 'name')
      .sort({ score: { $meta: 'textScore' } }); // 3. Sort by relevance (best match first)

    } else {
      // --- IF THERE IS NO SEARCH (Original Logic) ---
      reports = await Report.find()
        .populate('university', 'name')
        .populate('author', 'name')
        .sort({ createdAt: -1 }); // Sort by newest first
    }

    // Sanitize anonymous posts (this logic is the same)
    const sanitized = reports.map(r => {
      const obj = r.toObject();
      if (obj.anonymous) obj.author = null;
      return obj;
    });

    res.json(sanitized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ========================
// 📌 GET a single report by its ID
// GET /api/reports/:id
// ========================
router.get("/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("university", "name _id") // <-- Add _id
      .populate("author", "name _id"); // <-- Add _id

    if (!report) return res.status(404).json({ message: "Report not found" });

    // Sanitize if anonymous
    const sanitized = report.toObject();
    if (sanitized.anonymous) sanitized.author = null;

    // Add like count
    sanitized.likeCount = sanitized.likes.length;
    // Don't send the full list of likes/flags to the client
    delete sanitized.likes;

    res.json(sanitized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ========================
// ✏️ Update a report (only by owner)
// PUT /api/reports/:id
// ========================
router.put("/:id", auth, upload.array("media", 5), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Check if author exists before checking ownership
    if (!report.author) {
       return res.status(403).json({ message: "Cannot update an anonymous report" });
    }
    
    if (report.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only update your own reports" });
    }

    let { title, body, anonymous } = req.body;
    anonymous = anonymous === "true" || anonymous === true;

    // If new files uploaded, replace media
    let media = report.media;
    if (req.files && req.files.length > 0) {
      const base =
        process.env.SERVER_BASE || `${req.protocol}://${req.get("host")}`;
      media = req.files.map((f) => ({
        url: `${base}/uploads/${f.filename}`,
        type: f.mimetype.startsWith("image/") ? "image" : "file",
      }));
    }

    report.title = title || report.title;
    report.body = body || report.body;
    report.anonymous = anonymous ?? report.anonymous;
    report.media = media;

    await report.save();
    res.json({ message: "Report updated successfully", report });
  } catch (err) {
    console.error("Report update error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ========================
// 🗑️ Delete a report (only by owner and admin)
// DELETE /api/reports/:id
// ========================
router.delete("/:id", auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // --- PERMISSION CHECK ---
    // Handle anonymous reports (no author)
    const isOwner = report.author ? report.author.toString() === req.user.id : false;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      // If the user is NOT the owner AND NOT an admin, deny access.
      return res.status(403).json({ message: "User not authorized" });
    }
    
    // Optional: Delete all comments associated with the report
    await Comment.deleteMany({ report: req.params.id });

    await report.deleteOne();
    res.json({ message: "Report deleted successfully" }); // Changed message
  } catch (err) {
    console.error("Report deletion error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ========================
// --- REACTIONS (Like / Flag) ---
// ========================

// Toggle LIKE on a report
// PUT /api/reports/:id/like
router.put("/:id/like", auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Check if user already liked it
    const likedIndex = report.likes.indexOf(req.user.id);

    if (likedIndex > -1) {
      // User already liked, so UNLIKE
      report.likes.splice(likedIndex, 1);
    } else {
      // User has not liked, so LIKE
      report.likes.push(req.user.id);
    }

    await report.save();
    res.json({ likes: report.likes.length, userHasLiked: likedIndex === -1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// FLAG a report
// PUT /api/reports/:id/flag
router.put("/:id/flag", auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Check if user already flagged it
    if (report.flags.includes(req.user.id)) {
      return res
        .status(400)
        .json({ message: "You have already flagged this report" });
    }

    report.flags.push(req.user.id);
    await report.save();

    // In a real app, you might email an admin here
    res.json({
      message: "Report flagged for review",
      flags: report.flags.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ========================
// --- COMMENTS ---
// ========================

// POST a new comment on a report
// POST /api/reports/:id/comments
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { body, anonymous } = req.body;
    if (!body)
      return res.status(400).json({ message: "Comment body is required" });

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    const newComment = new Comment({
      body,
      report: req.params.id,
      author: req.user.id, // <-- ALWAYS save the author's ID
      anonymous: !!anonymous, // This flag will hide the name
    });

    await newComment.save();
    
    // Populate the author info before sending back
    await newComment.populate('author', 'name _id');
    
    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all comments for a report
// GET /api/reports/:id/comments
router.get("/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ report: req.params.id })
      .populate("author", "name _id")
      .populate("replies.author", "name _id")
      .sort({ createdAt: -1 }); // Switched to newest first

    // Sanitize anonymous comments and replies
    const sanitizedComments = comments.map(c => {
        const commentObj = c.toObject();
        if (commentObj.anonymous) {
            commentObj.author = null;
        }
        
        commentObj.replies = commentObj.replies.map(r => {
            if (r.anonymous) {
                r.author = null;
            }
            return r;
        });
        
        return commentObj;
    });

    res.json(sanitizedComments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- UPDATE A COMMENT ---
// PUT /api/reports/:id/comments/:commentId
router.put("/:id/comments/:commentId", auth, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ message: "Body is required" });

    let comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // --- PERMISSION CHECK ---
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "User not authorized" });
    }

    // Update comment
    comment.body = body;
    await comment.save();

    // Re-populate author and replies.author for a consistent response
    await comment.populate("author", "name _id");
    await comment.populate("replies.author", "name _id");
    
    // Sanitize anonymous
    const commentObj = comment.toObject();
    if (commentObj.anonymous) commentObj.author = null;
    commentObj.replies = commentObj.replies.map(r => {
      if (r.anonymous) r.author = null;
      return r;
    });

    res.json(commentObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- DELETE A COMMENT ---
// DELETE /api/reports/:id/comments/:commentId
router.delete("/:id/comments/:commentId", auth, async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // --- PERMISSION CHECK ---
    const isOwner = comment.author.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "User not authorized" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- CREATE A REPLY ---
// POST /api/reports/:id/comments/:commentId/replies
router.post("/:id/comments/:commentId/replies", auth, async (req, res) => {
  try {
    const { body, anonymous } = req.body;
    if (!body)
      return res.status(400).json({ message: "Reply body is required" });

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const newReply = {
      body,
      author: req.user.id, // Always save the author
      anonymous: !!anonymous,
    };

    comment.replies.push(newReply);
    await comment.save();

    // Find the newly created reply
    let savedReply = comment.replies[comment.replies.length - 1].toObject();
    
    // Populate its author manually (since it's a sub-doc)
    const author = await User.findById(req.user.id).select('name _id');
    savedReply.author = author;

    // Sanitize if anonymous
    if (savedReply.anonymous) {
      savedReply.author = null;
    }

    res.status(201).json(savedReply); // Return the new reply
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- UPDATE A REPLY ---
// PUT /api/reports/:id/comments/:commentId/replies/:replyId
router.put(
  "/:id/comments/:commentId/replies/:replyId",
  auth,
  async (req, res) => {
    try {
      const { body } = req.body;
      if (!body) return res.status(400).json({ message: "Body is required" });

      const comment = await Comment.findById(req.params.commentId);
      if (!comment)
        return res.status(404).json({ message: "Comment not found" });

      const reply = comment.replies.id(req.params.replyId);
      if (!reply) return res.status(404).json({ message: "Reply not found" });

      if (reply.author.toString() !== req.user.id) {
        return res.status(403).json({ message: "User not authorized" });
      }

      reply.body = body;
      await comment.save();
      
      // Manually populate author for response
      const author = await User.findById(reply.author).select('name _id');
      const replyObj = reply.toObject();
      replyObj.author = author;
      
      // Sanitize
      if (replyObj.anonymous) replyObj.author = null;

      res.json(replyObj);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// --- DELETE A REPLY ---
// DELETE /api/reports/:id/comments/:commentId/replies/:replyId
router.delete(
  "/:id/comments/:commentId/replies/:replyId",
  auth,
  async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.commentId);
      if (!comment)
        return res.status(404).json({ message: "Comment not found" });

      const reply = comment.replies.id(req.params.replyId);
      if (!reply) return res.status(404).json({ message: "Reply not found" });

      // --- PERMISSION CHECK ---
      const isOwner = reply.author.toString() === req.user.id;
      const isAdmin = req.user.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "User not authorized" });
      }

      // Mongoose 8+
      comment.replies.pull({ _id: req.params.replyId });
      // Older Mongoose: reply.remove();

      await comment.save();
      res.json({ message: "Reply deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
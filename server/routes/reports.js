const express = require("express");
const multer = require("multer");
const path = require("path");
const Report = require("../models/Report");
const University = require("../models/University");
const Comment = require("../models/Comment");
const User = require("../models/User");
const auth = require("../middleware/auth");
const getAuthUser = require("../middleware/getAuthUser");

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
router.post("/", auth, upload.array("media", 5), async (req, res) => {
  try {
    let { title, body, universityId, anonymous, otherUniversityName, isPublic } = req.body;
    let finalUniversityId;

    if (universityId === "OTHER") {
      if (!otherUniversityName) {
        return res
          .status(400)
          .json({ message: "Please provide a name for the university." });
      }
      const cleanName = otherUniversityName.trim().toLowerCase();
      let existingUni = await University.findOne({ name: cleanName });

      if (existingUni) {
        finalUniversityId = existingUni._id;
      } else {
        const newUni = new University({
          name: cleanName,
          location: "",
          status: "pending",
        });
        await newUni.save();
        finalUniversityId = newUni._id;
      }
    } else {
      finalUniversityId = universityId;
    }

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
      // --- FIXED: Always save the author ID, even if anonymous ---
      author: req.user.id,
      anonymous: !!anonymous,
      media,
      isPublic: !!isPublic
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
// 📌 Get Moderation Queue (Private Reports)
// GET /api/reports/moderation
// ========================
router.get('/moderation', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let query = {};
    if (user.role === 'admin') {
      query = { isPublic: false };
    } else if (user.role === 'moderator') {
      query = { isPublic: false, university: user.university };
    } else {
      query = { isPublic: false, author: user._id };
    }

    const reports = await Report.find(query)
      .populate('university', 'name')
      // --- FIXED: Added missing fields ---
      .populate('author', 'name _id isStudent profession')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========================
// 📌 Get all reports (or search reports)
// GET /api/reports/
// ========================
router.get('/', async (req, res) => {
  try {
    const { q } = req.query; 
    let reports;

    if (q) {
      reports = await Report.find(
        { $text: { $search: q }, isPublic: true },
        { score: { $meta: 'textScore' } }
      )
      .populate('university', 'name')
      // --- FIXED: Added _id ---
      .populate('author', 'name _id isStudent profession')
      .sort({ score: { $meta: 'textScore' } });
    } else {
      reports = await Report.find({ isPublic: true })
        .populate('university', 'name')
        // --- FIXED: This was the main bug ---
        .populate('author', 'name _id isStudent profession')
        .sort({ createdAt: -1 });
    }

    // Sanitize anonymous posts
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
router.get("/:id", getAuthUser, async (req, res) => { // <-- USE getAuthUser
  try {
    const report = await Report.findById(req.params.id)
      .populate("university", "name _id") 
      .populate("author", "name _id isStudent profession"); 

    if (!report) return res.status(404).json({ message: "Report not found" });

    // --- NEW PERMISSION CHECK ---
    let isOwner = false;
    let isAdmin = false;
    let isModerator = false;

    if (req.user) { // Check if a user is logged in
      const user = await User.findById(req.user.id);
      if (user) {
        isOwner = report.author && report.author._id.equals(user._id);
        isAdmin = user.role === 'admin';
        isModerator = user.role === 'moderator' && user.university && user.university.equals(report.university._id);
      }
    }

    // If the report is NOT public, AND the user is NOT logged in, OR is not the owner/admin/mod...
    if (!report.isPublic && !isOwner && !isAdmin && !isModerator) {
      return res.status(403).json({ message: "You do not have permission to view this report" });
    }
    // --- END PERMISSION CHECK ---

    const sanitized = report.toObject();
    if (sanitized.anonymous) sanitized.author = null;
    sanitized.likeCount = sanitized.likes.length;
    delete sanitized.likes;

    res.json(sanitized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ========================
// ✏️ Update a report
// PUT /api/reports/:id
// ========================
router.put("/:id", auth, upload.array("media", 5), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    const isOwner = report.author ? report.author.toString() === req.user.id : false;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "User not authorized" });
    }

    let { title, body, anonymous } = req.body;
    anonymous = anonymous === "true" || anonymous === true;

    let media = report.media;
    if (req.files && req.files.length > 0) {
      const base = process.env.SERVER_BASE || "http://localhost:5000";
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
// 🗑️ Delete a report
// DELETE /api/reports/:id
// ========================
router.delete("/:id", auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    const isOwner = report.author ? report.author.toString() === req.user.id : false;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "User not authorized" });
    }
    
    await Comment.deleteMany({ report: req.params.id });
    await report.deleteOne();
    res.json({ message: "Report deleted" });
  } catch (err) {
    console.error("Report deletion error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ========================
// --- REACTIONS (Like / Flag) ---
// ========================

// Toggle LIKE on a report
router.put("/:id/like", auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    const likedIndex = report.likes.indexOf(req.user.id);
    if (likedIndex > -1) {
      report.likes.splice(likedIndex, 1);
    } else {
      report.likes.push(req.user.id);
    }
    await report.save();
    res.json({ likes: report.likes.length, userHasLiked: likedIndex === -1 });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// FLAG a report
router.put("/:id/flag", auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (report.flags.includes(req.user.id)) {
      return res
        .status(400)
        .json({ message: "You have already flagged this report" });
    }
    report.flags.push(req.user.id);
    await report.save();
    res.json({
      message: "Report flagged for review",
      flags: report.flags.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ========================
// --- COMMENTS ---
// ========================

// POST a new comment on a report
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
      author: req.user.id,
      anonymous: !!anonymous,
    });
    await newComment.save();
    // --- FIXED: Added missing fields ---
    await newComment.populate('author', 'name _id isStudent profession');
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET all comments for a report
router.get("/:id/comments", async (req, res) => {
  try {
    // --- FIXED: Added missing fields ---
    const comments = await Comment.find({ report: req.params.id })
      .populate("author", "name _id isStudent profession")
      .populate("replies.author", "name _id isStudent profession")
      .sort({ createdAt: -1 });

    // --- FIXED: Removed bad sanitization ---
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- UPDATE A COMMENT ---
router.put("/:id/comments/:commentId", auth, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ message: "Body is required" });

    let comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isOwner = comment.author.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "User not authorized" });
    }

    comment.body = body;
    await comment.save();

    // --- FIXED: Added missing fields ---
    await comment.populate("author", "name _id isStudent profession");
    await comment.populate("replies.author", "name _id isStudent profession");
    
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// --- DELETE A COMMENT ---
router.delete("/:id/comments/:commentId", auth, async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isOwner = comment.author.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "User not authorized" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ========================
// --- REPLIES ---
// ========================

// --- CREATE A REPLY ---
router.post("/:id/comments/:commentId/replies", auth, async (req, res) => {
  try {
    const { body, anonymous } = req.body;
    if (!body)
      return res.status(400).json({ message: "Reply body is required" });

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const newReply = {
      body,
      author: req.user.id,
      anonymous: !!anonymous,
    };
    comment.replies.push(newReply);
    await comment.save();
    
    const savedReply = comment.replies[comment.replies.length - 1];
    res.status(201).json(savedReply);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// --- UPDATE A REPLY ---
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
      
      const isOwner = reply.author.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "User not authorized" });
      }

      reply.body = body;
      await comment.save();
      
      res.json(reply);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// --- DELETE A REPLY ---
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

      const isOwner = reply.author.toString() === req.user.id;
      const isAdmin = req.user.role === "admin";
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "User not authorized" });
      }

      comment.replies.pull({ _id: req.params.replyId });
      await comment.save();
      res.json({ message: "Reply deleted" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
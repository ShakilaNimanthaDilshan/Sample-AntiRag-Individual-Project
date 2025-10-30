const express = require('express');
const multer = require('multer');
const path = require('path');
const Report = require('../models/Report');
const University = require('../models/University');
const Comment = require('../models/Comment'); // Added from snippet 1
const auth = require('../middleware/auth');

const router = express.Router();

// ========================
// 📦 Multer setup for uploads
// ========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
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
    cb(new Error('Only image files are allowed'));
  },
});

// ========================
// 📌 Create a new report
// POST /api/reports/
// ========================
router.post('/', auth, upload.array('media', 5), async (req, res) => {
  try {
    let { title, body, universityId, anonymous } = req.body;

    // 🧠 Convert "anonymous" from string to boolean properly
    anonymous = anonymous === 'true' || anonymous === true;

    if (!body || !universityId) {
      return res.status(400).json({ message: 'Body and universityId are required' });
    }

    // Verify university
    const uni = await University.findById(universityId);
    if (!uni) {
      return res.status(400).json({ message: 'Invalid university' });
    }

    // Build absolute URLs for uploaded files
    const base = process.env.SERVER_BASE || `${req.protocol}://${req.get('host')}`;
    const media = (req.files || []).map(f => ({
      url: `${base}/uploads/${f.filename}`,
      type: f.mimetype.startsWith('image/') ? 'image' : 'file',
    }));

    const report = new Report({
      title,
      body,
      university: universityId,
      author: anonymous ? null : req.user.id,
      anonymous,
      media,
    });

    await report.save();
    res.status(201).json({ message: 'Report created successfully', report });
  } catch (err) {
    console.error('Report creation error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ========================
// 📌 Get all reports
// GET /api/reports/
// ========================
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('university', 'name')
      .populate('author', 'name role')
      .sort({ createdAt: -1 });

    // Sanitize anonymous reports
    const sanitized = reports.map(r => {
      const obj = r.toObject();
      if (obj.anonymous) obj.author = null;
      return obj;
    });

    res.json(sanitized);
  } catch (err) {
    console.error('Fetch reports error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========================
// 📌 GET a single report by its ID
// GET /api/reports/:id
// ========================
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('university', 'name')
      .populate('author', 'name');
      
    if (!report) return res.status(404).json({ message: 'Report not found' });

    // Sanitize if anonymous
    const sanitized = report.toObject();
    if (sanitized.anonymous) sanitized.author = null;
    
    // Add like count
    sanitized.likeCount = sanitized.likes.length;
    // Don't send the full list of likes/flags to the client
    delete sanitized.likes;
    delete sanitized.flags;

    res.json(sanitized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========================
// ✏️ Update a report (only by owner)
// PUT /api/reports/:id
// ========================
router.put('/:id', auth, upload.array('media', 5), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (report.author?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own reports' });
    }

    let { title, body, anonymous } = req.body;
    anonymous = anonymous === 'true' || anonymous === true;

    // If new files uploaded, replace media
    let media = report.media;
    if (req.files && req.files.length > 0) {
      const base = process.env.SERVER_BASE || `${req.protocol}://${req.get('host')}`;
      media = req.files.map(f => ({
        url: `${base}/uploads/${f.filename}`,
        type: f.mimetype.startsWith('image/') ? 'image' : 'file',
      }));
    }

    report.title = title || report.title;
    report.body = body || report.body;
    report.anonymous = anonymous ?? report.anonymous;
    report.media = media;

    await report.save();
    res.json({ message: 'Report updated successfully', report });
  } catch (err) {
    console.error('Report update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ========================
// 🗑️ Delete a report (only by owner)
// DELETE /api/reports/:id
// ========================
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (report.author?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own reports' });
    }

    await report.deleteOne();
    // TODO: Also delete associated comments?
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Report deletion error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ========================
// --- REACTIONS (Like / Flag) ---
// ========================

// Toggle LIKE on a report
// PUT /api/reports/:id/like
router.put('/:id/like', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

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
    res.status(500).json({ message: 'Server error' });
  }
});

// FLAG a report
// PUT /api/reports/:id/flag
router.put('/:id/flag', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    // Check if user already flagged it
    if (report.flags.includes(req.user.id)) {
      return res.status(400).json({ message: 'You have already flagged this report' });
    }

    report.flags.push(req.user.id);
    await report.save();
    
    // In a real app, you might email an admin here
    res.json({ message: 'Report flagged for review', flags: report.flags.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========================
// --- COMMENTS ---
// ========================

// POST a new comment on a report
// POST /api/reports/:id/comments
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { body, anonymous } = req.body;
    if (!body) return res.status(400).json({ message: 'Comment body is required' });

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const newComment = new Comment({
      body,
      report: req.params.id,
      author: anonymous ? null : req.user.id,
      anonymous: !!anonymous
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all comments for a report
// GET /api/reports/:id/comments
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ report: req.params.id })
      .populate('author', 'name')
      .sort({ createdAt: 1 }); // Show oldest first

    // Sanitize anonymous comments
    const sanitized = comments.map(c => {
      const obj = c.toObject();
      if (obj.anonymous) obj.author = null;
      return obj;
    });

    res.json(sanitized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
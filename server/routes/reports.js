const express = require('express');
const multer = require('multer');
const path = require('path');
const Report = require('../models/Report');
const University = require('../models/University');
const User = require('../models/User');
const auth = require('../middleware/auth'); // JWT middleware

const router = express.Router();

// ========================
// 📦 Multer setup for media uploads
// ========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, name);
  }
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
  }
});

// ========================
// 📌 Create a new report (requires login)
// ========================
router.post('/', auth, upload.array('media', 5), async (req, res) => {
  try {
    const { title, body, universityId, anonymous } = req.body;

    // Validation
    if (!body || !universityId)
      return res.status(400).json({ message: 'Body and universityId required' });

    // Verify university
    const uni = await University.findById(universityId);
    if (!uni)
      return res.status(400).json({ message: 'Invalid university' });

    // ✅ Build absolute URLs for uploaded media
    const base = process.env.SERVER_BASE || `${req.protocol}://${req.get('host')}`;
    const media = (req.files || []).map(f => ({
      url: `${base}/uploads/${f.filename}`,
      type: f.mimetype.startsWith('image/') ? 'image' : 'file'
    }));

    // Create new report
    const report = new Report({
      title,
      body,
      university: universityId,
      author: anonymous ? null : req.user.id,
      anonymous: !!anonymous,
      media
    });

    await report.save();
    res.status(201).json({ message: 'Report created successfully', report });
  } catch (err) {
    console.error('Report creation error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ========================
// 📌 Get all reports (public)
// ========================
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('university', 'name')
      .populate('author', 'name role')
      .sort({ createdAt: -1 });

    // 🧹 Sanitize anonymous reports
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

module.exports = router;

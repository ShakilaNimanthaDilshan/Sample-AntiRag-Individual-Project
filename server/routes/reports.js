const express = require('express');
const Report = require('../models/Report');
const University = require('../models/University');
const User = require('../models/User');
const auth = require('../middleware/auth'); // middleware for JWT auth
const router = express.Router();


// ========================
// 📌 Create a new report (requires login)
// ========================
router.post('/', auth, async (req, res) => {
  try {
    const { title, body, universityId, anonymous } = req.body;

    // Basic validation
    if (!body || !universityId)
      return res.status(400).json({ message: 'Body and universityId required' });

    // Verify university exists
    const uni = await University.findById(universityId);
    if (!uni)
      return res.status(400).json({ message: 'Invalid university' });

    // Create new report
    const report = new Report({
      title,
      body,
      university: universityId,
      author: anonymous ? null : req.user.id, // from token
      anonymous: !!anonymous
    });

    await report.save();
    res.status(201).json({ message: 'Report created successfully', report });
  } catch (err) {
    console.error('Report creation error:', err);
    res.status(500).json({ message: 'Server error' });
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
      if (obj.anonymous) obj.author = null; // hide author if anonymous
      return obj;
    });

    res.json(sanitized);
  } catch (err) {
    console.error('Fetch reports error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;

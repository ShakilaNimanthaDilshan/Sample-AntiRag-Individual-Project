// server/routes/admin.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const University = require('../models/University');
const Report = require('../models/Report');

// All routes in this file are protected by auth and admin middleware
router.use(auth, admin);

// GET all pending universities
// GET /api/admin/universities/pending
router.get('/universities/pending', async (req, res) => {
  try {
    const pending = await University.find({ status: 'pending' }).sort({ name: 1 });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// APPROVE a university
// PUT /api/admin/universities/approve/:id
router.put('/universities/approve/:id', async (req, res) => {
  try {
    const uni = await University.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'approved' } },
      { new: true }
    );
    if (!uni) return res.status(404).json({ message: 'University not found' });
    res.json(uni);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// MERGE a university
// POST /api/admin/universities/merge
router.post('/universities/merge', async (req, res) => {
  const { badId, goodId } = req.body;
  if (!badId || !goodId) {
    return res.status(400).json({ message: 'Bad ID and Good ID are required' });
  }

  try {
    // 1. Update all reports to point to the good university
    await Report.updateMany(
      { university: badId },
      { $set: { university: goodId } }
    );

    // 2. Delete the bad (duplicate) university
    await University.findByIdAndDelete(badId);

    res.json({ message: 'Merge successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// (Optional) DELETE a spam university
// DELETE /api/admin/universities/:id
router.delete('/universities/:id', async (req, res) => {
  try {
    // Note: This will NOT delete the reports, they will be orphaned.
    // A better version would delete the reports too.
    await University.findByIdAndDelete(req.params.id);
    res.json({ message: 'University deleted (reports remain)' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
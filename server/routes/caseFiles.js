// server/routes/caseFiles.js
const express = require('express');
const router = express.Router();
const CaseFile = require('../models/CaseFile');
const auth = require('../middleware/auth');
const modOrAdmin = require('../middleware/modOrAdmin');

// --- PUBLIC ROUTES ---

// GET all documented case files
// GET /api/case-files
router.get('/', async (req, res) => {
  try {
    const cases = await CaseFile.find()
      .populate('author', 'name')
      .sort({ dateOfIncident: -1 });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- ADDED THIS ROUTE ---
// GET a single case file by ID
// GET /api/case-files/:id
router.get('/:id', async (req, res) => {
  try {
    const caseFile = await CaseFile.findById(req.params.id);
    if (!caseFile) return res.status(404).json({ message: 'Case file not found' });
    res.json(caseFile);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
// --- END OF ADDED ROUTE ---


// --- ADMIN & MODERATOR ROUTES ---

// POST a new case file
// POST /api/case-files
router.post('/', auth, modOrAdmin, async (req, res) => {
  const { title, description, dateOfIncident, sourceUrl, imageUrl } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }
  try {
    const newCase = new CaseFile({
      title,
      description,
      dateOfIncident,
      sourceUrl,
      imageUrl,
      author: req.user.id
    });
    await newCase.save();
    res.status(201).json(newCase);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE a case file
// PUT /api/case-files/:id
router.put('/:id', auth, modOrAdmin, async (req, res) => {
  const { title, description, dateOfIncident, sourceUrl, imageUrl } = req.body;
  try {
    let caseFile = await CaseFile.findById(req.params.id);
    if (!caseFile) return res.status(404).json({ message: 'Case file not found' });

    // Update fields
    caseFile.title = title || caseFile.title;
    caseFile.description = description || caseFile.description;
    caseFile.dateOfIncident = dateOfIncident || caseFile.dateOfIncident;
    caseFile.sourceUrl = sourceUrl;
    caseFile.imageUrl = imageUrl;
    
    await caseFile.save();
    res.json(caseFile);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a case file
// DELETE /api/case-files/:id
router.delete('/:id', auth, modOrAdmin, async (req, res) => {
  try {
    const caseFile = await CaseFile.findById(req.params.id);
    if (!caseFile) return res.status(404).json({ message: 'Case file not found' });

    await caseFile.deleteOne();
    res.json({ message: 'Case file deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
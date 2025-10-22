const express = require('express');
const University = require('../models/University');
const router = express.Router();

// Add a new university
router.post('/', async (req, res) => {
  try {
    const { name, location, contacts } = req.body;
    const uni = new University({ name, location, contacts });
    await uni.save();
    res.status(201).json({ message: 'University added successfully', uni });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all universities
router.get('/', async (req, res) => {
  try {
    const universities = await University.find().sort({ name: 1 });
    res.json(universities);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// server/routes/analytics.js
const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const University = require('../models/University');
const mongoose = require('mongoose');

// --- 1. PIE CHART: Reports by University ---
// GET /api/analytics/reports-by-university
router.get('/reports-by-university', async (req, res) => {
  try {
    const data = await Report.aggregate([
      {
        // Group by the 'university' field
        $group: {
          _id: '$university',
          count: { $sum: 1 }
        }
      },
      {
        // Join with the 'universities' collection to get the name
        $lookup: {
          from: University.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'universityDetails'
        }
      },
      {
        // Un-nest the universityDetails array
        $unwind: '$universityDetails'
      },
      {
        // Only return the name and count
        $project: {
          _id: 0,
          name: '$universityDetails.name',
          count: 1
        }
      },
      {
        // Sort by count descending
        $sort: { count: -1 }
      }
    ]);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- 2. BAR CHART: Reports by Month, for all Universities ---
// GET /api/analytics/reports-by-month
router.get('/reports-by-month', async (req, res) => {
  try {
    const data = await Report.aggregate([
      {
        // Group by both university and month/year
        $group: {
          _id: {
            university: '$university',
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' } // 1 = Jan, 12 = Dec
          },
          count: { $sum: 1 }
        }
      },
      {
        // Get university name
        $lookup: {
          from: University.collection.name,
          localField: '_id.university',
          foreignField: '_id',
          as: 'universityDetails'
        }
      },
      {
        $unwind: '$universityDetails'
      },
      {
        // Format the output
        $project: {
          _id: 0,
          universityId: '$_id.university',
          universityName: '$universityDetails.name',
          year: '$_id.year',
          month: '$_id.month',
          count: 1
        }
      },
      {
        // Sort it
        $sort: {
          universityName: 1,
          year: 1,
          month: 1
        }
      }
    ]);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const University = require('../models/University'); // <-- This import is correct
const router = express.Router();

// ==========================
// 📌 Register Route (Updated)
// ==========================
router.post(
  '/register',
  [
    // We validate the main fields here
    check('name', 'Name is required').notEmpty(),
    check('email', 'Valid email required').isEmail().normalizeEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('city', 'City is required').notEmpty(),
    check('isStudent', 'Student status is required').isBoolean(),
    check('terms', 'You must accept the terms and conditions').equals('true'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { 
        name, email, password, city, isStudent, 
        universityId, otherUniversityName, yearOfStudy, profession 
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // --- New Conditional Logic ---
      let finalUniversityId = null;
      let userProfession = null;
      let userYearOfStudy = null;

      if (isStudent) {
        // --- STUDENT LOGIC ---
        userProfession = null; // Clear profession
        userYearOfStudy = yearOfStudy; // Set year of study
        
        if (universityId === 'OTHER') {
          // 'Other' University Logic (Admin Approval)
          if (!otherUniversityName) {
            return res.status(400).json({ errors: [{ msg: 'Please provide a university name' }] });
          }
          const cleanName = otherUniversityName.trim().toLowerCase();
          let existingUni = await University.findOne({ name: cleanName });
          if (existingUni) {
            finalUniversityId = existingUni._id;
          } else {
            const newUni = new University({ name: cleanName, status: 'pending' });
            await newUni.save();
            finalUniversityId = newUni._id;
          }
        } else if (!universityId) {
          return res.status(400).json({ errors: [{ msg: 'Please select a university' }] });
        } else {
          finalUniversityId = universityId;
        }
      } else {
        // --- NON-STUDENT LOGIC ---
        finalUniversityId = null; // Clear university
        userYearOfStudy = null; // Clear year of study
        if (!profession) {
          return res.status(400).json({ errors: [{ msg: 'Please provide your profession' }] });
        }
        userProfession = profession;
      }
      // --- End Conditional Logic ---


      // hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // create new user
      const newUser = new User({
        name,
        email,
        passwordHash,
        city,
        isStudent,
        university: finalUniversityId,
        yearOfStudy: userYearOfStudy,
        profession: userProfession
      });
      await newUser.save();

      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);


// ==========================
// 📌 Login Route
// ==========================
router.post(
  '/login',
  [
    check('email', 'Valid email required').isEmail().normalizeEmail(),
    check('password', 'Password is required').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          isStudent: user.isStudent,
          university: user.university,
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
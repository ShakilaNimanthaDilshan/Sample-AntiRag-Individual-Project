const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();

// ==========================
// 📌 Register Route (with validation)
// ==========================
router.post(
  '/register',
  [
    check('name', 'Name is required').notEmpty(),
    // --- THIS IS THE FIX ---
    // Added .normalizeEmail() for stricter validation
    check('email', 'Valid email required').isEmail().normalizeEmail(),
    // --- END OF FIX ---
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('university', 'University is required').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password, university } = req.body;

      // check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ message: 'Email already exists' });

      // hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // create new user
      const newUser = new User({ name, email, passwordHash, university });
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
    check('email', 'Valid email required').isEmail().normalizeEmail(), // Also added normalizeEmail here
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
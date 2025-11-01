// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  createdAt: { type: Date, default: Date.now },

  // --- NEW AND UPDATED FIELDS ---
  city: { type: String },
  isStudent: { type: Boolean, default: true },
  
  // This is now optional
  university: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'University',
    required: false // No longer required for everyone
  }, 

  // For students
  yearOfStudy: { type: String, required: false },

  // For non-students
  profession: { type: String, required: false }
  // --- END OF NEW FIELDS ---
});

module.exports = mongoose.model('User', userSchema);
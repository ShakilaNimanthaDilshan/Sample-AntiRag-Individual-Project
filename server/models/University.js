const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String },
  contacts: {
    emergencyPhone: String,
    counsellingPhone: String,
    email: String
  },
  // --- ADDED ---
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'approved'
  },
  // --- END ADD ---
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('University', universitySchema);
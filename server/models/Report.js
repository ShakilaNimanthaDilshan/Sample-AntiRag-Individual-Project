const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: { type: String },
  body: { type: String, required: true },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  anonymous: { type: Boolean, default: false },

  // ✅ Updated media field: now supports full objects with validation
  media: [
    {
      url: { type: String, required: true },
      type: {
        type: String,
        enum: ['image', 'file'],
        default: 'image'
      }
    }
  ],

  status: {
    type: String,
    enum: ['pending', 'verified'],
    default: 'pending'
  },

  // Added fields
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  flags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
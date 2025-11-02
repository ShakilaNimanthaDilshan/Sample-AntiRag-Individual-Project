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

  isPublic: { type: Boolean, default: true },

  // Added fields
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  flags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  createdAt: { type: Date, default: Date.now }
});

// --- ADD THIS LINE ---
// This tells MongoDB to create a text index on the title and body fields
reportSchema.index({ title: 'text', body: 'text' });
// --- END OF ADD ---

module.exports = mongoose.model('Report', reportSchema);